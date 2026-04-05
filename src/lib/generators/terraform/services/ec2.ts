import { GeneratedFile } from '../types';

export function generateEc2(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
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
