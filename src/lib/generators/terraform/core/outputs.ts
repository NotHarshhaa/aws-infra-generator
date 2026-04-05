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
