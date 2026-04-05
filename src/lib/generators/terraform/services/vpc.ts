import { GeneratedFile } from '../types';

export function generateVpc(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const cidr = cfg.cidr_block || "10.0.0.0/16";
  const enableDns = cfg.enable_dns !== false;
  const publicCount = parseInt(cfg.public_subnets || "2");
  const privateCount = parseInt(cfg.private_subnets || "2");
  const enableNat = cfg.enable_nat === true;

  const lines: string[] = [
    `data "aws_availability_zones" "available" {`,
    `  state = "available"`,
    `}`,
    ``,
    `resource "aws_vpc" "main" {`,
    `  cidr_block           = var.vpc_cidr`,
    `  enable_dns_support   = ${enableDns}`,
    `  enable_dns_hostnames = ${enableDns}`,
    ``,
    `  tags = {`,
    `    Name = "${'${var.project_name}-${var.environment}-vpc'}"`,
    `  }`,
    `}`,
    ``,
    `resource "aws_internet_gateway" "main" {`,
    `  vpc_id = aws_vpc.main.id`,
    ``,
    `  tags = {`,
    `    Name = "${'${var.project_name}-${var.environment}-igw'}"`,
    `  }`,
    `}`,
  ];

  // Public subnets
  for (let i = 0; i < publicCount; i++) {
    lines.push(
      ``,
      `resource "aws_subnet" "public_${i}" {`,
      `  vpc_id                  = aws_vpc.main.id`,
      `  cidr_block              = cidrsubnet(var.vpc_cidr, 8, ${i})`,
      `  availability_zone       = data.aws_availability_zones.available.names[${i % 3}]`,
      `  map_public_ip_on_launch = true`,
      ``,
      `  tags = {`,
      `    Name = "${'${var.project_name}-${var.environment}-public-'}${i}"`,
      `  }`,
      `}`
    );
  }

  // Private subnets
  for (let i = 0; i < privateCount; i++) {
    lines.push(
      ``,
      `resource "aws_subnet" "private_${i}" {`,
      `  vpc_id            = aws_vpc.main.id`,
      `  cidr_block        = cidrsubnet(var.vpc_cidr, 8, ${i + 10})`,
      `  availability_zone = data.aws_availability_zones.available.names[${i % 3}]`,
      ``,
      `  tags = {`,
      `    Name = "${'${var.project_name}-${var.environment}-private-'}${i}"`,
      `  }`,
      `}`
    );
  }

  // Public route table
  lines.push(
    ``,
    `resource "aws_route_table" "public" {`,
    `  vpc_id = aws_vpc.main.id`,
    ``,
    `  route {`,
    `    cidr_block = "0.0.0.0/0"`,
    `    gateway_id = aws_internet_gateway.main.id`,
    `  }`,
    ``,
    `  tags = {`,
    `    Name = "${'${var.project_name}-${var.environment}-public-rt'}"`,
    `  }`,
    `}`
  );

  for (let i = 0; i < publicCount; i++) {
    lines.push(
      ``,
      `resource "aws_route_table_association" "public_${i}" {`,
      `  subnet_id      = aws_subnet.public_${i}.id`,
      `  route_table_id = aws_route_table.public.id`,
      `}`
    );
  }

  // NAT Gateway
  if (enableNat && privateCount > 0) {
    lines.push(
      ``,
      `resource "aws_eip" "nat" {`,
      `  domain = "vpc"`,
      ``,
      `  tags = {`,
      `    Name = "${'${var.project_name}-${var.environment}-nat-eip'}"`,
      `  }`,
      `}`,
      ``,
      `resource "aws_nat_gateway" "main" {`,
      `  allocation_id = aws_eip.nat.id`,
      `  subnet_id     = aws_subnet.public_0.id`,
      ``,
      `  tags = {`,
      `    Name = "${'${var.project_name}-${var.environment}-nat'}"`,
      `  }`,
      `}`,
      ``,
      `resource "aws_route_table" "private" {`,
      `  vpc_id = aws_vpc.main.id`,
      ``,
      `  route {`,
      `    cidr_block     = "0.0.0.0/0"`,
      `    nat_gateway_id = aws_nat_gateway.main.id`,
      `  }`,
      ``,
      `  tags = {`,
      `    Name = "${'${var.project_name}-${var.environment}-private-rt'}"`,
      `  }`,
      `}`
    );

    for (let i = 0; i < privateCount; i++) {
      lines.push(
        ``,
        `resource "aws_route_table_association" "private_${i}" {`,
        `  subnet_id      = aws_subnet.private_${i}.id`,
        `  route_table_id = aws_route_table.private.id`,
        `}`
      );
    }
  }

  const content = lines.join('\n') + '\n';
  return {
    name: "vpc.tf",
    path: `${projectName}/vpc.tf`,
    content,
    language: "hcl",
  };
}
