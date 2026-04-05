export interface ServiceConfig {
  enabled: boolean;
  config: Record<string, any>;
}

export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

export interface GenerateRequest {
  services: string[];
  config: Record<string, ServiceConfig>;
  environment: string;
  region: string;
  format: string;
  projectName: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  service: string;
  message: string;
  type: "dependency" | "config" | "conflict";
}

export interface ValidationWarning {
  service: string;
  message: string;
}

export class TerraformGenerator {
  generate(
    services: string[],
    config: Record<string, any>,
    environment: string,
    region: string,
    projectName: string
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Provider / main.tf
    files.push(this._generateProvider(region, projectName, environment));

    // Variables
    files.push(this._generateVariables(services, config, environment, region, projectName));

    // Per-service files
    for (const svc of services) {
      const svcConfig = config[svc]?.config || {};
      const generatorMethod = (this as any)[`_generate_${svc}`];
      if (generatorMethod) {
        files.push(generatorMethod.call(this, svcConfig, environment, projectName));
      }
    }

    // Outputs
    files.push(this._generateOutputs(services, projectName));

    return files;
  }

  private _generateProvider(region: string, projectName: string, environment: string): GeneratedFile {
    const content = `terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "${projectName}"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}`;

    return {
      name: "main.tf",
      path: `${projectName}/main.tf`,
      content,
      language: "hcl",
    };
  }

  private _generateVariables(
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

  private _generateVpc(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
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

  private _generateEc2(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
    const instanceType = cfg.instance_type || "t3.micro";
    const instanceCount = cfg.instance_count || 1;
    const amiType = cfg.ami_type || "amazon-linux-2023";
    const volumeSize = cfg.root_volume_size || 20;
    const publicIp = cfg.enable_public_ip !== false;

    const amiFilters: Record<string, [string, string]> = {
      "amazon-linux-2023": ["al2023-ami-*-x86_64", "amazon"],
      "ubuntu-22.04": ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*", "099720109477"],
      "ubuntu-24.04": ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*", "099720109477"],
      "windows-2022": ["Windows_Server-2022-English-Full-Base-*", "amazon"],
    };

    const [amiFilter, amiOwner] = amiFilters[amiType] || amiFilters["amazon-linux-2023"];

    const content = `data "aws_ami" "selected" {
  most_recent = true
  owners      = ["${amiOwner}"]

  filter {
    name   = "name"
    values = ["${amiFilter}"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_security_group" "ec2" {
  name_prefix = "${'${var.project_name}-${var.environment}-ec2-'}"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${'${var.project_name}-${var.environment}-ec2-sg'}"
  }
}

resource "aws_instance" "main" {
  count                       = var.instance_count
  ami                         = data.aws_ami.selected.id
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public_0.id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  associate_public_ip_address = ${publicIp}

  root_block_device {
    volume_size = ${volumeSize}
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name = "${'${var.project_name}-${var.environment}-${count.index}'}"
  }
}`;

    return {
      name: "ec2.tf",
      path: `${projectName}/ec2.tf`,
      content,
      language: "hcl",
    };
  }

  private _generateS3(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
    const bucketSuffix = cfg.bucket_name || "data";
    const versioning = cfg.versioning !== false;
    const encryption = cfg.encryption || "AES256";
    const blockPublic = cfg.block_public_access !== false;

    let content = `resource "aws_s3_bucket" "main" {
  bucket = "${'${var.project_name}-${var.environment}-'}${bucketSuffix}"

  tags = {
    Name = "${'${var.project_name}-${var.environment}-'}${bucketSuffix}"
  }
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id

  versioning_configuration {
    status = "${versioning ? 'Enabled' : 'Disabled'}"
  }
}`;

    if (encryption !== "none") {
      content += `

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "${encryption}"
    }
  }
}`;
    }

    if (blockPublic) {
      content += `

resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`;
    }

    return {
      name: "s3.tf",
      path: `${projectName}/s3.tf`,
      content,
      language: "hcl",
    };
  }

  private _generateRds(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
    const engine = cfg.engine || "postgres";
    const engineVersion = cfg.engine_version || "16";
    const instanceClass = cfg.instance_class || "db.t3.micro";
    const storage = cfg.allocated_storage || 20;
    const multiAz = cfg.multi_az === true;
    const backupRetention = cfg.backup_retention || 7;
    const port = engine === "postgres" ? 5432 : 3306;

    const content = `resource "aws_db_subnet_group" "main" {
  name       = "${'${var.project_name}-${var.environment}-db-subnet'}"
  subnet_ids = [aws_subnet.private_0.id, aws_subnet.private_1.id]

  tags = {
    Name = "${'${var.project_name}-${var.environment}-db-subnet'}"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${'${var.project_name}-${var.environment}-rds-'}"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = ${port}
    to_port         = ${port}
    protocol        = "tcp"
    cidr_blocks     = [var.vpc_cidr]
    description     = "Database access from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${'${var.project_name}-${var.environment}-rds-sg'}"
  }
}

resource "aws_db_instance" "main" {
  identifier     = "${'${var.project_name}-${var.environment}-db'}"
  engine         = var.db_engine
  engine_version = "${engineVersion}"
  instance_class = var.db_instance_class

  allocated_storage = var.db_allocated_storage
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = replace("${'${var.project_name}_${var.environment}'}", "-", "_")
  username = "dbadmin"
  password = "CHANGE_ME_IMMEDIATELY"

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az                = ${multiAz}
  skip_final_snapshot     = ${environment !== "production"}
  backup_retention_period = ${backupRetention}

  tags = {
    Name = "${'${var.project_name}-${var.environment}-db'}"
  }
}`;

    return {
      name: "rds.tf",
      path: `${projectName}/rds.tf`,
      content,
      language: "hcl",
    };
  }

  private _generateAlb(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
    const internal = cfg.internal === true;
    const healthPath = cfg.health_check_path || "/";
    const listenerPort = parseInt(cfg.listener_port || "80");
    const targetPort = parseInt(cfg.target_port || "80");

    const content = `resource "aws_security_group" "alb" {
  name_prefix = "${'${var.project_name}-${var.environment}-alb-'}"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = ${listenerPort}
    to_port     = ${listenerPort}
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "${listenerPort === 80 ? 'HTTP' : 'HTTPS'} access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${'${var.project_name}-${var.environment}-alb-sg'}"
  }
}

resource "aws_lb" "main" {
  name               = "${'${var.project_name}-${var.environment}-alb'}"
  internal           = ${internal}
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_0.id, aws_subnet.public_1.id]

  tags = {
    Name = "${'${var.project_name}-${var.environment}-alb'}"
  }
}

resource "aws_lb_target_group" "main" {
  name     = "${'${var.project_name}-${var.environment}-tg'}"
  port     = ${targetPort}
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    path                = "${healthPath}"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }

  tags = {
    Name = "${'${var.project_name}-${var.environment}-tg'}"
  }
}

resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = ${listenerPort}
  protocol          = "${listenerPort === 80 ? 'HTTP' : 'HTTPS'}"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}`;

    return {
      name: "alb.tf",
      path: `${projectName}/alb.tf`,
      content,
      language: "hcl",
    };
  }

  private _generateIam(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
    const createAdmin = cfg.create_admin_role === true;
    const createEc2Role = cfg.create_ec2_role !== false;
    const createS3Policy = cfg.create_s3_policy === true;
    const createRdsPolicy = cfg.create_rds_policy === true;

    let content = '';

    if (createEc2Role) {
      content += `resource "aws_iam_role" "ec2" {
  name = "${'${var.project_name}-${var.environment}-ec2-role'}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${'${var.project_name}-${var.environment}-ec2-role'}"
  }
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${'${var.project_name}-${var.environment}-ec2-profile'}"
  role = aws_iam_role.ec2.name
}
`;
    }

    if (createAdmin) {
      content += `
resource "aws_iam_role" "admin" {
  name = "${'${var.project_name}-${var.environment}-admin-role'}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = data.aws_caller_identity.current.arn
        }
      }
    ]
  })

  tags = {
    Name = "${'${var.project_name}-${var.environment}-admin-role'}"
  }
}

resource "aws_iam_role_policy_attachment" "admin" {
  role       = aws_iam_role.admin.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

data "aws_caller_identity" "current" {}
`;
    }

    if (createS3Policy) {
      content += `
resource "aws_iam_policy" "s3_access" {
  name        = "${'${var.project_name}-${var.environment}-s3-access'}"
  description = "S3 access policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Resource = ["*"]
      }
    ]
  })
}
`;
    }

    if (createRdsPolicy) {
      content += `
resource "aws_iam_policy" "rds_access" {
  name        = "${'${var.project_name}-${var.environment}-rds-access'}"
  description = "RDS access policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "rds:DescribeDBInstances",
          "rds:Connect"
        ]
        Resource = ["*"]
      }
    ]
  })
}
`;
    }

    if (!content.trim()) {
      content = '# No IAM resources configured\n';
    }

    return {
      name: "iam.tf",
      path: `${projectName}/iam.tf`,
      content,
      language: "hcl",
    };
  }

  private _generateOutputs(services: string[], projectName: string): GeneratedFile {
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
}
