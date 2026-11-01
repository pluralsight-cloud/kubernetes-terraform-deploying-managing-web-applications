locals {
  common_tags = {
    Environment = "demo"
    Project     = "searxng"
    ManagedBy   = "terraform"
  }

  name = "searxng"
}

data "aws_eks_cluster" "this" {
  name = var.cluster_name
}

data "kubernetes_ingress_v1" "public" {
  metadata {
    name      = "public"
    namespace = "ingress"
  }
}

resource "kubernetes_namespace_v1" "searxng" {
  metadata {
    name = local.name
  }
}

module "quota" {
  source = "../app/modules/quota"

  name      = local.name
  namespace = kubernetes_namespace_v1.searxng.metadata[0].name

  quota = {
    requests_cpu    = var.quota_requests_cpu
    requests_memory = var.quota_requests_memory
    limits_cpu      = var.quota_limits_cpu
    limits_memory   = var.quota_limits_memory
    pods            = var.quota_pods
  }

  limit_range = {
    default_cpu            = var.limit_default_cpu
    default_memory         = var.limit_default_memory
    default_request_cpu    = var.limit_default_request_cpu
    default_request_memory = var.limit_default_request_memory
  }
}

module "searxng" {
  source = "./modules/searxng"

  name      = local.name
  namespace = kubernetes_namespace_v1.searxng.metadata[0].name
  image     = var.image
  replicas  = var.replicas
  base_url  = "http://${data.kubernetes_ingress_v1.public.status[0].load_balancer[0].ingress[0].hostname}${var.ingress_path}/"

  ingress_group_name  = var.ingress_group_name
  ingress_class_name  = var.ingress_class_name
  ingress_path        = var.ingress_path
  ingress_group_order = var.ingress_group_order

  depends_on = [
    kubernetes_namespace_v1.searxng,
    module.quota,
  ]
}
