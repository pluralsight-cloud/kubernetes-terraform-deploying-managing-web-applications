output "service_name" {
  description = "ClusterDNS Service name for MongoDB."
  value       = "${var.name}-mongodb"
}

output "root_password" {
  description = "MongoDB root password."
  value       = random_password.root.result
  sensitive   = true
}

output "release_name" {
  description = "Helm release name."
  value       = helm_release.this.name
}
