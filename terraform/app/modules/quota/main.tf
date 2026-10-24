resource "kubernetes_resource_quota_v1" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  spec {
    hard = {
      "requests.cpu"    = var.quota.requests_cpu
      "requests.memory" = var.quota.requests_memory
      "limits.cpu"      = var.quota.limits_cpu
      "limits.memory"   = var.quota.limits_memory
      "pods"            = var.quota.pods
    }
  }
}

resource "kubernetes_limit_range_v1" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  spec {
    limit {
      type = "Container"

      default = {
        cpu    = var.limit_range.default_cpu
        memory = var.limit_range.default_memory
      }

      default_request = {
        cpu    = var.limit_range.default_request_cpu
        memory = var.limit_range.default_request_memory
      }
    }
  }
}
