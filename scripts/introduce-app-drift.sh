#!/usr/bin/env bash
# Scale the Globomantics Deployment outside Terraform so plan can detect drift.
set -euo pipefail

# Terraform talks to EKS directly. Use that cluster even when the current
# kubectl context is something else, such as docker-desktop.
CLUSTER="${CLUSTER:-demo-eks-cluster}"
ENVIRONMENT="${ENVIRONMENT:-default}"
NAMESPACE="${NAMESPACE:-globomantics-${ENVIRONMENT}}"
DEPLOYMENT="${DEPLOYMENT:-globomantics-${ENVIRONMENT}}"
REPLICAS="${REPLICAS:-5}"

CONTEXT="${KUBE_CONTEXT:-}"
if [[ -z "$CONTEXT" ]]; then
  # Avoid a leading slash in the pattern. Git Bash rewrites those as Windows paths.
  CONTEXT="$(
    kubectl config get-contexts -o name | while IFS= read -r name; do
      name="${name//$'\r'/}"
      case "$name" in
        *:cluster/"$CLUSTER") printf '%s\n' "$name"; break ;;
      esac
    done
  )"
fi

if [[ -z "$CONTEXT" ]]; then
  echo "No kubectl context found for cluster ${CLUSTER}." >&2
  echo "Run: aws eks update-kubeconfig --name ${CLUSTER} --region us-east-1" >&2
  exit 1
fi

if ! kubectl --context "$CONTEXT" get deployment "$DEPLOYMENT" -n "$NAMESPACE" >/dev/null 2>&1; then
  echo "Deployment ${NAMESPACE}/${DEPLOYMENT} not found on ${CLUSTER}." >&2
  echo "kubectl context: ${CONTEXT}" >&2
  echo "Apply terraform/app, then rerun this script." >&2
  exit 1
fi

CURRENT="$(kubectl --context "$CONTEXT" get deployment "$DEPLOYMENT" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')"
echo "Cluster: ${CLUSTER}"
echo "Context: ${CONTEXT}"
echo "Current replicas: ${CURRENT}"
kubectl --context "$CONTEXT" scale "deployment/${DEPLOYMENT}" -n "$NAMESPACE" --replicas="$REPLICAS"
echo "Scaled ${NAMESPACE}/${DEPLOYMENT} to ${REPLICAS} replicas."
echo
TARGET='module.app.kubernetes_deployment_v1.this'
echo "Next steps:"
echo "  cd terraform/app"
echo "  terraform plan"
echo "  terraform apply"