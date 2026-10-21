# Shared internet-facing ALB. Later app stacks join group "demo" with ingress class "alb".

locals {
  ingress_group_name = "demo"
  ingress_class_name = "alb"
}

# Resource reference so Terraform deletes the Ingress and its load balancer
# before detaching the internet gateway. A module depends_on would hide the
# caller identity from the EKS access-entry for_each during plan.
resource "terraform_data" "internet_gateway" {
  input = var.internet_gateway_id
}

resource "helm_release" "aws_load_balancer_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"
  version    = "3.5.0"

  set {
    name  = "clusterName"
    value = var.cluster_name
  }

  set {
    name  = "region"
    value = var.region
  }

  set {
    name  = "vpcId"
    value = var.vpc_id
  }

  set {
    name  = "serviceAccount.create"
    value = "true"
  }

  set {
    name  = "serviceAccount.name"
    value = "aws-load-balancer-controller"
  }

  set {
    name  = "serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = var.aws_load_balancer_controller_role_arn
  }
}

resource "kubernetes_namespace_v1" "ingress" {
  metadata {
    name = "ingress"
  }

  depends_on = [helm_release.aws_load_balancer_controller]
}

resource "kubernetes_ingress_v1" "public" {
  wait_for_load_balancer = true

  metadata {
    name      = "public"
    namespace = kubernetes_namespace_v1.ingress.metadata[0].name
    annotations = {
      "alb.ingress.kubernetes.io/scheme"      = "internet-facing"
      "alb.ingress.kubernetes.io/target-type" = "ip"
      "alb.ingress.kubernetes.io/group.name"  = local.ingress_group_name
      "alb.ingress.kubernetes.io/group.order" = "1000"
      "alb.ingress.kubernetes.io/listen-ports" = jsonencode([{
        HTTP = 80
      }])
      "alb.ingress.kubernetes.io/actions.default-404" = jsonencode({
        type = "fixed-response"
        fixedResponseConfig = {
          contentType = "text/plain"
          statusCode  = "404"
          messageBody = "no route"
        }
      })
    }
  }

  spec {
    ingress_class_name = local.ingress_class_name

    rule {
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = "default-404"
              port {
                name = "use-annotation"
              }
            }
          }
        }
      }
    }
  }

  # The controller finalizer often never clears, so Terraform waits until
  # "Ingress still exists". This removes the load balancer, its security
  # groups, and the finalizer before Terraform deletes the object.
  provisioner "local-exec" {
    when    = destroy
    command = <<-EOT
      python3 modules/ingress/cleanup.py \
        ${self.metadata[0].namespace} \
        ${self.metadata[0].name} \
        ${self.metadata[0].annotations["alb.ingress.kubernetes.io/group.name"]}
    EOT
  }

  depends_on = [
    helm_release.aws_load_balancer_controller,
    terraform_data.internet_gateway,
  ]
}
