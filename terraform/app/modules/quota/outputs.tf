output "resource_quota_name" {
  description = "Name of the ResourceQuota."
  value       = kubernetes_resource_quota_v1.this.metadata[0].name
}

output "limit_range_name" {
  description = "Name of the LimitRange."
  value       = kubernetes_limit_range_v1.this.metadata[0].name
}
