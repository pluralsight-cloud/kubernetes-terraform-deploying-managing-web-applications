output "app_url" {
  description = "HTTP URL of the shared ALB that serves the application."
  value       = "http://${data.kubernetes_ingress_v1.public.status[0].load_balancer[0].ingress[0].hostname}"
}

output "admin_email" {
  description = "Admin email stored in Secrets Manager."
  value       = var.admin_email
}

output "admin_password" {
  description = "Generated admin password stored in Secrets Manager."
  value       = module.app.admin_password
  sensitive   = true
}

output "secrets_manager_secret_name" {
  description = "Secrets Manager secret name for Globomantics."
  value       = module.app.secrets_manager_secret_name
}
