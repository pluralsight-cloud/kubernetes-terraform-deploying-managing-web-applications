data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  common_tags = {
    Environment = "demo"
    Project     = "globomantics"
    ManagedBy   = "terraform"
  }
  cluster_name = "demo-eks-cluster"
}

# Dedicated VPC: public/private subnets, NAT, and IGW for EKS.
module "vpc" {
  source = "./modules/vpc"

  name     = "${local.cluster_name}-vpc"
  vpc_cidr = var.vpc_cidr
  tags     = local.common_tags
}

# ECR repository for globomantics container images.
module "ecr" {
  source = "./modules/ecr"

  repository_name = "globomantics"
  tags            = local.common_tags
}

# EKS cluster, node group, add-ons, OIDC, and access entries.
module "eks" {
  source = "./modules/eks"

  cluster_name                 = local.cluster_name
  cluster_version              = var.cluster_version
  vpc_id                       = module.vpc.vpc_id
  private_subnet_ids           = module.vpc.private_subnet_ids
  public_subnet_ids            = module.vpc.public_subnet_ids
  cluster_admin_principal_arns = var.cluster_admin_principal_arns
  tags                         = local.common_tags
}

# AWS Load Balancer Controller and shared internet-facing Ingress.
module "ingress" {
  source = "./modules/ingress"

  cluster_name                          = module.eks.cluster_name
  region                                = data.aws_region.current.name
  vpc_id                                = module.vpc.vpc_id
  aws_load_balancer_controller_role_arn = module.eks.aws_load_balancer_controller_role_arn
  internet_gateway_id                   = module.vpc.igw_id

  depends_on = [module.eks]
}

# Secrets Store CSI Driver, AWS provider (ASCP), and Secrets Manager read IAM policy.
module "secrets_store" {
  source = "./modules/secrets_store"

  cluster_name = module.eks.cluster_name
  aws_region   = data.aws_region.current.name
  tags         = local.common_tags

  depends_on = [module.eks]
}
