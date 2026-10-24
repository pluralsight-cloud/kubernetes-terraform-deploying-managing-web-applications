variable "aws_region" {
  description = "AWS region of the EKS cluster and ECR repository."
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "Existing EKS cluster that hosts the application."
  type        = string
  default     = "demo-eks-cluster"
}

variable "image" {
  description = "Container image to run, including the registry and tag."
  type        = string
}

variable "admin_email" {
  description = "Seeded admin email. The password is generated and stored in the app Secret."
  type        = string
  default     = "admin@globomantics.local"
}

variable "app_replicas" {
  description = "Number of Globomantics pods."
  type        = number
  default     = 2
}

variable "quota_requests_cpu" {
  description = "Namespace ResourceQuota hard requests.cpu."
  type        = string
  default     = "2"
}

variable "quota_requests_memory" {
  description = "Namespace ResourceQuota hard requests.memory."
  type        = string
  default     = "4Gi"
}

variable "quota_limits_cpu" {
  description = "Namespace ResourceQuota hard limits.cpu."
  type        = string
  default     = "4"
}

variable "quota_limits_memory" {
  description = "Namespace ResourceQuota hard limits.memory."
  type        = string
  default     = "8Gi"
}

variable "quota_pods" {
  description = "Namespace ResourceQuota hard pods."
  type        = string
  default     = "10"
}

variable "limit_default_cpu" {
  description = "LimitRange default CPU limit."
  type        = string
  default     = "500m"
}

variable "limit_default_memory" {
  description = "LimitRange default memory limit."
  type        = string
  default     = "512Mi"
}

variable "limit_default_request_cpu" {
  description = "LimitRange default CPU request."
  type        = string
  default     = "100m"
}

variable "limit_default_request_memory" {
  description = "LimitRange default memory request."
  type        = string
  default     = "256Mi"
}

variable "mongodb_chart_version" {
  description = "Bitnami MongoDB Helm chart version."
  type        = string
  default     = "16.5.45"
}

variable "mongodb_image_tag" {
  description = "bitnamilegacy/mongodb image tag."
  type        = string
  default     = "7.0.8-debian-12-r2"
}

variable "mongodb_persistence_size" {
  description = "MongoDB persistent volume size."
  type        = string
  default     = "8Gi"
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
