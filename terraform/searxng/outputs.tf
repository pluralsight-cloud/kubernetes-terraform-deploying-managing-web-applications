output "searxng_url" {
  description = "HTTP URL of SearXNG on the shared ALB."
  value       = "http://${data.kubernetes_ingress_v1.public.status[0].load_balancer[0].ingress[0].hostname}${var.ingress_path}"
}

output "namespace" {
  description = "Kubernetes namespace for SearXNG."
  value       = kubernetes_namespace_v1.searxng.metadata[0].name
}

output "service_name" {
  description = "ClusterIP Service name for SearXNG."
  value       = module.searxng.service_name
}
