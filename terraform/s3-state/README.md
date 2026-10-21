# App Terraform state bucket

Creates a private, versioned S3 bucket for the **app** stack's remote state. This root keeps its own state locally, because the bucket cannot store state until it exists.

The EKS stack in `terraform/eks` is not configured to use this bucket.

## Prerequisites

| Tool                                            | Version                      |
| ----------------------------------------------- | ---------------------------- |
| [Terraform](https://www.terraform.io/downloads) | `>= 1.10` (see `versions.tf`) |
| [AWS CLI](https://aws.amazon.com/cli/) v2       | Configured credentials       |

AWS provider constraint: `~> 5.0`. Default region: `us-east-1`.

## Deploy

Apply this stack before the app stack:

```bash
cd terraform/state
terraform init
terraform plan
terraform apply
```

The bucket name is `app-tfstate-<account-id>`.

## App backend

After apply, point the app stack at the bucket. Replace `ACCOUNT_ID` with the account id from the bucket name (`terraform output -raw bucket_name`). Locking uses an S3 lock file, which requires Terraform `>= 1.10`.

```hcl
terraform {
  backend "s3" {
    bucket       = "app-tfstate-ACCOUNT_ID"
    key          = "app/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}
```

Use the same region as `bucket_region` if you changed `aws_region`.

## Destroy

```bash
terraform destroy
```

`force_destroy` is false. Destroy fails if the bucket still holds app state objects. Empty the bucket only when that state is no longer needed.
