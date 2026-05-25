import { GeneratedFile } from '../types';
import { terraformLocalSubnetIds } from '../../../terraform-helpers';

export function generateAlb(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
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
  subnets            = ${terraformLocalSubnetIds("public")}

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
