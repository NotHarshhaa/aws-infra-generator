import { ServiceConfig } from "./types";
import { getServiceById } from "./aws-services";

export interface TerraformPlanAction {
  action: "create" | "update" | "destroy" | "read" | "no-op";
  resourceType: string;
  resourceName: string;
  changes: PlanChange[];
  reason?: string;
}

export interface PlanChange {
  attribute: string;
  before: string | number | boolean | null;
  after: string | number | boolean | null;
  sensitive?: boolean;
}

export interface TerraformPlanSummary {
  toCreate: number;
  toUpdate: number;
  toDestroy: number;
  toRead: number;
  actions: TerraformPlanAction[];
  warnings: string[];
  estimatedTime: string;
}

export function simulateTerraformPlan(
  selectedServices: string[],
  serviceConfig: ServiceConfig,
  projectName: string,
  region: string,
  environment: string
): TerraformPlanSummary {
  const actions: TerraformPlanAction[] = [];
  const warnings: string[] = [];

  selectedServices.forEach((serviceId) => {
    const service = getServiceById(serviceId);
    const config = serviceConfig[serviceId]?.config || {};

    if (!service) return;

    switch (serviceId) {
      case "vpc":
        actions.push({
          action: "create",
          resourceType: "aws_vpc",
          resourceName: `${projectName}_vpc`,
          changes: [
            { attribute: "cidr_block", before: null, after: config.cidr_block || "10.0.0.0/16" },
            { attribute: "enable_dns_hostnames", before: null, after: config.enable_dns || true },
            { attribute: "enable_dns_support", before: null, after: true },
            { attribute: "tags.Name", before: null, after: `${projectName}-vpc` },
            { attribute: "tags.Environment", before: null, after: environment },
          ],
        });

        const publicSubnets = parseInt(config.public_subnets as string) || 2;
        const privateSubnets = parseInt(config.private_subnets as string) || 2;

        for (let i = 0; i < publicSubnets; i++) {
          actions.push({
            action: "create",
            resourceType: "aws_subnet",
            resourceName: `${projectName}_public_subnet_${i + 1}`,
            changes: [
              { attribute: "vpc_id", before: null, after: "aws_vpc.${projectName}_vpc.id" },
              { attribute: "cidr_block", before: null, after: `10.0.${i + 1}.0/24` },
              { attribute: "availability_zone", before: null, after: `${region}${String.fromCharCode(97 + i)}` },
              { attribute: "map_public_ip_on_launch", before: null, after: true },
            ],
          });
        }

        for (let i = 0; i < privateSubnets; i++) {
          actions.push({
            action: "create",
            resourceType: "aws_subnet",
            resourceName: `${projectName}_private_subnet_${i + 1}`,
            changes: [
              { attribute: "vpc_id", before: null, after: "aws_vpc.${projectName}_vpc.id" },
              { attribute: "cidr_block", before: null, after: `10.0.${10 + i + 1}.0/24` },
              { attribute: "availability_zone", before: null, after: `${region}${String.fromCharCode(97 + i)}` },
              { attribute: "map_public_ip_on_launch", before: null, after: false },
            ],
          });
        }

        actions.push({
          action: "create",
          resourceType: "aws_internet_gateway",
          resourceName: `${projectName}_igw`,
          changes: [
            { attribute: "vpc_id", before: null, after: "aws_vpc.${projectName}_vpc.id" },
            { attribute: "tags.Name", before: null, after: `${projectName}-igw` },
          ],
        });

        if (config.enable_nat) {
          warnings.push("NAT Gateway will incur additional costs (~$32/month per gateway)");
          actions.push({
            action: "create",
            resourceType: "aws_nat_gateway",
            resourceName: `${projectName}_nat`,
            changes: [
              { attribute: "allocation_id", before: null, after: "aws_eip.nat.id" },
              { attribute: "subnet_id", before: null, after: "aws_subnet.${projectName}_public_subnet_1.id" },
            ],
          });
        }
        break;

      case "ec2":
        const instanceCount = parseInt(config.instance_count as string) || 1;
        for (let i = 0; i < instanceCount; i++) {
          actions.push({
            action: "create",
            resourceType: "aws_instance",
            resourceName: `${projectName}_ec2_${i + 1}`,
            changes: [
              { attribute: "ami", before: null, after: "data.aws_ami.latest.id" },
              { attribute: "instance_type", before: null, after: config.instance_type || "t3.micro" },
              { attribute: "subnet_id", before: null, after: "aws_subnet.${projectName}_public_subnet_1.id" },
              { attribute: "vpc_security_group_ids", before: null, after: "[aws_security_group.ec2.id]" },
              { attribute: "associate_public_ip_address", before: null, after: config.enable_public_ip || true },
              { attribute: "root_block_device.volume_size", before: null, after: config.root_volume_size || 20 },
            ],
          });
        }

        actions.push({
          action: "create",
          resourceType: "aws_security_group",
          resourceName: `${projectName}_ec2_sg`,
          changes: [
            { attribute: "name", before: null, after: `${projectName}-ec2-sg` },
            { attribute: "vpc_id", before: null, after: "aws_vpc.${projectName}_vpc.id" },
            { attribute: "ingress.0.from_port", before: null, after: 22 },
            { attribute: "ingress.0.to_port", before: null, after: 22 },
            { attribute: "ingress.0.protocol", before: null, after: "tcp" },
          ],
        });
        break;

      case "rds":
        actions.push({
          action: "create",
          resourceType: "aws_db_instance",
          resourceName: `${projectName}_rds`,
          changes: [
            { attribute: "identifier", before: null, after: `${projectName}-db` },
            { attribute: "engine", before: null, after: config.engine || "mysql" },
            { attribute: "engine_version", before: null, after: config.engine_version || "8.0" },
            { attribute: "instance_class", before: null, after: config.instance_class || "db.t3.micro" },
            { attribute: "allocated_storage", before: null, after: config.allocated_storage || 20 },
            { attribute: "username", before: null, after: "admin", sensitive: true },
            { attribute: "password", before: null, after: "(sensitive value)", sensitive: true },
            { attribute: "multi_az", before: null, after: config.multi_az || false },
            { attribute: "backup_retention_period", before: null, after: config.backup_retention || 7 },
          ],
        });

        actions.push({
          action: "create",
          resourceType: "aws_db_subnet_group",
          resourceName: `${projectName}_db_subnet_group`,
          changes: [
            { attribute: "name", before: null, after: `${projectName}-db-subnet-group` },
            { attribute: "subnet_ids", before: null, after: "[aws_subnet.private_*.id]" },
          ],
        });

        warnings.push("RDS credentials will be stored in Terraform state. Consider using AWS Secrets Manager.");
        break;

      case "s3":
        actions.push({
          action: "create",
          resourceType: "aws_s3_bucket",
          resourceName: `${projectName}_bucket`,
          changes: [
            { attribute: "bucket", before: null, after: config.bucket_name || `${projectName}-bucket` },
            { attribute: "tags.Name", before: null, after: config.bucket_name || `${projectName}-bucket` },
            { attribute: "tags.Environment", before: null, after: environment },
          ],
        });

        if (config.versioning) {
          actions.push({
            action: "create",
            resourceType: "aws_s3_bucket_versioning",
            resourceName: `${projectName}_bucket_versioning`,
            changes: [
              { attribute: "bucket", before: null, after: "aws_s3_bucket.${projectName}_bucket.id" },
              { attribute: "versioning_configuration.status", before: null, after: "Enabled" },
            ],
          });
        }

        if (config.encryption) {
          actions.push({
            action: "create",
            resourceType: "aws_s3_bucket_server_side_encryption_configuration",
            resourceName: `${projectName}_bucket_encryption`,
            changes: [
              { attribute: "bucket", before: null, after: "aws_s3_bucket.${projectName}_bucket.id" },
              { attribute: "rule.apply_server_side_encryption_by_default.sse_algorithm", before: null, after: config.encryption || "AES256" },
            ],
          });
        }

        if (config.block_public_access) {
          actions.push({
            action: "create",
            resourceType: "aws_s3_bucket_public_access_block",
            resourceName: `${projectName}_bucket_public_access_block`,
            changes: [
              { attribute: "bucket", before: null, after: "aws_s3_bucket.${projectName}_bucket.id" },
              { attribute: "block_public_acls", before: null, after: true },
              { attribute: "block_public_policy", before: null, after: true },
              { attribute: "ignore_public_acls", before: null, after: true },
              { attribute: "restrict_public_buckets", before: null, after: true },
            ],
          });
        }
        break;

      case "lambda":
        actions.push({
          action: "create",
          resourceType: "aws_lambda_function",
          resourceName: `${projectName}_lambda`,
          changes: [
            { attribute: "function_name", before: null, after: config.function_name || `${projectName}-function` },
            { attribute: "runtime", before: null, after: config.runtime || "python3.11" },
            { attribute: "handler", before: null, after: config.handler || "index.lambda_handler" },
            { attribute: "role", before: null, after: "aws_iam_role.lambda_role.arn" },
            { attribute: "memory_size", before: null, after: config.memory_size || 128 },
            { attribute: "timeout", before: null, after: config.timeout || 30 },
          ],
        });

        actions.push({
          action: "create",
          resourceType: "aws_iam_role",
          resourceName: `${projectName}_lambda_role`,
          changes: [
            { attribute: "name", before: null, after: `${projectName}-lambda-role` },
            { attribute: "assume_role_policy", before: null, after: "(policy document)" },
          ],
        });

        if (config.enable_monitoring) {
          actions.push({
            action: "create",
            resourceType: "aws_cloudwatch_log_group",
            resourceName: `${projectName}_lambda_logs`,
            changes: [
              { attribute: "name", before: null, after: `/aws/lambda/${config.function_name || projectName}` },
              { attribute: "retention_in_days", before: null, after: 7 },
            ],
          });
        }
        break;

      case "alb":
        actions.push({
          action: "create",
          resourceType: "aws_lb",
          resourceName: `${projectName}_alb`,
          changes: [
            { attribute: "name", before: null, after: `${projectName}-alb` },
            { attribute: "load_balancer_type", before: null, after: "application" },
            { attribute: "internal", before: null, after: config.internal || false },
            { attribute: "security_groups", before: null, after: "[aws_security_group.alb.id]" },
            { attribute: "subnets", before: null, after: "[aws_subnet.public_*.id]" },
          ],
        });

        actions.push({
          action: "create",
          resourceType: "aws_lb_target_group",
          resourceName: `${projectName}_target_group`,
          changes: [
            { attribute: "name", before: null, after: `${projectName}-tg` },
            { attribute: "port", before: null, after: config.target_port || 80 },
            { attribute: "protocol", before: null, after: "HTTP" },
            { attribute: "vpc_id", before: null, after: "aws_vpc.${projectName}_vpc.id" },
            { attribute: "health_check.path", before: null, after: config.health_check_path || "/" },
          ],
        });

        actions.push({
          action: "create",
          resourceType: "aws_lb_listener",
          resourceName: `${projectName}_listener`,
          changes: [
            { attribute: "load_balancer_arn", before: null, after: "aws_lb.${projectName}_alb.arn" },
            { attribute: "port", before: null, after: config.listener_port || 80 },
            { attribute: "protocol", before: null, after: "HTTP" },
          ],
        });
        break;

      case "dynamodb":
        actions.push({
          action: "create",
          resourceType: "aws_dynamodb_table",
          resourceName: `${projectName}_table`,
          changes: [
            { attribute: "name", before: null, after: config.table_name || `${projectName}-table` },
            { attribute: "billing_mode", before: null, after: config.billing_mode || "PAY_PER_REQUEST" },
            { attribute: "hash_key", before: null, after: "id" },
            { attribute: "attribute.0.name", before: null, after: "id" },
            { attribute: "attribute.0.type", before: null, after: "S" },
          ],
        });

        if (config.enable_encryption) {
          actions.push({
            action: "update",
            resourceType: "aws_dynamodb_table",
            resourceName: `${projectName}_table`,
            changes: [
              { attribute: "server_side_encryption.enabled", before: false, after: true },
            ],
            reason: "Encryption enabled in configuration",
          });
        }
        break;

      case "iam":
        if (config.create_ec2_role) {
          actions.push({
            action: "create",
            resourceType: "aws_iam_role",
            resourceName: `${projectName}_ec2_role`,
            changes: [
              { attribute: "name", before: null, after: `${projectName}-ec2-role` },
              { attribute: "assume_role_policy", before: null, after: "(policy document)" },
            ],
          });
        }

        if (config.create_s3_policy) {
          actions.push({
            action: "create",
            resourceType: "aws_iam_policy",
            resourceName: `${projectName}_s3_policy`,
            changes: [
              { attribute: "name", before: null, after: `${projectName}-s3-policy` },
              { attribute: "policy", before: null, after: "(policy document)" },
            ],
          });
        }
        break;

      case "cloudwatch":
        if (config.enable_log_group) {
          actions.push({
            action: "create",
            resourceType: "aws_cloudwatch_log_group",
            resourceName: `${projectName}_logs`,
            changes: [
              { attribute: "name", before: null, after: `/aws/${projectName}` },
              { attribute: "retention_in_days", before: null, after: config.log_retention_days || 7 },
            ],
          });
        }

        if (config.enable_alarms) {
          actions.push({
            action: "create",
            resourceType: "aws_cloudwatch_metric_alarm",
            resourceName: `${projectName}_cpu_alarm`,
            changes: [
              { attribute: "alarm_name", before: null, after: `${projectName}-high-cpu` },
              { attribute: "comparison_operator", before: null, after: "GreaterThanThreshold" },
              { attribute: "evaluation_periods", before: null, after: 2 },
              { attribute: "metric_name", before: null, after: "CPUUtilization" },
              { attribute: "threshold", before: null, after: 80 },
            ],
          });
        }
        break;

      case "eks":
        actions.push({
          action: "create",
          resourceType: "aws_eks_cluster",
          resourceName: `${projectName}_cluster`,
          changes: [
            { attribute: "name", before: null, after: config.cluster_name || `${projectName}-cluster` },
            { attribute: "role_arn", before: null, after: "aws_iam_role.eks_cluster.arn" },
            { attribute: "version", before: null, after: config.kubernetes_version || "1.28" },
            { attribute: "vpc_config.subnet_ids", before: null, after: "[aws_subnet.private_*.id]" },
          ],
        });

        actions.push({
          action: "create",
          resourceType: "aws_eks_node_group",
          resourceName: `${projectName}_node_group`,
          changes: [
            { attribute: "cluster_name", before: null, after: "aws_eks_cluster.${projectName}_cluster.name" },
            { attribute: "node_group_name", before: null, after: config.node_group_name || "worker-nodes" },
            { attribute: "scaling_config.desired_size", before: null, after: config.desired_size || 2 },
            { attribute: "scaling_config.min_size", before: null, after: config.min_size || 1 },
            { attribute: "scaling_config.max_size", before: null, after: config.max_size || 4 },
          ],
        });

        warnings.push("EKS cluster creation can take 10-15 minutes");
        break;

      case "api-gateway":
        actions.push({
          action: "create",
          resourceType: "aws_api_gateway_rest_api",
          resourceName: `${projectName}_api`,
          changes: [
            { attribute: "name", before: null, after: config.api_name || `${projectName}-api` },
            { attribute: "description", before: null, after: `API for ${projectName}` },
          ],
        });

        actions.push({
          action: "create",
          resourceType: "aws_api_gateway_deployment",
          resourceName: `${projectName}_deployment`,
          changes: [
            { attribute: "rest_api_id", before: null, after: "aws_api_gateway_rest_api.${projectName}_api.id" },
            { attribute: "stage_name", before: null, after: config.stage_name || "prod" },
          ],
        });
        break;

      default:
        actions.push({
          action: "create",
          resourceType: `aws_${serviceId}`,
          resourceName: `${projectName}_${serviceId}`,
          changes: [
            { attribute: "name", before: null, after: `${projectName}-${serviceId}` },
          ],
        });
    }
  });

  const toCreate = actions.filter((a) => a.action === "create").length;
  const toUpdate = actions.filter((a) => a.action === "update").length;
  const toDestroy = actions.filter((a) => a.action === "destroy").length;
  const toRead = actions.filter((a) => a.action === "read").length;

  const estimatedTime = `${Math.ceil(toCreate * 0.5 + toUpdate * 0.3 + toDestroy * 0.2)} minutes`;

  return {
    toCreate,
    toUpdate,
    toDestroy,
    toRead,
    actions,
    warnings,
    estimatedTime,
  };
}
