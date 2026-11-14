# GitHub Actions deploy setup

This repository deploys the Globomantics app to EKS with [`.github/workflows/deploy-app.yml`](workflows/deploy-app.yml). The workflow builds `code/`, pushes the image to ECR, and runs `terraform apply` in `terraform/app`.

It authenticates to AWS with **OIDC** (no long-lived access keys). You create an IAM role that GitHub can assume, store its ARN as a repository secret, and grant that role EKS admin access.

## Prerequisites

- EKS stack applied (`terraform/eks`), including the `globomantics` ECR repository and Secrets Store CSI / ASCP
- App state bucket applied (`terraform/s3-state`) → bucket name `app-tfstate-<account-id>`
- GitHub repository where Actions are enabled

Get your 12-digit AWS account ID:

```bash
aws sts get-caller-identity --query Account --output text
```

## 1. Create the GitHub OIDC provider (once per account)

1. Open **IAM** → **Identity providers** → **Add provider**
2. Provider type: **OpenID Connect**
3. Provider URL: `https://token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Add the provider

The provider ARN looks like:

```text
arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com
```

## 2. Create the IAM role (trust policy)

This JSON is a **trust policy** (who can assume the role). Do **not** paste it into IAM → Policies (identity policies cannot use `Principal`).

1. **IAM** → **Roles** → **Create role**
2. Trusted entity type: **Custom trust policy**
3. Paste the policy below (replace `ACCOUNT_ID` and `YOUR_ORG/YOUR_REPO`)
4. Continue to permissions (next section), name the role (for example `github-deploy-app`), and create it

AWS expects a `token.actions.githubusercontent.com:sub` condition that pins both the **repository** and **branch**. Also keep the `repository` claim for defense in depth.

Some GitHub tokens use an expanded `sub` such as `repo:OWNER@id/REPO@id:ref:refs/heads/BRANCH`. A plain `repo:OWNER/REPO:ref:...` `StringEquals` will not match those. Use `StringLike` with a `*` after the owner and repo name so both formats work, and list every branch that may run the workflow.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:repository": "YOUR_ORG/YOUR_REPO"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:YOUR_ORG*/YOUR_REPO*:ref:refs/heads/main",
            "repo:YOUR_ORG*/YOUR_REPO*:ref:refs/heads/master"
          ]
        }
      }
    }
  ]
}
```

Example for account `123456789012` and repo `rivethead42/kubernetes-terraform-deploying-managing-web-applications`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:repository": "rivethead42/kubernetes-terraform-deploying-managing-web-applications"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:rivethead42*/kubernetes-terraform-deploying-managing-web-applications*:ref:refs/heads/main",
            "repo:rivethead42*/kubernetes-terraform-deploying-managing-web-applications*:ref:refs/heads/master"
          ]
        }
      }
    }
  ]
}
```

Notes:

- Owner and repo names are case-sensitive and must match GitHub exactly.
- Drop the `master` entry if you only use `main` (or the reverse).
- To edit later: open the role → **Trust relationships** → **Edit trust policy**.
- This workflow triggers on `main` and `master`. Prefer a single default branch when you can.

## 3. Attach permissions to the role

On the role’s **Permissions** tab, attach either:

- `AdministratorAccess` for a course/demo account (simplest), or
- A scoped custom policy such as:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EcrAuth",
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
      "Resource": "*"
    },
    {
      "Sid": "EcrPush",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeImages",
        "ecr:DescribeRepositories",
        "ecr:GetDownloadUrlForLayer",
        "ecr:InitiateLayerUpload",
        "ecr:ListImages",
        "ecr:PutImage",
        "ecr:UploadLayerPart"
      ],
      "Resource": "arn:aws:ecr:us-east-1:ACCOUNT_ID:repository/globomantics"
    },
    {
      "Sid": "TerraformState",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketVersioning",
        "s3:GetBucketPolicy",
        "s3:GetEncryptionConfiguration"
      ],
      "Resource": [
        "arn:aws:s3:::app-tfstate-ACCOUNT_ID",
        "arn:aws:s3:::app-tfstate-ACCOUNT_ID/*"
      ]
    },
    {
      "Sid": "EksDescribe",
      "Effect": "Allow",
      "Action": ["eks:DescribeCluster", "eks:ListClusters"],
      "Resource": "*"
    },
    {
      "Sid": "SecretsManager",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:DeleteSecret",
        "secretsmanager:DescribeSecret",
        "secretsmanager:GetResourcePolicy",
        "secretsmanager:PutResourcePolicy",
        "secretsmanager:DeleteResourcePolicy",
        "secretsmanager:GetSecretValue",
        "secretsmanager:PutSecretValue",
        "secretsmanager:TagResource",
        "secretsmanager:UntagResource",
        "secretsmanager:UpdateSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:eks/demo-eks-cluster/globomantics*"
    },
    {
      "Sid": "SecretsManagerKms",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:DescribeKey",
        "kms:Encrypt",
        "kms:GenerateDataKey"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "kms:ViaService": "secretsmanager.us-east-1.amazonaws.com"
        }
      }
    },
    {
      "Sid": "IamRead",
      "Effect": "Allow",
      "Action": [
        "iam:GetOpenIDConnectProvider",
        "iam:ListOpenIDConnectProviders",
        "iam:GetPolicy",
        "iam:GetPolicyVersion",
        "iam:ListPolicies",
        "iam:GetRole",
        "iam:GetRolePolicy",
        "iam:ListAttachedRolePolicies",
        "iam:ListRolePolicies",
        "iam:ListInstanceProfilesForRole",
        "iam:ListRoleTags"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IamIrsaRole",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:UpdateAssumeRolePolicy",
        "iam:TagRole",
        "iam:UntagRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::ACCOUNT_ID:role/demo-eks-cluster-globomantics",
        "arn:aws:iam::ACCOUNT_ID:policy/demo-eks-cluster-secrets-manager-read"
      ]
    }
  ]
}
```

Replace every `ACCOUNT_ID` with your 12-digit account ID. Add the `SecretsManagerKms` and `iam:ListRoleTags` entries to the existing `github-deploy-app` inline policy if that role was created earlier without them.

Copy the role ARN after creation, for example:

```text
arn:aws:iam::ACCOUNT_ID:role/github-deploy-app
```

## 4. Grant the role EKS cluster admin

Kubernetes API access is not granted by the IAM policy alone. Add the role ARN to the EKS stack and re-apply:

In `terraform/eks` (for example in `terraform.tfvars`):

```hcl
cluster_admin_principal_arns = [
  "arn:aws:iam::ACCOUNT_ID:role/github-deploy-app"
]
```

```bash
cd terraform/eks
terraform apply
```

## 5. Add the GitHub secret

1. Open the repository on GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
4. Name: `AWS_ROLE_ARN`
5. Value: the role ARN from step 3
6. **Add secret**

`terraform/app/terraform.tfvars` is not committed. Both deploy workflows pass those settings as repository **variables** (Settings → Secrets and variables → Actions → Variables). Leave a variable unset to use the default from `terraform/app/variables.tf`. The container `image` is not a variable: the workflow builds a commit-tagged image and passes that URI.

| Name | Default | Terraform variable |
| ---- | ------- | ------------------ |
| `AWS_REGION` | `us-east-1` | `aws_region` |
| `CLUSTER_NAME` | `demo-eks-cluster` | `cluster_name` |
| `APP_REPLICAS` | `2` | `app_replicas` |
| `QUOTA_REQUESTS_CPU` | `2` | `quota_requests_cpu` |
| `QUOTA_REQUESTS_MEMORY` | `4Gi` | `quota_requests_memory` |
| `QUOTA_LIMITS_CPU` | `4` | `quota_limits_cpu` |
| `QUOTA_LIMITS_MEMORY` | `8Gi` | `quota_limits_memory` |
| `QUOTA_PODS` | `10` | `quota_pods` |
| `LIMIT_DEFAULT_CPU` | `500m` | `limit_default_cpu` |
| `LIMIT_DEFAULT_MEMORY` | `512Mi` | `limit_default_memory` |
| `LIMIT_DEFAULT_REQUEST_CPU` | `100m` | `limit_default_request_cpu` |
| `LIMIT_DEFAULT_REQUEST_MEMORY` | `256Mi` | `limit_default_request_memory` |
| `MONGODB_CHART_VERSION` | `16.5.45` | `mongodb_chart_version` |
| `MONGODB_IMAGE_TAG` | `7.0.8-debian-12-r2` | `mongodb_image_tag` |
| `MONGODB_PERSISTENCE_SIZE` | `8Gi` | `mongodb_persistence_size` |
| `INGRESS_GROUP_NAME` | `demo` | `ingress_group_name` |
| `INGRESS_CLASS_NAME` | `alb` | `ingress_class_name` |
| `INGRESS_PATH` | `/` | `ingress_path` |
| `INGRESS_GROUP_ORDER` | `10` | `ingress_group_order` |
| `ADMIN_EMAIL` | email already in state, otherwise `admin@globomantics.local` | `admin_email` |

## 6. Run the workflow

Both deploy workflows are **manual only** (`workflow_dispatch`):

- **Actions** → **Deploy app** → **Run workflow**
- **Actions** → **Deploy app (Checkov + tfsec)** → **Run workflow** (runs tfsec and Checkov, then deploys)

Confirm the image is pushed and `terraform apply` succeeds. App URL is printed in the final step (`terraform output -raw app_url`).

## Troubleshooting

### `Could not assume role with OIDC: Not authorized to perform sts:AssumeRoleWithWebIdentity`

- `AWS_ROLE_ARN` must be the full ARN with no quotes or spaces (for this account: `arn:aws:iam::123456789012:role/github-deploy-app`)
- Trust policy must live under the role’s **Trust relationships** tab, not a permissions policy
- Include `token.actions.githubusercontent.com:sub` pinned to the repo and branch (AWS warns if `sub` is missing). Use `StringLike` values like `repo:OWNER*/REPO*:ref:refs/heads/main` so both classic and `OWNER@id/REPO@id` subject formats match
- Also set `token.actions.githubusercontent.com:repository` = `OWNER/REPO`
- OIDC provider audience must be `sts.amazonaws.com`
- Federated ARN account ID must match the role’s account
- Check CloudTrail `AssumeRoleWithWebIdentity` for the denied event’s `userName` / subject claim

### Trust policy editor errors about `Principal` / `Resource`

You are editing an **identity (permissions) policy**. Move to **Create role → Custom trust policy** or the role’s **Trust relationships** tab.

### Terraform fails talking to the cluster after assume succeeds

The role can call AWS APIs but is not an EKS access entry. Complete step 4 (`cluster_admin_principal_arns`) and apply the EKS stack.

### Terraform apply replaces the Secrets Manager secret every run

`admin_email` is stored in the Secrets Manager secret. Changing it replaces the secret version. When the `ADMIN_EMAIL` GitHub variable is unset, the workflow reuses `terraform output -raw admin_email` so an existing stack keeps its email. Set `ADMIN_EMAIL` to choose the address, including on the first deploy.
