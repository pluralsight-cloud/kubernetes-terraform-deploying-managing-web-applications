variable "name" {
  description = "Name used for the ResourceQuota and LimitRange objects."
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace to constrain."
  type        = string
}

variable "quota" {
  description = "Hard ResourceQuota limits for the namespace."
  type = object({
    requests_cpu    = string
    requests_memory = string
    limits_cpu      = string
    limits_memory   = string
    pods            = string
  })
}

variable "limit_range" {
  description = "Default container requests and limits for the LimitRange."
  type = object({
    default_cpu            = string
    default_memory         = string
    default_request_cpu    = string
    default_request_memory = string
  })
}
