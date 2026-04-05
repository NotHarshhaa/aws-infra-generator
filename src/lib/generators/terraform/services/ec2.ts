import { GeneratedFile } from '../types';

export function generateEc2(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const instanceType = cfg.instance_type || "t3.medium";
  const instanceCount = cfg.instance_count || 2;
  const amiType = cfg.ami_type || "amazon-linux-2023";
  const volumeSize = cfg.root_volume_size || 50;
  const publicIp = cfg.enable_public_ip !== false;
  const enableMonitoring = cfg.enable_monitoring !== false;

  const amiFilters: Record<string, [string, string]> = {
    "amazon-linux-2023": ["al2023-ami-*-x86_64", "amazon"],
    "ubuntu-22.04": ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*", "099720109477"],
    "ubuntu-24.04": ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*", "099720109477"],
    "windows-2022": ["Windows_Server-2022-English-Full-Base-*", "amazon"],
  };

  const [amiFilter, amiOwner] = amiFilters[amiType] || amiFilters["amazon-linux-2023"];

  const content = `# Latest Amazon Linux 2023 AMI
data "aws_ami" "selected" {
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

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

# Security Group for EC2 instances with strict security rules
resource "aws_security_group" "ec2" {
  name_prefix = "${'${var.project_name}-${var.environment}-ec2-'}"
  description = "Security group for EC2 instances"
  vpc_id      = aws_vpc.main.id

  # SSH access - restricted to specific CIDR blocks
  dynamic "ingress" {
    for_each = var.allowed_cidr_blocks
    content {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
      description = "SSH access from \${ingress.value}"
    }
  }

  # HTTP access (restricted in production)
  dynamic "ingress" {
    for_each = var.environment == "production" ? [] : ["0.0.0.0/0"]
    content {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
      description = "HTTP access"
    }
  }

  # HTTPS access (restricted in production)
  dynamic "ingress" {
    for_each = var.environment == "production" ? [] : ["0.0.0.0/0"]
    content {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
      description = "HTTPS access"
    }
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-ec2-sg'}"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# IAM Role for EC2 instances with least privilege
resource "aws_iam_role" "ec2" {
  name = "${'${var.project_name}-${var.environment}-ec2-role'}"
  description = "IAM role for EC2 instances"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-ec2-role'}"
  })
}

# IAM Policy for EC2 instances - basic permissions
resource "aws_iam_role_policy" "ec2" {
  name = "${'${var.project_name}-${var.environment}-ec2-policy'}"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = ["*"]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = [
          "arn:aws:s3:::${'${var.project_name}-${var.environment}-app-data'}/*",
          "arn:aws:s3:::${'${var.project_name}-${var.environment}-app-data'}"
        ]
      }
    ]
  })
}

# Instance Profile for EC2 instances
resource "aws_iam_instance_profile" "ec2" {
  name = "${'${var.project_name}-${var.environment}-ec2-profile'}"
  role = aws_iam_role.ec2.name
}

# CloudWatch Log Group for EC2 instances
resource "aws_cloudwatch_log_group" "ec2" {
  name              = "/aws/ec2/${'${var.project_name}-${var.environment}'}"
  retention_in_days = var.environment == "production" ? 90 : 30

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-ec2-logs'}"
  })
}

# EC2 instances with production-ready configuration
resource "aws_instance" "main" {
  count                       = var.instance_count
  ami                         = var.ami_id != "" ? var.ami_id : data.aws_ami.selected.id
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public_0.id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2.name
  associate_public_ip_address = ${publicIp}
  monitoring                  = ${enableMonitoring}
  
  # Root block device with encryption and optimized performance
  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
    iops                  = 3000
    throughput            = 125
  }

  # Additional data volume for applications
  ebs_block_device {
    device_name           = "/dev/sdf"
    volume_size           = 100
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
    iops                  = 3000
    throughput            = 125
  }

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-instance-'}${'$' + '{count.index + 1}'}"
  })

  # Ensure instances are replaced rather than updated
  lifecycle {
    create_before_destroy = true
  }
}

# EBS volume attachment for additional storage
resource "aws_volume_attachment" "data_volume" {
  count       = var.instance_count
  device_name = "/dev/sdf"
  volume_id   = aws_instance.main[count.index].ebs_block_device[0].volume_id
  instance_id = aws_instance.main[count.index].id
}`;

  return {
    name: "ec2.tf",
    path: `${projectName}/ec2.tf`,
    content,
    language: "hcl",
  };
}
