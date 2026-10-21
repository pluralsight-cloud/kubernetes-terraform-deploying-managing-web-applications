variable "cluster_name" {
  description = "EKS cluster name passed to the AWS Load Balancer Controller."
  type        = string
}

variable "region" {
  description = "AWS region of the EKS cluster."
  type        = string
}

variable "vpc_id" {
  description = "VPC ID the controller uses for the load balancer."
  type        = string
}

variable "aws_load_balancer_controller_role_arn" {
  description = "IRSA role ARN for the controller service account."
  type        = string
}

variable "internet_gateway_id" {
  description = "Internet gateway that must remain until the shared load balancer is deleted."
  type        = string
}
