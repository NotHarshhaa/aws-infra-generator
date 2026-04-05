import { GeneratedFile } from '../types';

export function generateVpc(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const cidr = cfg.cidr_block || "10.0.0.0/16";
  const enableDns = cfg.enable_dns !== false;
  const publicCount = parseInt(cfg.public_subnets || "2");
  const privateCount = parseInt(cfg.private_subnets || "2");
  const enableNat = cfg.enable_nat === true;
  const enableFlowLogs = cfg.enable_flow_logs !== false;

  const lines: string[] = [
    `# Get available availability zones`,
    `data "aws_availability_zones" "available" {`,
    `  state = "available"`,
    `  filter {`,
    `    name   = "opt-in-status"`,
    `    values = ["opt-in-not-required"]`,
    `  }`,
    `}`,
    ``,
    `# VPC with enhanced networking and security`,
    `resource "aws_vpc" "main" {`,
    `  cidr_block           = var.vpc_cidr`,
    `  enable_dns_support   = ${enableDns}`,
    `  enable_dns_hostnames = ${enableDns}`,
    `  enable_network_address_usage_metrics = true`,
    ``,
    `  tags = merge(local.common_tags, {`,
    `    Name = "${'${var.project_name}-${var.environment}-vpc'}"`,
    `  })`,
    `}`,
    ``,
    `# Internet Gateway for public internet access`,
    `resource "aws_internet_gateway" "main" {`,
    `  vpc_id = aws_vpc.main.id`,
    ``,
    `  tags = merge(local.common_tags, {`,
    `    Name = "${'${var.project_name}-${var.environment}-igw'}"`,
    `  })`,
    `}`,
    ``,
    `# Attach Internet Gateway to VPC`,
    `resource "aws_vpc_gateway_attachment" "main" {`,
    `  vpc_id         = aws_vpc.main.id`,
    `  internet_gateway_id = aws_internet_gateway.main.id`,
    `}`,
  ];

  // VPC Flow Logs for security monitoring
  if (enableFlowLogs) {
    lines.push(
      ``,
      `# CloudWatch Log Group for VPC Flow Logs`,
      `resource "aws_cloudwatch_log_group" "vpc_flow_logs" {`,
      `  name              = "/aws/vpc/flow-logs/${'${var.project_name}-${var.environment}'}"`,
      `  retention_in_days = var.environment == "production" ? 90 : 30`,
      ``,
      `  tags = merge(local.common_tags, {`,
      `    Name = "${'${var.project_name}-${var.environment}-vpc-flow-logs'}"`,
      `  })`,
      `}`,
      ``,
      `# IAM Role for VPC Flow Logs`,
      `resource "aws_iam_role" "vpc_flow_logs" {`,
      `  name = "${'${var.project_name}-${var.environment}-vpc-flow-logs-role'}"`,
      ``,
      `  assume_role_policy = jsonencode({`,
      `    Version = "2012-10-17"`,
      `    Statement = [{`,
      `      Effect = "Allow",`,
      `      Principal = { Service = "vpc-flow-logs.amazonaws.com" },`,
      `      Action = "sts:AssumeRole"`,
      `    }]`,
      `  })`,
      ``,
      `  tags = merge(local.common_tags, {`,
      `    Name = "${'${var.project_name}-${var.environment}-vpc-flow-logs-role'}"`,
      `  })`,
      `}`,
      ``,
      `# IAM Policy for VPC Flow Logs`,
      `resource "aws_iam_role_policy" "vpc_flow_logs" {`,
      `  name = "${'${var.project_name}-${var.environment}-vpc-flow-logs-policy'}"`,
      `  role = aws_iam_role.vpc_flow_logs.id`,
      ``,
      `  policy = jsonencode({`,
      `    Version = "2012-10-17",`,
      `    Statement = [{`,
      `      Effect = "Allow",`,
      `      Action = [`,
      `        "logs:CreateLogGroup",`,
      `        "logs:CreateLogStream",`,
      `        "logs:PutLogEvents",`,
      `        "logs:DescribeLogGroups",`,
      `        "logs:DescribeLogStreams",`,
      `      ],`,
      `      Resource = ["arn:aws:logs:*:*:*"]`,
      `    }]`,
      `  })`,
      `}`,
      ``,
      `# VPC Flow Logs`,
      `resource "aws_flow_log" "main" {`,
      `  iam_role_arn    = aws_iam_role.vpc_flow_logs.arn`,
      `  log_destination = aws_cloudwatch_log_group.vpc_flow_logs.arn`,
      `  traffic_type    = "ALL"`,
      `  vpc_id          = aws_vpc.main.id`,
      ``,
      `  tags = merge(local.common_tags, {`,
      `    Name = "${'${var.project_name}-${var.environment}-vpc-flow-logs'}"`,
      `  })`,
      `}`
    );
  }

  // Public subnets with high availability
  for (let i = 0; i < publicCount; i++) {
    lines.push(
      ``,
      `# Public Subnet ${i + 1}`,
      `resource "aws_subnet" "public_${i}" {`,
      `  vpc_id                  = aws_vpc.main.id`,
      `  cidr_block              = cidrsubnet(var.vpc_cidr, 8, ${i})`,
      `  availability_zone       = data.aws_availability_zones.available.names[${i % 3}]`,
      `  map_public_ip_on_launch = true`,
      `  assign_ipv6_address_on_creation = false`,
      ``,
      `  tags = merge(local.common_tags, {`,
      `    Name = "${'${var.project_name}-${var.environment}-public-'}${i + 1}",`,
      `    Type = "Public"`,
      `  })`,
      `}`
    );
  }

  // Private subnets for application servers
  for (let i = 0; i < privateCount; i++) {
    lines.push(
      ``,
      `# Private Subnet ${i + 1}`,
      `resource "aws_subnet" "private_${i}" {`,
      `  vpc_id            = aws_vpc.main.id`,
      `  cidr_block        = cidrsubnet(var.vpc_cidr, 8, ${i + 10})`,
      `  availability_zone = data.aws_availability_zones.available.names[${i % 3}]`,
      ``,
      `  tags = merge(local.common_tags, {`,
      `    Name = "${'${var.project_name}-${var.environment}-private-'}${i + 1}",`,
      `    Type = "Private"`,
      `  })`,
      `}`
    );
  }

  // Public route table and routes
  lines.push(
    ``,
    `# Public Route Table`,
    `resource "aws_route_table" "public" {`,
    `  vpc_id = aws_vpc.main.id`,
    ``,
    `  tags = merge(local.common_tags, {`,
    `    Name = "${'${var.project_name}-${var.environment}-public-rt'}"`,
    `  })`,
    `}`,
    ``,
    `# Default route to Internet Gateway`,
    `resource "aws_route" "public_internet" {`,
    `  route_table_id         = aws_route_table.public.id`,
    `  destination_cidr_block = "0.0.0.0/0"`,
    `  gateway_id             = aws_internet_gateway.main.id`,
    `}`
  );

  // Associate public subnets with public route table
  for (let i = 0; i < publicCount; i++) {
    lines.push(
      ``,
      `# Associate Public Subnet ${i + 1} with Public Route Table`,
      `resource "aws_route_table_association" "public_${i}" {`,
      `  subnet_id      = aws_subnet.public_${i}.id`,
      `  route_table_id = aws_route_table.public.id`,
      `}`
    );
  }

  // NAT Gateway for private subnets (production best practice)
  if (enableNat && privateCount > 0) {
    lines.push(
      ``,
      `# Elastic IP for NAT Gateway`,
      `resource "aws_eip" "nat" {`,
      `  domain = "vpc"`,
      `  depends_on = [aws_internet_gateway.main]`,
      ``,
      `  tags = merge(local.common_tags, {`,
      `    Name = "${'${var.project_name}-${var.environment}-nat-eip'}"`,
      `  })`,
      `}`,
      ``,
      `# NAT Gateway for private subnets`,
      `resource "aws_nat_gateway" "main" {`,
      `  allocation_id = aws_eip.nat.id`,
      `  subnet_id     = aws_subnet.public_0.id`,
      `  depends_on    = [aws_internet_gateway.main]`,
      ``,
      `  tags = merge(local.common_tags, {`,
      `    Name = "${'${var.project_name}-${var.environment}-nat'}"`,
      `  })`,
      `}`,
      ``,
      `# Private Route Table`,
      `resource "aws_route_table" "private" {`,
      `  vpc_id = aws_vpc.main.id`,
      ``,
      `  tags = merge(local.common_tags, {`,
      `    Name = "${'${var.project_name}-${var.environment}-private-rt'}"`,
      `  })`,
      `}`,
      ``,
      `# Route to NAT Gateway for private subnets`,
      `resource "aws_route" "private_nat" {`,
      `  route_table_id         = aws_route_table.private.id`,
      `  destination_cidr_block = "0.0.0.0/0"`,
      `  nat_gateway_id         = aws_nat_gateway.main.id`,
      `}`
    );

    // Associate private subnets with private route table
    for (let i = 0; i < privateCount; i++) {
      lines.push(
        ``,
        `# Associate Private Subnet ${i + 1} with Private Route Table`,
        `resource "aws_route_table_association" "private_${i}" {`,
        `  subnet_id      = aws_subnet.private_${i}.id`,
        `  route_table_id = aws_route_table.private.id`,
        `}`
      );
    }
  }

  // Add locals for common tags
  lines.unshift(
    `# Locals for common tags and naming`,
    `locals {`,
    `  common_tags = {`,
    `    Project     = var.project_name`,
    `    Environment = var.environment`,
    `    ManagedBy   = "terraform"`,
    `    CostCenter  = var.cost_center`,
    `    Owner       = var.owner_email`,
    `  }`,
    `}`,
    ``
  );

  const content = lines.join('\n') + '\n';
  return {
    name: "vpc.tf",
    path: `${projectName}/vpc.tf`,
    content,
    language: "hcl",
  };
}
