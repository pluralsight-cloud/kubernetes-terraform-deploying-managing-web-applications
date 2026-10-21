variable "cluster_name" {
  description = "EKS cluster name used in the Secrets Manager IAM policy resource prefix."
  type        = string
}

variable "aws_region" {
  description = "AWS region for the Secrets Manager resource ARN pattern."
  type        = string
}

variable "tags" {
  description = "Tags applied to the Secrets Manager read IAM policy."
  type        = map(string)
  default     = {}
}
