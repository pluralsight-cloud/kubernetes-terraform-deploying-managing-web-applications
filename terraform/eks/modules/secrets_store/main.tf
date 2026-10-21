data "aws_caller_identity" "current" {}

locals {
  policy_name       = "${var.cluster_name}-secrets-manager-read"
  secret_arn_prefix = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:eks/${var.cluster_name}/*"
}

# Secrets Store CSI Driver (syncs mounted secrets into Kubernetes Secrets).
resource "helm_release" "secrets_store_csi_driver" {
  name       = "csi-secrets-store"
  repository = "https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts"
  chart      = "secrets-store-csi-driver"
  namespace  = "kube-system"
  version    = "1.6.1"

  set {
    name  = "syncSecret.enabled"
    value = "true"
  }

  set {
    name  = "enableSecretRotation"
    value = "true"
  }

  # Kubelet only attaches a service account token when the CSIDriver asks for
  # one. The AWS provider reads that token to call STS.
  set {
    name  = "tokenRequests[0].audience"
    value = "sts.amazonaws.com"
  }
}

# AWS Secrets and Configuration Provider (ASCP) for Secrets Manager.
resource "helm_release" "secrets_store_csi_driver_provider_aws" {
  name       = "secrets-provider-aws"
  repository = "https://aws.github.io/secrets-store-csi-driver-provider-aws"
  chart      = "secrets-store-csi-driver-provider-aws"
  namespace  = "kube-system"
  version    = "3.1.3"

  set {
    name  = "secrets-store-csi-driver.install"
    value = "false"
  }

  depends_on = [helm_release.secrets_store_csi_driver]
}

# Reusable policy for app IRSA roles: read secrets under eks/<cluster_name>/*.
resource "aws_iam_policy" "secrets_manager_read" {
  name        = local.policy_name
  description = "Allow GetSecretValue and DescribeSecret for secrets under eks/${var.cluster_name}/"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadClusterSecrets"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
        ]
        Resource = local.secret_arn_prefix
      }
    ]
  })

  tags = var.tags
}
