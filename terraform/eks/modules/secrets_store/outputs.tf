output "secrets_manager_read_policy_arn" {
  description = "IAM policy ARN for reading Secrets Manager secrets under eks/<cluster>/."
  value       = aws_iam_policy.secrets_manager_read.arn
}

output "secrets_manager_read_policy_name" {
  description = "IAM policy name for reading cluster-scoped Secrets Manager secrets."
  value       = aws_iam_policy.secrets_manager_read.name
}

output "secret_name_prefix" {
  description = "Secrets Manager name prefix apps should use (eks/<cluster>/)."
  value       = "eks/${var.cluster_name}/"
}
