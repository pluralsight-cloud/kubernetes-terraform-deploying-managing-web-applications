variable "aws_region" {
  description = "AWS region of the EKS cluster."
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "Existing EKS cluster that hosts SearXNG."
  type        = string
  default     = "demo-eks-cluster"
}

variable "image" {
  description = "SearXNG container image, including registry and tag."
  type        = string
  default     = "searxng/searxng:latest"
}

variable "replicas" {
  description = "Number of SearXNG pods."
  type        = number
  default     = 1
}

variable "quota_requests_cpu" {
  description = "Namespace ResourceQuota hard requests.cpu."
  type        = string
  default     = "1"
}

variable "quota_requests_memory" {
  description = "Namespace ResourceQuota hard requests.memory."
  type        = string
  default     = "1Gi"
}

variable "quota_limits_cpu" {
  description = "Namespace ResourceQuota hard limits.cpu."
  type        = string
  default     = "2"
}

variable "quota_limits_memory" {
  description = "Namespace ResourceQuota hard limits.memory."
  type        = string
  default     = "2Gi"
}

variable "quota_pods" {
  description = "Namespace ResourceQuota hard pods."
  type        = string
  default     = "5"
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
  description = "HTTP path served by SearXNG."
  type        = string
  default     = "/searxng"
}

variable "ingress_group_order" {
  description = "ALB group order. Lower values win over the shared catch-all."
  type        = string
  default     = "20"
}
