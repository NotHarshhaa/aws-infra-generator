import { GeneratedFile } from '../types';

export function generateVariables(
  services: string[],
  config: Record<string, any>,
  environment: string,
  region: string,
  projectName: string
): GeneratedFile {
  const lines: string[] = [
    `variable "aws_region" {`,
    `  description = "AWS region"`,
    `  type        = string`,
    `  default     = "${region}"`,
    `}`,
    ``,
    `variable "environment" {`,
    `  description = "Environment name"`,
    `  type        = string`,
    `  default     = "${environment}"`,
    `}`,
    ``,
    `variable "project_name" {`,
    `  description = "Project name"`,
    `  type        = string`,
    `  default     = "${projectName}"`,
    `}`,
  ];

  if (services.includes("vpc")) {
    const vpcCfg = config.vpc?.config || {};
    lines.push(
      ``,
      `variable "vpc_cidr" {`,
      `  description = "VPC CIDR block"`,
      `  type        = string`,
      `  default     = "${vpcCfg.cidr_block || "10.0.0.0/16"}"`,
      `}`
    );
  }

  if (services.includes("ec2")) {
    const ec2Cfg = config.ec2?.config || {};
    lines.push(
      ``,
      `variable "instance_type" {`,
      `  description = "EC2 instance type"`,
      `  type        = string`,
      `  default     = "${ec2Cfg.instance_type || "t3.micro"}"`,
      `}`,
      ``,
      `variable "instance_count" {`,
      `  description = "Number of EC2 instances"`,
      `  type        = number`,
      `  default     = ${ec2Cfg.instance_count || 1}`,
      `}`
    );
  }

  if (services.includes("rds")) {
    const rdsCfg = config.rds?.config || {};
    lines.push(
      ``,
      `variable "db_engine" {`,
      `  description = "Database engine"`,
      `  type        = string`,
      `  default     = "${rdsCfg.engine || "postgres"}"`,
      `}`,
      ``,
      `variable "db_instance_class" {`,
      `  description = "RDS instance class"`,
      `  type        = string`,
      `  default     = "${rdsCfg.instance_class || "db.t3.micro"}"`,
      `}`,
      ``,
      `variable "db_allocated_storage" {`,
      `  description = "RDS allocated storage in GB"`,
      `  type        = number`,
      `  default     = ${rdsCfg.allocated_storage || 20}`,
      `}`
    );
  }

  const content = lines.join('\n') + '\n';
  return {
    name: "variables.tf",
    path: `${projectName}/variables.tf`,
    content,
    language: "hcl",
  };
}
