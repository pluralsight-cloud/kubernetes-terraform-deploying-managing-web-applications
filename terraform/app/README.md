# Globomantics on EKS

Deploys the Next.js app, MongoDB, and an Ingress onto the existing `demo-eks-cluster`. Application secrets are stored in **AWS Secrets Manager** and mounted into pods with the Secrets Store CSI Driver (ASCP) and IRSA. State is stored in the S3 bucket from `terraform/s3-state`. This stack does not create that bucket or the cluster.

## Prerequisites

| Tool                                            | Version                       |
| ----------------------------------------------- | ----------------------------- |
| [Terraform](https://www.terraform.io/downloads) | `>= 1.10`                     |
| [AWS CLI](https://aws.amazon.com/cli/) v2       | Configured credentials        |
| [Docker](https://www.docker.com/)               | To build and push the image   |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | Compatible with Kubernetes 1.36 |

The EKS stack and the state bucket must already be applied. That includes Secrets Store CSI / ASCP and the `<cluster>-secrets-manager-read` IAM policy. The shared Ingress (`ingress/public`) must have an AWS hostname.

## Backend

Copy the example backend file and replace `ACCOUNT_ID` with the bucket name from the state stack:

```bash
cd terraform/s3-state
terraform output -raw bucket_name
```

`backend.hcl` should then look like `bucket = "app-tfstate-123456789012"`.

Initialize with that file:

```bash
cd terraform/app
cp backend.hcl.example backend.hcl
cp terraform.tfvars.example terraform.tfvars
terraform init -backend-config=backend.hcl
terraform plan
terraform apply
```

Values such as region, image tag, quotas, and MongoDB settings come from `terraform.tfvars`.

## Secrets

Secrets live in Secrets Manager at `eks/demo-eks-cluster/globomantics` (JSON keys: `MONGODB_URI`, `AUTH_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).

Pods use:

- A ServiceAccount with IRSA that attaches the cluster Secrets Manager read policy
- A `SecretProviderClass` that pulls the secret through ASCP
- A CSI volume mount and a synced Kubernetes Secret for `env` references

```bash
terraform output -raw secrets_manager_secret_name
```

## Build and push the image

The repository is immutable, so each new build needs its own tag. Set `image` in `terraform.tfvars` to the full image reference, including that tag.

```bash
export ECR_URL=$(terraform output -raw ecr_repository_url)
export AWS_REGION=us-east-1

aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "${ECR_URL%%/*}"

docker build -t globomantics:demo ../../code
docker tag globomantics:demo "${ECR_URL}:demo"
docker push "${ECR_URL}:demo"
```

If the pods started before the image existed, they retry the pull. Restart them if they stay in `ImagePullBackOff`:

```bash
kubectl rollout restart deployment/globomantics -n globomantics
```

## Open the app

```bash
terraform output -raw app_url
```

That hostname is the shared ALB. This stack's Ingress is path `/` in group `demo`, so it is chosen ahead of the catch-all 404.

The admin password is generated:

```bash
terraform output -raw admin_password
```

The admin email defaults to `admin@globomantics.local`.

## Seed

This stack does not load content. From `code`, with `MONGODB_URI` from Secrets Manager (or port-forward Service `globomantics-mongodb` on port 27017):

```bash
npm run seed
```

## Destroy

```bash
terraform destroy
```

Destroy removes the app, MongoDB, the Secrets Manager secret, and the ECR repository. It does not delete the state bucket or the EKS cluster. An immutable repository must be empty before Terraform can delete it.

## Layout

```text
terraform/app/
├── main.tf
├── variables.tf
├── outputs.tf
├── providers.tf
├── versions.tf
├── backend.hcl.example
├── terraform.tfvars.example
└── modules/
    ├── quota/       # ResourceQuota and LimitRange
    ├── ecr/         # Immutable image repository
    ├── mongodb/     # Bitnami Helm release and root password
    └── app/         # Secrets Manager, IRSA, Deployment, Service, Ingress
```
