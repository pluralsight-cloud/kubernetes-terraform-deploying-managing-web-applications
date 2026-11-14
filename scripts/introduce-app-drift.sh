#!/usr/bin/env bash
# Scale the Globomantics Deployment outside Terraform so plan can detect drift.
set -euo pipefail

NAMESPACE="${NAMESPACE:-globomantics}"
DEPLOYMENT="${DEPLOYMENT:-globomantics}"
REPLICAS="${REPLICAS:-5}"

if ! kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE" >/dev/null 2>&1; then
  echo "Deployment ${NAMESPACE}/${DEPLOYMENT} not found." >&2
  echo "Apply terraform/app and ensure kubectl points at demo-eks-cluster." >&2
  exit 1
fi

CURRENT="$(kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')"
echo "Current replicas: ${CURRENT}"
kubectl scale "deployment/${DEPLOYMENT}" -n "$NAMESPACE" --replicas="$REPLICAS"
echo "Scaled ${NAMESPACE}/${DEPLOYMENT} to ${REPLICAS} replicas."
echo
TARGET='module.app.kubernetes_deployment_v1.this'
echo "Next steps:"
echo "  cd terraform/app"
echo "  terraform plan"
echo "  terraform apply"