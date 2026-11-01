resource "random_password" "secret" {
  length  = 32
  special = false
}

resource "kubernetes_secret_v1" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  data = {
    SEARXNG_SECRET = random_password.secret.result
  }
}

resource "kubernetes_service_v1" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  spec {
    selector = {
      app = var.name
    }

    port {
      name        = "http"
      port        = 80
      target_port = 8080
    }
  }
}

resource "kubernetes_ingress_v1" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
    annotations = {
      "alb.ingress.kubernetes.io/scheme"      = "internet-facing"
      "alb.ingress.kubernetes.io/target-type" = "ip"
      "alb.ingress.kubernetes.io/group.name"  = var.ingress_group_name
      "alb.ingress.kubernetes.io/group.order" = var.ingress_group_order
    }
  }

  spec {
    ingress_class_name = var.ingress_class_name

    rule {
      http {
        path {
          path      = var.ingress_path
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service_v1.this.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_deployment_v1" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
    labels = {
      app = var.name
    }
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = var.name
      }
    }

    template {
      metadata {
        labels = {
          app = var.name
        }
      }

      spec {
        container {
          name  = var.name
          image = var.image

          port {
            name           = "http"
            container_port = 8080
          }

          env {
            name  = "SEARXNG_BASE_URL"
            value = var.base_url
          }

          env {
            name = "SEARXNG_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.this.metadata[0].name
                key  = "SEARXNG_SECRET"
              }
            }
          }

          volume_mount {
            name       = "cache"
            mount_path = "/var/cache/searxng"
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          startup_probe {
            http_get {
              path = "/"
              port = 8080
            }
            period_seconds    = 5
            failure_threshold = 30
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 8080
            }
            period_seconds = 10
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 8080
            }
            period_seconds = 10
          }
        }

        volume {
          name = "cache"
          empty_dir {}
        }
      }
    }
  }

  depends_on = [kubernetes_secret_v1.this]
}
