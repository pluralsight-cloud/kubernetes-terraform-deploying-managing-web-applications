variable "name" {
  description = "Application name used for Deployment, Service, Ingress, and ServiceAccount."
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace for the application."
  type        = string
}

variable "image" {
  description = "Full container image reference, including tag."
  type        = string
}

variable "replicas" {
  description = "Number of application pods."
  type        = number
  default     = 2
}

variable "mongodb_uri" {
  description = "MongoDB connection string stored in Secrets Manager."
  type        = string
  sensitive   = true
}

variable "nextauth_url" {
  description = "Public application URL for NextAuth."
  type        = string
}

variable "admin_email" {
  description = "Admin email stored in Secrets Manager."
  type        = string
}

variable "cluster_name" {
  description = "EKS cluster name used in the Secrets Manager secret path."
  type        = string
}

variable "aws_region" {
  description = "AWS region for the SecretProviderClass."
  type        = string
}

variable "oidc_provider_arn" {
  description = "EKS OIDC provider ARN for the app IRSA role."
  type        = string
}

variable "secrets_manager_read_policy_arn" {
  description = "IAM policy ARN that allows reading secrets under eks/<cluster>/."
  type        = string
}

variable "ingress_group_name" {
  description = "ALB Ingress group shared with the cluster Ingress."
  type        = string
  default     = "demo"
}

variable "ingress_class_name" {
  description = "Ingress class for the AWS Load Balancer Controller."
  type        = string
  default     = "alb"
}

variable "ingress_path" {
  description = "HTTP path served by the application."
  type        = string
  default     = "/"
}

variable "ingress_group_order" {
  description = "ALB group order. Lower values win over the shared catch-all."
  type        = string
  default     = "10"
}

variable "tags" {
  description = "Tags applied to IAM and Secrets Manager resources."
  type        = map(string)
  default     = {}
}
