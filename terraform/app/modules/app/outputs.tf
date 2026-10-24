output "admin_password" {
  description = "Generated admin password stored in Secrets Manager."
  value       = random_password.admin.result
  sensitive   = true
}

output "service_name" {
  description = "ClusterIP Service name."
  value       = kubernetes_service_v1.this.metadata[0].name
}

output "secrets_manager_secret_arn" {
  description = "ARN of the Secrets Manager secret for this application."
  value       = aws_secretsmanager_secret.this.arn
}

output "secrets_manager_secret_name" {
  description = "Name of the Secrets Manager secret for this application."
  value       = aws_secretsmanager_secret.this.name
}
