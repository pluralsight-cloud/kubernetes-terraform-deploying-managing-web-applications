variable "name" {
  description = "Helm release name. The MongoDB Service is <name>-mongodb."
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace for the MongoDB release."
  type        = string
}

variable "chart_version" {
  description = "Bitnami MongoDB Helm chart version."
  type        = string
  default     = "16.5.45"
}

variable "image_tag" {
  description = "bitnamilegacy/mongodb image tag."
  type        = string
  default     = "7.0.8-debian-12-r2"
}

variable "persistence_size" {
  description = "Persistent volume size for MongoDB."
  type        = string
  default     = "8Gi"
}
