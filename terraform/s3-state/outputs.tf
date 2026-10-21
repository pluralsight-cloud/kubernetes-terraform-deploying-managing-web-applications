output "bucket_name" {
  description = "Name of the S3 bucket for app Terraform state."
  value       = aws_s3_bucket.state.id
}

output "bucket_region" {
  description = "Region of the app Terraform state bucket."
  value       = var.aws_region
}
