variable "name" {
  description = "Application name used for Deployment, Service, Ingress, and Secret."
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace for SearXNG."
  type        = string
}

variable "image" {
  description = "Full container image reference, including tag."
  type        = string
}

variable "replicas" {
  description = "Number of SearXNG pods."
  type        = number
  default     = 1
}

variable "base_url" {
  description = "Public base URL for SearXNG (SEARXNG_BASE_URL), including path and trailing slash."
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
  description = "HTTP path served by SearXNG."
  type        = string
  default     = "/searxng"
}

variable "ingress_group_order" {
  description = "ALB group order. Lower values win over the shared catch-all."
  type        = string
  default     = "20"
}
