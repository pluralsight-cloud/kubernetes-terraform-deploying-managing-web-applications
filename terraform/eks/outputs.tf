output "eks_cluster_name" {
  description = "EKS cluster name for kubectl and aws eks commands."
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS API server endpoint URL."
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_certificate_authority_data" {
  description = "Base64-encoded certificate authority data for kubeconfig."
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "update_kubeconfig_command" {
  description = "Shell command to configure kubectl for this cluster."
  value       = "aws eks update-kubeconfig --region ${data.aws_region.current.name} --name ${module.eks.cluster_name}"
}

output "ecr_repository_url" {
  description = "ECR repository URL for CI/CD image push."
  value       = module.ecr.repository_url
}

output "ecr_login_command" {
  description = "Shell command to authenticate Docker to this account's ECR registry."
  value       = "aws ecr get-login-password --region ${data.aws_region.current.name} | docker login --username AWS --password-stdin ${split("/", module.ecr.repository_url)[0]}"
}

output "alb_dns_name" {
  description = "AWS-generated hostname of the shared internet-facing ALB."
  value       = module.ingress.alb_dns_name
}

output "ingress_group_name" {
  description = "Ingress group name later apps use to share this ALB."
  value       = module.ingress.ingress_group_name
}

output "ingress_class_name" {
  description = "Ingress class later apps set on their Ingress resources."
  value       = module.ingress.ingress_class_name
}

output "oidc_provider_arn" {
  description = "IAM OIDC provider ARN for IRSA."
  value       = module.eks.oidc_provider_arn
}

output "secrets_manager_read_policy_arn" {
  description = "IAM policy ARN apps attach to IRSA roles to read Secrets Manager secrets under eks/<cluster>/."
  value       = module.secrets_store.secrets_manager_read_policy_arn
}

output "secrets_manager_read_policy_name" {
  description = "IAM policy name for cluster-scoped Secrets Manager reads."
  value       = module.secrets_store.secrets_manager_read_policy_name
}

output "secrets_manager_name_prefix" {
  description = "Secrets Manager name prefix for this cluster (eks/<cluster>/)."
  value       = module.secrets_store.secret_name_prefix
}
