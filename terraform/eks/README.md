# AWS infrastructure (Terraform)

Terraform configuration for the **globomantics** demo environment: dedicated VPC, EKS **1.37** with AL2023 managed nodes, ECR repository, a shared internet-facing Application Load Balancer (HTTP on the hostname AWS assigns), Secrets Store CSI / ASCP for AWS Secrets Manager, and supporting IAM (node ECR pull, EBS CSI IRSA, AWS Load Balancer Controller IRSA, Secrets Manager read policy, cluster access entries).

## Prerequisites


| Tool                                               | Version                                                |
| -------------------------------------------------- | ------------------------------------------------------ |
| [Terraform](https://www.terraform.io/downloads)    | `>= 1.6` (see `versions.tf`)                           |
| [AWS CLI](https://aws.amazon.com/cli/) v2          | Configured credentials (`aws sts get-caller-identity`) |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | Compatible with Kubernetes 1.36                        |
| [Docker](https://www.docker.com/)                  | For building and pushing images to ECR                 |


AWS provider constraint: `~> 5.0` (see `versions.tf`).

## Deploy

1. Change to this directory:
  ```bash
   cd terraform/eks
  ```
2. (Optional) Copy example variables:
  ```bash
   cp terraform.tfvars.example terraform.tfvars
  ```
3. Initialize providers and modules:
  ```bash
   terraform init
  ```
4. Review the plan:
  ```bash
   terraform plan
  ```
5. Apply (first run typically **15–20 minutes** for VPC, NAT, EKS, and node group):
  ```bash
   terraform apply
  ```



### Ordering notes

- **vpc-cni** is installed **before** the managed node group (`before_compute`).
- **kube-proxy**, **coredns**, and **aws-ebs-csi-driver** are installed **after** nodes are ready.
- The **AWS Load Balancer Controller** is installed after the node group. The shared Ingress then creates the internet-facing ALB.
- The **Secrets Store CSI Driver** and **AWS Secrets and Configuration Provider (ASCP)** are installed after the node group. Apps mount Secrets Manager secrets with a `SecretProviderClass` and IRSA.
- Cluster admin is granted via **explicit EKS access entries** for the Terraform caller and any ARNs in `cluster_admin_principal_arns` — not only bootstrap creator permissions.



## Push an image to ECR

After `terraform apply`, get the repository URL:

```bash
export ECR_URL=$(terraform output -raw ecr_repository_url)
export AWS_REGION=us-east-1
```

Use the same region as `var.aws_region` (default `us-east-1`, or your `terraform.tfvars` value).

Authenticate Docker to ECR:

```bash
$(terraform output -raw ecr_login_command)
```

Build and push from the application directory:

```bash
cd ../app
docker build -t globomantics:demo .
docker tag globomantics:demo "${ECR_URL}:demo"
docker push "${ECR_URL}:demo"
```

ECR uses **immutable** tags: each new tag must be unique.

## Connect kubectl

Use the helper command from Terraform output:

```bash
$(terraform output -raw update_kubeconfig_command)
kubectl get nodes
kubectl get pods -A
```

You should see **2** AL2023 nodes in **Ready** state (private subnets, no public IPs on nodes).

## Open the load balancer

The shared Ingress creates an internet-facing Application Load Balancer. AWS assigns the hostname; no domain of your own is required. HTTP on port 80 is the only listener.

```bash
terraform output -raw alb_dns_name
```

A request to `http://<that hostname>/` returns **404** with body `no route` until an application adds its own rule.

## Attach an application

A later Terraform stack can share this ALB by creating an Ingress in any namespace. Use the same group and class. Give the app a lower `group.order` than the catch-all (`1000`) so its path wins.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app
  namespace: app
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/group.name: demo
    alb.ingress.kubernetes.io/group.order: "10"
spec:
  ingressClassName: alb
  rules:
    - http:
        paths:
          - path: /app
            pathType: Prefix
            backend:
              service:
                name: app
                port:
                  number: 80
```

`ingress_group_name` and `ingress_class_name` outputs are `demo` and `alb`.

## Outputs


| Output                                   | Use                              |
| ---------------------------------------- | -------------------------------- |
| `eks_cluster_name`                       | `aws eks` / `kubectl` context    |
| `eks_cluster_endpoint`                   | API server URL                   |
| `eks_cluster_certificate_authority_data` | Kubeconfig CA (sensitive)        |
| `update_kubeconfig_command`              | One-liner to configure `kubectl` |
| `ecr_repository_url`                     | CI/CD image push target          |
| `ecr_login_command`                      | One-liner to `docker login` to ECR |
| `alb_dns_name`                           | AWS hostname of the shared ALB   |
| `ingress_group_name`                     | Group later apps join (`demo`)   |
| `ingress_class_name`                     | Ingress class later apps use (`alb`) |
| `oidc_provider_arn`                      | OIDC provider for app IRSA roles     |
| `secrets_manager_read_policy_arn`        | Attach to app IRSA to read SM secrets |
| `secrets_manager_read_policy_name`       | Policy name (`<cluster>-secrets-manager-read`) |
| `secrets_manager_name_prefix`            | Secret name prefix (`eks/<cluster>/`) |

## Secrets Manager for apps

This stack does not create application secret values. It installs CSI/ASCP and an IAM policy that allows `GetSecretValue` / `DescribeSecret` on secrets named `eks/<cluster_name>/*`.

An app stack should:

1. Create a secret under that prefix (for example `eks/demo-eks-cluster/globomantics`).
2. Create an IRSA role for its ServiceAccount and attach `secrets_manager_read_policy_arn`.
3. Define a `SecretProviderClass` and mount `secrets-store.csi.k8s.io` on the pod.

## Destroy

```bash
terraform destroy
```

`terraform destroy` deletes the shared Ingress before the VPC. Destroy also removes the load balancer, its security groups, and the controller finalizer that otherwise leaves `ingress/public` in place. Destroy the app stack first if it is still applied, so its Ingress is not holding that load balancer.

## Layout

```text
terraform/eks/
├── main.tf              # Root module wiring
├── variables.tf
├── outputs.tf
├── providers.tf
├── versions.tf
└── modules/
    ├── vpc/             # VPC, subnets, NAT, IGW
    ├── eks/             # EKS, nodes, add-ons, OIDC, access entries
    ├── ingress/         # AWS Load Balancer Controller and shared Ingress
    ├── secrets_store/   # Secrets Store CSI, ASCP, Secrets Manager read policy
    └── ecr/             # globomantics repository
```

