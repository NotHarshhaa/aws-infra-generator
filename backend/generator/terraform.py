"""Terraform infrastructure template generator."""

from jinja2 import Environment, FileSystemLoader, BaseLoader
import os

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates", "terraform")


class TerraformGenerator:
    def __init__(self):
        self.jinja_env = Environment(
            loader=FileSystemLoader(TEMPLATES_DIR),
            trim_blocks=True,
            lstrip_blocks=True,
        )

    def generate(
        self,
        services: list[str],
        config: dict,
        environment: str,
        region: str,
        project_name: str,
    ) -> list[dict]:
        files = []

        # Provider / main.tf
        files.append(self._generate_provider(region, project_name, environment))

        # Variables
        files.append(self._generate_variables(services, config, environment, region, project_name))

        # Per-service files
        for svc in services:
            svc_config = config.get(svc, {}).get("config", {})
            generator_method = getattr(self, f"_generate_{svc}", None)
            if generator_method:
                files.append(generator_method(svc_config, environment, project_name))

        # Outputs
        files.append(self._generate_outputs(services, project_name))

        return files

    def _generate_provider(self, region: str, project_name: str, environment: str) -> dict:
        content = f'''terraform {{
  required_version = ">= 1.0"

  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }}
  }}

  backend "local" {{
    path = "terraform.tfstate"
  }}
}}

provider "aws" {{
  region = var.aws_region

  default_tags {{
    tags = {{
      Project     = "{project_name}"
      Environment = var.environment
      ManagedBy   = "terraform"
    }}
  }}
}}
'''
        return {
            "name": "main.tf",
            "path": f"{project_name}/main.tf",
            "content": content,
            "language": "hcl",
        }

    def _generate_variables(
        self, services: list[str], config: dict, environment: str, region: str, project_name: str
    ) -> dict:
        lines = [
            f'variable "aws_region" {{',
            f'  description = "AWS region"',
            f'  type        = string',
            f'  default     = "{region}"',
            f'}}',
            f'',
            f'variable "environment" {{',
            f'  description = "Environment name"',
            f'  type        = string',
            f'  default     = "{environment}"',
            f'}}',
            f'',
            f'variable "project_name" {{',
            f'  description = "Project name"',
            f'  type        = string',
            f'  default     = "{project_name}"',
            f'}}',
        ]

        if "vpc" in services:
            vpc_cfg = config.get("vpc", {}).get("config", {})
            lines += [
                '',
                f'variable "vpc_cidr" {{',
                f'  description = "VPC CIDR block"',
                f'  type        = string',
                f'  default     = "{vpc_cfg.get("cidr_block", "10.0.0.0/16")}"',
                f'}}',
            ]

        if "ec2" in services:
            ec2_cfg = config.get("ec2", {}).get("config", {})
            lines += [
                '',
                f'variable "instance_type" {{',
                f'  description = "EC2 instance type"',
                f'  type        = string',
                f'  default     = "{ec2_cfg.get("instance_type", "t3.micro")}"',
                f'}}',
                '',
                f'variable "instance_count" {{',
                f'  description = "Number of EC2 instances"',
                f'  type        = number',
                f'  default     = {ec2_cfg.get("instance_count", 1)}',
                f'}}',
            ]

        if "rds" in services:
            rds_cfg = config.get("rds", {}).get("config", {})
            lines += [
                '',
                f'variable "db_engine" {{',
                f'  description = "Database engine"',
                f'  type        = string',
                f'  default     = "{rds_cfg.get("engine", "postgres")}"',
                f'}}',
                '',
                f'variable "db_instance_class" {{',
                f'  description = "RDS instance class"',
                f'  type        = string',
                f'  default     = "{rds_cfg.get("instance_class", "db.t3.micro")}"',
                f'}}',
                '',
                f'variable "db_allocated_storage" {{',
                f'  description = "RDS allocated storage in GB"',
                f'  type        = number',
                f'  default     = {rds_cfg.get("allocated_storage", 20)}',
                f'}}',
            ]

        content = '\n'.join(lines) + '\n'
        return {
            "name": "variables.tf",
            "path": f"{project_name}/variables.tf",
            "content": content,
            "language": "hcl",
        }

    def _generate_vpc(self, cfg: dict, environment: str, project_name: str) -> dict:
        cidr = cfg.get("cidr_block", "10.0.0.0/16")
        enable_dns = cfg.get("enable_dns", True)
        public_count = int(cfg.get("public_subnets", 2))
        private_count = int(cfg.get("private_subnets", 2))
        enable_nat = cfg.get("enable_nat", False)

        lines = [
            'data "aws_availability_zones" "available" {',
            '  state = "available"',
            '}',
            '',
            f'resource "aws_vpc" "main" {{',
            f'  cidr_block           = var.vpc_cidr',
            f'  enable_dns_support   = {str(enable_dns).lower()}',
            f'  enable_dns_hostnames = {str(enable_dns).lower()}',
            '',
            '  tags = {',
            '    Name = "${var.project_name}-${var.environment}-vpc"',
            '  }',
            '}',
            '',
            'resource "aws_internet_gateway" "main" {',
            '  vpc_id = aws_vpc.main.id',
            '',
            '  tags = {',
            '    Name = "${var.project_name}-${var.environment}-igw"',
            '  }',
            '}',
        ]

        # Public subnets
        for i in range(public_count):
            lines += [
                '',
                f'resource "aws_subnet" "public_{i}" {{',
                f'  vpc_id                  = aws_vpc.main.id',
                f'  cidr_block              = cidrsubnet(var.vpc_cidr, 8, {i})',
                f'  availability_zone       = data.aws_availability_zones.available.names[{i % 3}]',
                f'  map_public_ip_on_launch = true',
                '',
                '  tags = {',
                f'    Name = "${{var.project_name}}-${{var.environment}}-public-{i}"',
                '  }',
                '}',
            ]

        # Private subnets
        for i in range(private_count):
            lines += [
                '',
                f'resource "aws_subnet" "private_{i}" {{',
                f'  vpc_id            = aws_vpc.main.id',
                f'  cidr_block        = cidrsubnet(var.vpc_cidr, 8, {i + 10})',
                f'  availability_zone = data.aws_availability_zones.available.names[{i % 3}]',
                '',
                '  tags = {',
                f'    Name = "${{var.project_name}}-${{var.environment}}-private-{i}"',
                '  }',
                '}',
            ]

        # Public route table
        lines += [
            '',
            'resource "aws_route_table" "public" {',
            '  vpc_id = aws_vpc.main.id',
            '',
            '  route {',
            '    cidr_block = "0.0.0.0/0"',
            '    gateway_id = aws_internet_gateway.main.id',
            '  }',
            '',
            '  tags = {',
            '    Name = "${var.project_name}-${var.environment}-public-rt"',
            '  }',
            '}',
        ]

        for i in range(public_count):
            lines += [
                '',
                f'resource "aws_route_table_association" "public_{i}" {{',
                f'  subnet_id      = aws_subnet.public_{i}.id',
                '  route_table_id = aws_route_table.public.id',
                '}',
            ]

        # NAT Gateway
        if enable_nat and private_count > 0:
            lines += [
                '',
                'resource "aws_eip" "nat" {',
                '  domain = "vpc"',
                '',
                '  tags = {',
                '    Name = "${var.project_name}-${var.environment}-nat-eip"',
                '  }',
                '}',
                '',
                'resource "aws_nat_gateway" "main" {',
                '  allocation_id = aws_eip.nat.id',
                '  subnet_id     = aws_subnet.public_0.id',
                '',
                '  tags = {',
                '    Name = "${var.project_name}-${var.environment}-nat"',
                '  }',
                '}',
                '',
                'resource "aws_route_table" "private" {',
                '  vpc_id = aws_vpc.main.id',
                '',
                '  route {',
                '    cidr_block     = "0.0.0.0/0"',
                '    nat_gateway_id = aws_nat_gateway.main.id',
                '  }',
                '',
                '  tags = {',
                '    Name = "${var.project_name}-${var.environment}-private-rt"',
                '  }',
                '}',
            ]
            for i in range(private_count):
                lines += [
                    '',
                    f'resource "aws_route_table_association" "private_{i}" {{',
                    f'  subnet_id      = aws_subnet.private_{i}.id',
                    '  route_table_id = aws_route_table.private.id',
                    '}',
                ]

        content = '\n'.join(lines) + '\n'
        return {
            "name": "vpc.tf",
            "path": f"{project_name}/vpc.tf",
            "content": content,
            "language": "hcl",
        }

    def _generate_ec2(self, cfg: dict, environment: str, project_name: str) -> dict:
        instance_type = cfg.get("instance_type", "t3.micro")
        instance_count = cfg.get("instance_count", 1)
        ami_type = cfg.get("ami_type", "amazon-linux-2023")
        volume_size = cfg.get("root_volume_size", 20)
        public_ip = cfg.get("enable_public_ip", True)

        ami_filters = {
            "amazon-linux-2023": ("al2023-ami-*-x86_64", "amazon"),
            "ubuntu-22.04": ("ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*", "099720109477"),
            "ubuntu-24.04": ("ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*", "099720109477"),
            "windows-2022": ("Windows_Server-2022-English-Full-Base-*", "amazon"),
        }

        ami_filter, ami_owner = ami_filters.get(ami_type, ami_filters["amazon-linux-2023"])

        content = f'''data "aws_ami" "selected" {{
  most_recent = true
  owners      = ["{ami_owner}"]

  filter {{
    name   = "name"
    values = ["{ami_filter}"]
  }}

  filter {{
    name   = "virtualization-type"
    values = ["hvm"]
  }}
}}

resource "aws_security_group" "ec2" {{
  name_prefix = "${{var.project_name}}-${{var.environment}}-ec2-"
  vpc_id      = aws_vpc.main.id

  ingress {{
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }}

  ingress {{
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }}

  ingress {{
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }}

  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  tags = {{
    Name = "${{var.project_name}}-${{var.environment}}-ec2-sg"
  }}
}}

resource "aws_instance" "main" {{
  count                       = var.instance_count
  ami                         = data.aws_ami.selected.id
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public_0.id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  associate_public_ip_address = {str(public_ip).lower()}

  root_block_device {{
    volume_size = {volume_size}
    volume_type = "gp3"
    encrypted   = true
  }}

  tags = {{
    Name = "${{var.project_name}}-${{var.environment}}-${{count.index}}"
  }}
}}
'''
        return {
            "name": "ec2.tf",
            "path": f"{project_name}/ec2.tf",
            "content": content,
            "language": "hcl",
        }

    def _generate_s3(self, cfg: dict, environment: str, project_name: str) -> dict:
        bucket_suffix = cfg.get("bucket_name", "data")
        versioning = cfg.get("versioning", True)
        encryption = cfg.get("encryption", "AES256")
        block_public = cfg.get("block_public_access", True)

        content = f'''resource "aws_s3_bucket" "main" {{
  bucket = "${{var.project_name}}-${{var.environment}}-{bucket_suffix}"

  tags = {{
    Name = "${{var.project_name}}-${{var.environment}}-{bucket_suffix}"
  }}
}}

resource "aws_s3_bucket_versioning" "main" {{
  bucket = aws_s3_bucket.main.id

  versioning_configuration {{
    status = "{"Enabled" if versioning else "Disabled"}"
  }}
}}
'''

        if encryption != "none":
            content += f'''
resource "aws_s3_bucket_server_side_encryption_configuration" "main" {{
  bucket = aws_s3_bucket.main.id

  rule {{
    apply_server_side_encryption_by_default {{
      sse_algorithm = "{encryption}"
    }}
  }}
}}
'''

        if block_public:
            content += '''
resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
'''

        return {
            "name": "s3.tf",
            "path": f"{project_name}/s3.tf",
            "content": content,
            "language": "hcl",
        }

    def _generate_rds(self, cfg: dict, environment: str, project_name: str) -> dict:
        engine = cfg.get("engine", "postgres")
        engine_version = cfg.get("engine_version", "16")
        instance_class = cfg.get("instance_class", "db.t3.micro")
        storage = cfg.get("allocated_storage", 20)
        multi_az = cfg.get("multi_az", False)
        backup_retention = cfg.get("backup_retention", 7)

        content = f'''resource "aws_db_subnet_group" "main" {{
  name       = "${{var.project_name}}-${{var.environment}}-db-subnet"
  subnet_ids = [aws_subnet.private_0.id, aws_subnet.private_1.id]

  tags = {{
    Name = "${{var.project_name}}-${{var.environment}}-db-subnet"
  }}
}}

resource "aws_security_group" "rds" {{
  name_prefix = "${{var.project_name}}-${{var.environment}}-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {{
    from_port       = {5432 if engine == "postgres" else 3306}
    to_port         = {5432 if engine == "postgres" else 3306}
    protocol        = "tcp"
    cidr_blocks     = [var.vpc_cidr]
    description     = "Database access from VPC"
  }}

  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  tags = {{
    Name = "${{var.project_name}}-${{var.environment}}-rds-sg"
  }}
}}

resource "aws_db_instance" "main" {{
  identifier     = "${{var.project_name}}-${{var.environment}}-db"
  engine         = var.db_engine
  engine_version = "{engine_version}"
  instance_class = var.db_instance_class

  allocated_storage = var.db_allocated_storage
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = replace("${{var.project_name}}_${{var.environment}}", "-", "_")
  username = "dbadmin"
  password = "CHANGE_ME_IMMEDIATELY"

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az            = {str(multi_az).lower()}
  skip_final_snapshot = {str(environment != "production").lower()}
  backup_retention_period = {backup_retention}

  tags = {{
    Name = "${{var.project_name}}-${{var.environment}}-db"
  }}
}}
'''
        return {
            "name": "rds.tf",
            "path": f"{project_name}/rds.tf",
            "content": content,
            "language": "hcl",
        }

    def _generate_alb(self, cfg: dict, environment: str, project_name: str) -> dict:
        internal = cfg.get("internal", False)
        health_path = cfg.get("health_check_path", "/")
        listener_port = cfg.get("listener_port", "80")
        target_port = cfg.get("target_port", 80)

        content = f'''resource "aws_security_group" "alb" {{
  name_prefix = "${{var.project_name}}-${{var.environment}}-alb-"
  vpc_id      = aws_vpc.main.id

  ingress {{
    from_port   = {listener_port}
    to_port     = {listener_port}
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "{"HTTP" if listener_port == "80" else "HTTPS"} access"
  }}

  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  tags = {{
    Name = "${{var.project_name}}-${{var.environment}}-alb-sg"
  }}
}}

resource "aws_lb" "main" {{
  name               = "${{var.project_name}}-${{var.environment}}-alb"
  internal           = {str(internal).lower()}
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_0.id, aws_subnet.public_1.id]

  tags = {{
    Name = "${{var.project_name}}-${{var.environment}}-alb"
  }}
}}

resource "aws_lb_target_group" "main" {{
  name     = "${{var.project_name}}-${{var.environment}}-tg"
  port     = {target_port}
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {{
    enabled             = true
    path                = "{health_path}"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }}

  tags = {{
    Name = "${{var.project_name}}-${{var.environment}}-tg"
  }}
}}

resource "aws_lb_listener" "main" {{
  load_balancer_arn = aws_lb.main.arn
  port              = {listener_port}
  protocol          = "{"HTTP" if listener_port == "80" else "HTTPS"}"

  default_action {{
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }}
}}
'''
        return {
            "name": "alb.tf",
            "path": f"{project_name}/alb.tf",
            "content": content,
            "language": "hcl",
        }

    def _generate_iam(self, cfg: dict, environment: str, project_name: str) -> dict:
        create_admin = cfg.get("create_admin_role", False)
        create_ec2_role = cfg.get("create_ec2_role", True)
        create_s3_policy = cfg.get("create_s3_policy", False)
        create_rds_policy = cfg.get("create_rds_policy", False)

        content = ''

        if create_ec2_role:
            content += '''resource "aws_iam_role" "ec2" {
  name = "${var.project_name}-${var.environment}-ec2-role"

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
    Name = "${var.project_name}-${var.environment}-ec2-role"
  }
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project_name}-${var.environment}-ec2-profile"
  role = aws_iam_role.ec2.name
}
'''

        if create_admin:
            content += '''
resource "aws_iam_role" "admin" {
  name = "${var.project_name}-${var.environment}-admin-role"

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
    Name = "${var.project_name}-${var.environment}-admin-role"
  }
}

resource "aws_iam_role_policy_attachment" "admin" {
  role       = aws_iam_role.admin.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

data "aws_caller_identity" "current" {}
'''

        if create_s3_policy:
            content += '''
resource "aws_iam_policy" "s3_access" {
  name        = "${var.project_name}-${var.environment}-s3-access"
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
'''

        if create_rds_policy:
            content += '''
resource "aws_iam_policy" "rds_access" {
  name        = "${var.project_name}-${var.environment}-rds-access"
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
'''

        if not content.strip():
            content = '# No IAM resources configured\n'

        return {
            "name": "iam.tf",
            "path": f"{project_name}/iam.tf",
            "content": content,
            "language": "hcl",
        }

    def _generate_outputs(self, services: list[str], project_name: str) -> dict:
        lines = []

        if "vpc" in services:
            lines += [
                'output "vpc_id" {',
                '  description = "VPC ID"',
                '  value       = aws_vpc.main.id',
                '}',
                '',
            ]

        if "ec2" in services:
            lines += [
                'output "ec2_instance_ids" {',
                '  description = "EC2 instance IDs"',
                '  value       = aws_instance.main[*].id',
                '}',
                '',
                'output "ec2_public_ips" {',
                '  description = "EC2 public IP addresses"',
                '  value       = aws_instance.main[*].public_ip',
                '}',
                '',
            ]

        if "s3" in services:
            lines += [
                'output "s3_bucket_name" {',
                '  description = "S3 bucket name"',
                '  value       = aws_s3_bucket.main.bucket',
                '}',
                '',
                'output "s3_bucket_arn" {',
                '  description = "S3 bucket ARN"',
                '  value       = aws_s3_bucket.main.arn',
                '}',
                '',
            ]

        if "rds" in services:
            lines += [
                'output "rds_endpoint" {',
                '  description = "RDS endpoint"',
                '  value       = aws_db_instance.main.endpoint',
                '}',
                '',
                'output "rds_port" {',
                '  description = "RDS port"',
                '  value       = aws_db_instance.main.port',
                '}',
                '',
            ]

        if "alb" in services:
            lines += [
                'output "alb_dns_name" {',
                '  description = "ALB DNS name"',
                '  value       = aws_lb.main.dns_name',
                '}',
                '',
                'output "alb_arn" {',
                '  description = "ALB ARN"',
                '  value       = aws_lb.main.arn',
                '}',
                '',
            ]

        if not lines:
            lines = ['# No outputs configured\n']

        content = '\n'.join(lines) + '\n'
        return {
            "name": "outputs.tf",
            "path": f"{project_name}/outputs.tf",
            "content": content,
            "language": "hcl",
        }
