locals {
  common_tags = {
    Environment = "demo"
    Project     = "app"
    ManagedBy   = "terraform"
  }

  app_name = "globomantics"
}

data "aws_eks_cluster" "this" {
  name = var.cluster_name
}

data "aws_iam_openid_connect_provider" "eks" {
  url = data.aws_eks_cluster.this.identity[0].oidc[0].issuer
}

data "aws_iam_policy" "secrets_manager_read" {
  name = "${var.cluster_name}-secrets-manager-read"
}

data "kubernetes_ingress_v1" "public" {
  metadata {
    name      = "public"
    namespace = "ingress"
  }
}

resource "kubernetes_namespace_v1" "globomantics" {
  metadata {
    name = local.app_name
  }
}

module "quota" {
  source = "./modules/quota"

  name      = local.app_name
  namespace = kubernetes_namespace_v1.globomantics.metadata[0].name

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

module "mongodb" {
  source = "./modules/mongodb"

  name             = local.app_name
  namespace        = kubernetes_namespace_v1.globomantics.metadata[0].name
  chart_version    = var.mongodb_chart_version
  image_tag        = var.mongodb_image_tag
  persistence_size = var.mongodb_persistence_size

  depends_on = [
    kubernetes_namespace_v1.globomantics,
    module.quota,
  ]
}

module "app" {
  source = "./modules/app"

  name         = local.app_name
  namespace    = kubernetes_namespace_v1.globomantics.metadata[0].name
  image        = var.image
  replicas     = var.app_replicas
  admin_email  = var.admin_email
  nextauth_url = "http://${data.kubernetes_ingress_v1.public.status[0].load_balancer[0].ingress[0].hostname}"
  mongodb_uri  = "mongodb://root:${module.mongodb.root_password}@${module.mongodb.service_name}:27017/globomantics?authSource=admin"

  cluster_name                    = var.cluster_name
  aws_region                      = var.aws_region
  oidc_provider_arn               = data.aws_iam_openid_connect_provider.eks.arn
  secrets_manager_read_policy_arn = data.aws_iam_policy.secrets_manager_read.arn
  tags                            = local.common_tags

  ingress_group_name  = var.ingress_group_name
  ingress_class_name  = var.ingress_class_name
  ingress_path        = var.ingress_path
  ingress_group_order = var.ingress_group_order

  depends_on = [
    kubernetes_namespace_v1.globomantics,
    module.quota,
    module.mongodb,
  ]
}
