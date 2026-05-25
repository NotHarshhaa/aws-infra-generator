import { GeneratedFile } from '../types';
import { terraformLocalSubnetIds } from '../../../terraform-helpers';

export function generateEcs(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const launchType = cfg.launch_type || "FARGATE";
  const taskCpu = cfg.task_cpu || "256";
  const taskMemory = cfg.task_memory || "512";
  const desiredCount = cfg.desired_count || 1;
  const enableLoadBalancing = cfg.enable_load_balancing === true;

  const content = `# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${'${var.project_name}-${var.environment}-cluster'}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-ecs-cluster'}"
  })
}

# Task Definition
resource "aws_ecs_task_definition" "main" {
  family                   = "${'${var.project_name}-${var.environment}-task'}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["${launchType}"]
  cpu                      = ${taskCpu}
  memory                   = ${taskMemory}
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "app"
      image = "nginx:latest"
      
      portMappings = [
        {
          containerPort = 80
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-task-def'}"
  })
}

# ECS Service
resource "aws_ecs_service" "main" {
  name            = "${'${var.project_name}-${var.environment}-service'}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = ${desiredCount}
  launch_type     = "${launchType}"

  network_configuration {
    subnets          = ${terraformLocalSubnetIds("private")}
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  ${enableLoadBalancing ? `
  load_balancer {
    target_group_arn = aws_lb_target_group.ecs.arn
    container_name   = "app"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.ecs]` : ''}

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-ecs-service'}"
  })
}

# Security Group for ECS
resource "aws_security_group" "ecs" {
  name_prefix = "${'${var.project_name}-${var.environment}-ecs-'}"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = ${enableLoadBalancing ? `[aws_security_group.alb.id]` : `[]`}
    description     = "HTTP from ALB"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-ecs-sg'}"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_task_execution" {
  name = "${'${var.project_name}-${var.environment}-ecs-task-execution'}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-ecs-task-execution-role'}"
  })
}

# IAM Role Policy for ECS Task Execution
resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Role for ECS Task
resource "aws_iam_role" "ecs_task" {
  name = "${'${var.project_name}-${var.environment}-ecs-task'}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-ecs-task-role'}"
  })
}

# CloudWatch Log Group for ECS
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${'${var.project_name}-${var.environment}'}"
  retention_in_days = var.environment == "production" ? 90 : 30

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-ecs-logs'}"
  })
}

${enableLoadBalancing ? `
# Target Group for ECS
resource "aws_lb_target_group" "ecs" {
  name     = "${'${var.project_name}-${var.environment}-ecs-tg'}"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-ecs-tg'}"
  })
}

# ALB Listener for ECS
resource "aws_lb_listener" "ecs" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ecs.arn
  }
}` : ''}`;

  return {
    name: "ecs.tf",
    path: `${projectName}/ecs.tf`,
    content,
    language: "hcl",
  };
}
