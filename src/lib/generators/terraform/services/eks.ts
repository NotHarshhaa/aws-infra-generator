import { GeneratedFile } from '../types';

export function generateEks(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const kubernetesVersion = cfg.kubernetes_version || "1.29";
  const nodeInstanceType = cfg.node_group_instance_type || "t3.medium";
  const nodeDesiredSize = cfg.node_group_desired_size || 2;
  const nodeMinSize = cfg.node_group_min_size || 1;
  const nodeMaxSize = cfg.node_group_max_size || 4;

  const content = `# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = "${'${var.project_name}-${var.environment}-eks'}"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "${kubernetesVersion}"

  vpc_config {
    subnet_ids = concat(aws_subnet.public[*].id, aws_subnet.private[*].id)
    endpoint_public_access = true
    endpoint_private_access = true
  }

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-eks-cluster'}"
  })

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
  ]
}

# EKS Node Group
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${'${var.project_name}-${var.environment}-nodes'}"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = aws_subnet.private[*].id

  scaling_config {
    desired_size = ${nodeDesiredSize}
    min_size     = ${nodeMinSize}
    max_size     = ${nodeMaxSize}
  }

  instance_types = ["${nodeInstanceType}"]

  remote_access {
    ec2_ssh_key = var.ssh_key_pair_name
    source_security_group_ids = [aws_security_group.eks_nodes.id]
  }

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-eks-node-group'}"
  })

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]
}

# IAM Role for EKS Cluster
resource "aws_iam_role" "eks_cluster" {
  name = "${'${var.project_name}-${var.environment}-eks-cluster-role'}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-eks-cluster-role'}"
  })
}

# IAM Role Policy Attachments for EKS Cluster
resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

# IAM Role for EKS Nodes
resource "aws_iam_role" "eks_node" {
  name = "${'${var.project_name}-${var.environment}-eks-node-role'}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-eks-node-role'}"
  })
}

# IAM Role Policy Attachments for EKS Nodes
resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node.name
}

resource "aws_iam_role_policy_attachment" "eks_container_registry_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node.name
}

# Security Group for EKS Nodes
resource "aws_security_group" "eks_nodes" {
  name_prefix = "${'${var.project_name}-${var.environment}-eks-nodes-'}"
  description = "Security group for EKS nodes"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-eks-nodes-sg'}"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Security Group Rule for EKS Cluster API
resource "aws_security_group_rule" "eks_cluster_ingress" {
  description       = "Allow EKS nodes to communicate with cluster API"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  security_group_id = aws_security_group.eks_nodes.id
  source_security_group_id = aws_security_group.eks_nodes.id
  type              = "ingress"
}

# Security Group Rule for Node Communication
resource "aws_security_group_rule" "eks_node_ingress" {
  description       = "Allow nodes to communicate with each other"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  security_group_id = aws_security_group.eks_nodes.id
  source_security_group_id = aws_security_group.eks_nodes.id
  type              = "ingress"
}`;

  return {
    name: "eks.tf",
    path: `${projectName}/eks.tf`,
    content,
    language: "hcl",
  };
}
