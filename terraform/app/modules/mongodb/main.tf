resource "random_password" "root" {
  length  = 32
  special = false
}

# The EBS CSI driver does not create a default StorageClass. Without one the
# MongoDB volume stays Pending and Helm hits its wait timeout.
resource "kubernetes_storage_class_v1" "ebs" {
  metadata {
    name = "ebs-gp3"
  }

  storage_provisioner    = "ebs.csi.aws.com"
  reclaim_policy         = "Delete"
  volume_binding_mode    = "WaitForFirstConsumer"
  allow_volume_expansion = true

  parameters = {
    type   = "gp3"
    fsType = "ext4"
  }
}

# Standalone MongoDB. The chart's default image no longer pulls, so the tag is pinned on bitnamilegacy.
resource "helm_release" "this" {
  name       = var.name
  repository = "oci://registry-1.docker.io/bitnamicharts"
  chart      = "mongodb"
  version    = var.chart_version
  namespace  = var.namespace
  timeout    = 600

  values = [
    yamlencode({
      architecture = "standalone"
      image = {
        registry   = "docker.io"
        repository = "bitnamilegacy/mongodb"
        tag        = var.image_tag
      }
      global = {
        security = {
          allowInsecureImages = true
        }
      }
      auth = {
        enabled = true
      }
      persistence = {
        enabled      = true
        size         = var.persistence_size
        storageClass = kubernetes_storage_class_v1.ebs.metadata[0].name
      }
      resources = {
        requests = {
          cpu    = "250m"
          memory = "512Mi"
        }
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
      }
    })
  ]

  set_sensitive {
    name  = "auth.rootPassword"
    value = random_password.root.result
  }
}
