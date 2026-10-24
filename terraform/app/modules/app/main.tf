resource "random_password" "auth" {
  length  = 32
  special = false
}

resource "random_password" "admin" {
  length  = 24
  special = false
}

locals {
  secret_name = "eks/${var.cluster_name}/${var.name}"
  secret_keys = [
    "MONGODB_URI",
    "AUTH_SECRET",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
  ]
}

resource "aws_secretsmanager_secret" "this" {
  name                    = local.secret_name
  description             = "Globomantics application secrets for ${var.cluster_name}"
  recovery_window_in_days = 0

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "this" {
  secret_id = aws_secretsmanager_secret.this.id
  secret_string = jsonencode({
    MONGODB_URI     = var.mongodb_uri
    AUTH_SECRET     = random_password.auth.result
    NEXTAUTH_SECRET = random_password.auth.result
    NEXTAUTH_URL    = var.nextauth_url
    ADMIN_EMAIL     = var.admin_email
    ADMIN_PASSWORD  = random_password.admin.result
  })
}

module "irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name = "${var.cluster_name}-${var.name}"

  role_policy_arns = {
    secrets = var.secrets_manager_read_policy_arn
  }

  oidc_providers = {
    main = {
      provider_arn               = var.oidc_provider_arn
      namespace_service_accounts = ["${var.namespace}:${var.name}"]
    }
  }

  tags = var.tags
}

resource "kubernetes_service_account_v1" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
    annotations = {
      "eks.amazonaws.com/role-arn" = module.irsa.iam_role_arn
    }
  }
}

resource "kubernetes_manifest" "secret_provider_class" {
  manifest = {
    apiVersion = "secrets-store.csi.x-k8s.io/v1"
    kind       = "SecretProviderClass"
    metadata = {
      name      = var.name
      namespace = var.namespace
    }
    spec = {
      provider = "aws"
      parameters = {
        region = var.aws_region
        objects = yamlencode([
          {
            objectName = local.secret_name
            objectType = "secretsmanager"
            jmesPath = [
              for key in local.secret_keys : {
                path        = key
                objectAlias = key
              }
            ]
          }
        ])
      }
      secretObjects = [
        {
          secretName = var.name
          type       = "Opaque"
          data = [
            for key in local.secret_keys : {
              objectName = key
              key        = key
            }
          ]
        }
      ]
    }
  }

  depends_on = [
    aws_secretsmanager_secret_version.this,
    kubernetes_service_account_v1.this,
  ]
}

resource "kubernetes_deployment_v1" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
    labels = {
      app = var.name
    }
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = var.name
      }
    }

    template {
      metadata {
        labels = {
          app = var.name
        }
      }

      spec {
        service_account_name = kubernetes_service_account_v1.this.metadata[0].name

        container {
          name  = var.name
          image = var.image

          port {
            name           = "http"
            container_port = 3000
          }

          volume_mount {
            name       = "secrets-store"
            mount_path = "/mnt/secrets-store"
            read_only  = true
          }

          env {
            name = "MONGODB_URI"
            value_from {
              secret_key_ref {
                name = var.name
                key  = "MONGODB_URI"
              }
            }
          }

          env {
            name = "AUTH_SECRET"
            value_from {
              secret_key_ref {
                name = var.name
                key  = "AUTH_SECRET"
              }
            }
          }

          env {
            name = "NEXTAUTH_SECRET"
            value_from {
              secret_key_ref {
                name = var.name
                key  = "NEXTAUTH_SECRET"
              }
            }
          }

          env {
            name = "NEXTAUTH_URL"
            value_from {
              secret_key_ref {
                name = var.name
                key  = "NEXTAUTH_URL"
              }
            }
          }

          env {
            name = "ADMIN_EMAIL"
            value_from {
              secret_key_ref {
                name = var.name
                key  = "ADMIN_EMAIL"
              }
            }
          }

          env {
            name = "ADMIN_PASSWORD"
            value_from {
              secret_key_ref {
                name = var.name
                key  = "ADMIN_PASSWORD"
              }
            }
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          startup_probe {
            http_get {
              path = "/api/health"
              port = 3000
            }
            period_seconds    = 5
            failure_threshold = 30
          }

          liveness_probe {
            http_get {
              path = "/api/health"
              port = 3000
            }
            period_seconds = 10
          }

          readiness_probe {
            http_get {
              path = "/api/health"
              port = 3000
            }
            period_seconds = 10
          }
        }

        volume {
          name = "secrets-store"
          csi {
            driver    = "secrets-store.csi.k8s.io"
            read_only = true
            volume_attributes = {
              secretProviderClass = var.name
            }
          }
        }
      }
    }
  }

  depends_on = [kubernetes_manifest.secret_provider_class]
}

resource "kubernetes_service_v1" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  spec {
    selector = {
      app = var.name
    }

    port {
      name        = "http"
      port        = 80
      target_port = 3000
    }
  }
}

resource "kubernetes_ingress_v1" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
    annotations = {
      "alb.ingress.kubernetes.io/scheme"      = "internet-facing"
      "alb.ingress.kubernetes.io/target-type" = "ip"
      "alb.ingress.kubernetes.io/group.name"  = var.ingress_group_name
      "alb.ingress.kubernetes.io/group.order" = var.ingress_group_order
    }
  }

  spec {
    ingress_class_name = var.ingress_class_name

    rule {
      http {
        path {
          path      = var.ingress_path
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service_v1.this.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}
