import { GeneratedFile } from '../types';

export function generateOutputs(services: string[], projectName: string): GeneratedFile {
  const lines: string[] = [];

  if (services.includes("vpc")) {
    lines.push(
      `output "vpc_id" {`,
      `  description = "VPC ID"`,
      `  value       = aws_vpc.main.id`,
      `}`,
      ``
    );
  }

  if (services.includes("ec2")) {
    lines.push(
      `output "ec2_instance_ids" {`,
      `  description = "EC2 instance IDs"`,
      `  value       = aws_instance.main[*].id`,
      `}`,
      ``,
      `output "ec2_public_ips" {`,
      `  description = "EC2 public IP addresses"`,
      `  value       = aws_instance.main[*].public_ip`,
      `}`,
      ``
    );
  }

  if (services.includes("s3")) {
    lines.push(
      `output "s3_bucket_name" {`,
      `  description = "S3 bucket name"`,
      `  value       = aws_s3_bucket.main.bucket`,
      `}`,
      ``,
      `output "s3_bucket_arn" {`,
      `  description = "S3 bucket ARN"`,
      `  value       = aws_s3_bucket.main.arn`,
      `}`,
      ``
    );
  }

  if (services.includes("rds")) {
    lines.push(
      `output "rds_endpoint" {`,
      `  description = "RDS endpoint"`,
      `  value       = aws_db_instance.main.endpoint`,
      `}`,
      ``,
      `output "rds_port" {`,
      `  description = "RDS port"`,
      `  value       = aws_db_instance.main.port`,
      `}`,
      ``
    );
  }

  if (services.includes("alb")) {
    lines.push(
      `output "alb_dns_name" {`,
      `  description = "ALB DNS name"`,
      `  value       = aws_lb.main.dns_name`,
      `}`,
      ``,
      `output "alb_arn" {`,
      `  description = "ALB ARN"`,
      `  value       = aws_lb.main.arn`,
      `}`,
      ``
    );
  }

  if (services.includes("lambda")) {
    lines.push(
      `output "lambda_function_name" {`,
      `  description = "Lambda function name"`,
      `  value       = aws_lambda_function.main.function_name`,
      `}`,
      ``,
      `output "lambda_function_arn" {`,
      `  description = "Lambda function ARN"`,
      `  value       = aws_lambda_function.main.arn`,
      `}`,
      ``
    );
  }

  if (services.includes("cloudfront")) {
    lines.push(
      `output "cloudfront_distribution_id" {`,
      `  description = "CloudFront distribution ID"`,
      `  value       = aws_cloudfront_distribution.main.id`,
      `}`,
      ``,
      `output "cloudfront_domain_name" {`,
      `  description = "CloudFront distribution domain name"`,
      `  value       = aws_cloudfront_distribution.main.domain_name`,
      `}`,
      ``
    );
  }

  if (services.includes("ecs")) {
    lines.push(
      `output "ecs_cluster_name" {`,
      `  description = "ECS cluster name"`,
      `  value       = aws_ecs_cluster.main.name`,
      `}`,
      ``,
      `output "ecs_service_name" {`,
      `  description = "ECS service name"`,
      `  value       = aws_ecs_service.main.name`,
      `}`,
      ``
    );
  }

  if (services.includes("eks")) {
    lines.push(
      `output "eks_cluster_name" {`,
      `  description = "EKS cluster name"`,
      `  value       = aws_eks_cluster.main.name`,
      `}`,
      ``,
      `output "eks_cluster_endpoint" {`,
      `  description = "EKS cluster endpoint"`,
      `  value       = aws_eks_cluster.main.endpoint`,
      `}`,
      ``,
      `output "eks_node_group_name" {`,
      `  description = "EKS node group name"`,
      `  value       = aws_eks_node_group.main.node_group_name`,
      `}`,
      ``
    );
  }

  if (services.includes("dynamodb")) {
    lines.push(
      `output "dynamodb_table_name" {`,
      `  description = "DynamoDB table name"`,
      `  value       = aws_dynamodb_table.main.name`,
      `}`,
      ``,
      `output "dynamodb_table_arn" {`,
      `  description = "DynamoDB table ARN"`,
      `  value       = aws_dynamodb_table.main.arn`,
      `}`,
      ``
    );
  }

  if (services.includes("efs")) {
    lines.push(
      `output "efs_file_system_id" {`,
      `  description = "EFS file system ID"`,
      `  value       = aws_efs_file_system.main.id`,
      `}`,
      ``,
      `output "efs_mount_target_ids" {`,
      `  description = "EFS mount target IDs"`,
      `  value       = aws_efs_mount_target.main[*].id`,
      `}`,
      ``
    );
  }

  if (services.includes("sqs")) {
    lines.push(
      `output "sqs_queue_url" {`,
      `  description = "SQS queue URL"`,
      `  value       = aws_sqs_queue.main.id`,
      `}`,
      ``,
      `output "sqs_queue_arn" {`,
      `  description = "SQS queue ARN"`,
      `  value       = aws_sqs_queue.main.arn`,
      `}`,
      ``
    );
  }

  if (services.includes("sns")) {
    lines.push(
      `output "sns_topic_arn" {`,
      `  description = "SNS topic ARN"`,
      `  value       = aws_sns_topic.main.arn`,
      `}`,
      ``
    );
  }

  if (services.includes("elasticache")) {
    lines.push(
      `output "elasticache_cluster_id" {`,
      `  description = "ElastiCache cluster ID"`,
      `  value       = aws_elasticache_cluster.main.id`,
      `}`,
      ``,
      `output "elasticache_endpoint" {`,
      `  description = "ElastiCache endpoint"`,
      `  value       = aws_elasticache_cluster.main.cache_nodes[0].address`,
      `}`,
      ``
    );
  }

  if (services.includes("route53")) {
    lines.push(
      `output "route53_hosted_zone_id" {`,
      `  description = "Route 53 hosted zone ID"`,
      `  value       = aws_route53_zone.main.id`,
      `}`,
      ``,
      `output "route53_name_servers" {`,
      `  description = "Route 53 name servers"`,
      `  value       = aws_route53_zone.main.name_servers`,
      `}`,
      ``
    );
  }

  if (services.includes("api-gateway")) {
    lines.push(
      `output "api_gateway_url" {`,
      `  description = "API Gateway invoke URL"`,
      `  value       = aws_api_gateway_stage.main.invoke_url`,
      `}`,
      ``,
      `output "api_gateway_id" {`,
      `  description = "API Gateway ID"`,
      `  value       = aws_api_gateway_rest_api.main.id`,
      `}`,
      ``
    );
  }

  if (services.includes("cloudwatch")) {
    lines.push(
      `output "cloudwatch_log_group_arn" {`,
      `  description = "CloudWatch log group ARN"`,
      `  value       = aws_cloudwatch_log_group.main.arn`,
      `}`,
      ``
    );
  }

  if (lines.length === 0) {
    lines.push('# No outputs configured');
  }

  const content = lines.join('\n') + '\n';
  return {
    name: "outputs.tf",
    path: `${projectName}/outputs.tf`,
    content,
    language: "hcl",
  };
}
