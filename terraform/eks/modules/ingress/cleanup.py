#!/usr/bin/env python3
"""Destroy helper for the shared Ingress.

The AWS Load Balancer Controller finalizer blocks deletion of ingress/public
when reconcile fails, and Terraform then reports "Ingress still exists".
This stops the controller, deletes the group load balancer and its security
groups, and clears the finalizer so the Ingress object can go away.
"""

import json
import os
import subprocess
import sys
import tempfile
import time


def run(args, check=True, input_text=None):
    result = subprocess.run(
        args,
        check=False,
        text=True,
        input=input_text,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if check and result.returncode != 0:
        raise SystemExit(
            f"command failed ({result.returncode}): {' '.join(args)}\n{result.stderr.strip()}"
        )
    return result


def aws(args):
    result = run(["aws", *args, "--output", "json"])
    if not result.stdout.strip():
        return {}
    return json.loads(result.stdout)


def region():
    for key in ("AWS_REGION", "AWS_DEFAULT_REGION"):
        if os.environ.get(key):
            return os.environ[key]
    configured = run(["aws", "configure", "get", "region"], check=False).stdout.strip()
    return configured or "us-east-1"


def load_balancers(reg, group):
    data = aws(["elbv2", "describe-load-balancers", "--region", reg])
    found = []
    for lb in data.get("LoadBalancers", []):
        tags = aws(
            [
                "elbv2",
                "describe-tags",
                "--region",
                reg,
                "--resource-arns",
                lb["LoadBalancerArn"],
            ]
        )
        tag_map = {
            tag["Key"]: tag["Value"]
            for item in tags.get("TagDescriptions", [])
            for tag in item.get("Tags", [])
        }
        if tag_map.get("ingress.k8s.aws/stack") == group:
            found.append(
                {
                    "arn": lb["LoadBalancerArn"],
                    "vpc": lb["VpcId"],
                    "cluster": tag_map.get("elbv2.k8s.aws/cluster", ""),
                }
            )
    return found


def wait_until_gone(reg, arns):
    pending = set(arns)
    for _ in range(60):
        if not pending:
            return
        still = set()
        for arn in pending:
            result = run(
                [
                    "aws",
                    "elbv2",
                    "describe-load-balancers",
                    "--region",
                    reg,
                    "--load-balancer-arns",
                    arn,
                    "--output",
                    "json",
                ],
                check=False,
            )
            if result.returncode == 0:
                still.add(arn)
        pending = still
        if pending:
            time.sleep(5)


def controller_security_groups(reg, cluster, vpc):
    filters = ["Name=tag:elbv2.k8s.aws/cluster,Values=" + cluster]
    if vpc:
        filters.append("Name=vpc-id,Values=" + vpc)
    data = aws(
        ["ec2", "describe-security-groups", "--region", reg, "--filters", *filters]
    )
    return data.get("SecurityGroups", [])


def revoke_references(reg, vpc, sg_ids):
    if not sg_ids or not vpc:
        return
    targets = set(sg_ids)
    data = aws(
        [
            "ec2",
            "describe-security-groups",
            "--region",
            reg,
            "--filters",
            "Name=vpc-id,Values=" + vpc,
        ]
    )
    for sg in data.get("SecurityGroups", []):
        for direction, flag in (
            ("IpPermissions", "revoke-security-group-ingress"),
            ("IpPermissionsEgress", "revoke-security-group-egress"),
        ):
            for perm in sg.get(direction, []):
                pairs = [
                    pair
                    for pair in perm.get("UserIdGroupPairs", [])
                    if pair.get("GroupId") in targets
                ]
                if not pairs:
                    continue
                ip_perm = {
                    "IpProtocol": perm["IpProtocol"],
                    "UserIdGroupPairs": [
                        {"GroupId": pair["GroupId"]} for pair in pairs
                    ],
                }
                if perm["IpProtocol"] != "-1":
                    ip_perm["FromPort"] = perm["FromPort"]
                    ip_perm["ToPort"] = perm["ToPort"]
                run(
                    [
                        "aws",
                        "ec2",
                        flag,
                        "--region",
                        reg,
                        "--group-id",
                        sg["GroupId"],
                        "--ip-permissions",
                        json.dumps([ip_perm]),
                    ],
                    check=False,
                )


def delete_security_groups(reg, groups):
    for sg in groups:
        for _ in range(6):
            result = run(
                [
                    "aws",
                    "ec2",
                    "delete-security-group",
                    "--region",
                    reg,
                    "--group-id",
                    sg["GroupId"],
                ],
                check=False,
            )
            if result.returncode == 0 or "InvalidGroup.NotFound" in result.stderr:
                break
            time.sleep(5)


def kubeconfig_for(reg, cluster):
    path = tempfile.mktemp(prefix="eks-ingress-cleanup-")
    run(
        [
            "aws",
            "eks",
            "update-kubeconfig",
            "--region",
            reg,
            "--name",
            cluster,
            "--kubeconfig",
            path,
        ]
    )
    return path


def kubectl(kubeconfig, args, check=True):
    return run(["kubectl", "--kubeconfig", kubeconfig, *args], check=check)


def remove_ingress_webhook(kubeconfig):
    """Drop admission configs that call the controller webhook service.

    The Ingress rule is named vingress.elbv2.k8s.aws, but it lives on a
    ValidatingWebhookConfiguration named <release>-webhook. Deleting the rule
    name leaves the configuration in place, and with failurePolicy Fail the
    Ingress patch is rejected once the controller pods are gone.
    """
    for kind in ("validatingwebhookconfiguration", "mutatingwebhookconfiguration"):
        listed = kubectl(kubeconfig, ["get", kind, "-o", "json"], check=False)
        if listed.returncode != 0 or not listed.stdout.strip():
            continue
        for item in json.loads(listed.stdout).get("items", []):
            body = json.dumps(item)
            if "aws-load-balancer-webhook-service" not in body and "vingress.elbv2.k8s.aws" not in body:
                continue
            kubectl(
                kubeconfig,
                ["delete", kind, item["metadata"]["name"], "--ignore-not-found"],
                check=False,
            )


def clusters(reg):
    data = aws(["eks", "list-clusters", "--region", reg])
    return data.get("clusters", [])


def main():
    if len(sys.argv) != 4:
        raise SystemExit("usage: cleanup.py namespace name group")
    namespace, name, group = sys.argv[1:]
    reg = region()
    balancers = load_balancers(reg, group)
    cluster_names = []
    vpc = ""
    for lb in balancers:
        if lb["cluster"] and lb["cluster"] not in cluster_names:
            cluster_names.append(lb["cluster"])
        vpc = vpc or lb["vpc"]
    if not cluster_names:
        cluster_names = clusters(reg)

    kubeconfig = ""
    matched_cluster = ""
    for cluster in cluster_names:
        try:
            candidate = kubeconfig_for(reg, cluster)
        except SystemExit:
            continue
        got = kubectl(
            candidate,
            ["-n", namespace, "get", "ingress", name],
            check=False,
        )
        if got.returncode == 0 or (
            len(cluster_names) == 1 and "NotFound" in got.stderr
        ):
            kubeconfig = candidate
            matched_cluster = cluster
            break
        os.remove(candidate)

    if not kubeconfig:
        raise SystemExit("could not configure kubectl to clear the Ingress finalizer")

    kubectl(
        kubeconfig,
        [
            "-n",
            "kube-system",
            "delete",
            "deployment",
            "aws-load-balancer-controller",
            "--ignore-not-found",
        ],
        check=False,
    )
    remove_ingress_webhook(kubeconfig)

    arns = [lb["arn"] for lb in balancers]
    for arn in arns:
        run(
            [
                "aws",
                "elbv2",
                "delete-load-balancer",
                "--region",
                reg,
                "--load-balancer-arn",
                arn,
            ],
            check=False,
        )
    wait_until_gone(reg, arns)

    sg_clusters = [matched_cluster] if matched_cluster else cluster_names
    for cluster in sg_clusters:
        groups = controller_security_groups(reg, cluster, vpc)
        sg_vpc = vpc or (groups[0]["VpcId"] if groups else "")
        revoke_references(reg, sg_vpc, [g["GroupId"] for g in groups])
        delete_security_groups(reg, groups)

    # The controller pod can recreate the webhook while it shuts down.
    # Remove it again immediately before the Ingress update.
    remove_ingress_webhook(kubeconfig)

    patched = kubectl(
        kubeconfig,
        [
            "-n",
            namespace,
            "patch",
            "ingress",
            name,
            "--type=merge",
            "-p",
            '{"metadata":{"finalizers":[]}}',
        ],
        check=False,
    )
    if patched.returncode != 0 and "NotFound" not in patched.stderr:
        raise SystemExit(patched.stderr.strip() or "failed to clear the Ingress finalizer")

    # Clearing the finalizer deletes an Ingress that is already terminating.
    # The Kubernetes provider then fails the delete with "not found", so put
    # a plain Ingress back for Terraform to remove.
    kubectl(
        kubeconfig,
        [
            "-n",
            namespace,
            "delete",
            "ingress",
            name,
            "--ignore-not-found",
            "--wait=true",
        ],
        check=False,
    )
    manifest = f"""apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {name}
  namespace: {namespace}
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: placeholder
            port:
              number: 80
"""
    run(
        ["kubectl", "--kubeconfig", kubeconfig, "apply", "-f", "-"],
        input_text=manifest,
    )
    os.remove(kubeconfig)


if __name__ == "__main__":
    main()
