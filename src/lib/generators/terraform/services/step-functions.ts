import { GeneratedFile } from '../types';

export function generateStepFunctions(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const stateMachineName = cfg.state_machine_name || 'my-workflow';
  const type = cfg.type || 'STANDARD';
  const executionTimeout = cfg.execution_timeout || 3600;
  const enableLogging = cfg.enable_logging !== false;
  const enableTracing = cfg.enable_tracing === true;

  const content = `# IAM Role for Step Functions
resource "aws_iam_role" "step_functions" {
  name = "\${var.project_name}-\${var.environment}-stepfunctions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "states.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-stepfunctions-role"
  })
}

# IAM Policy for Step Functions basic execution
resource "aws_iam_role_policy" "step_functions_basic" {
  name = "step-functions-basic-execution"
  role = aws_iam_role.step_functions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

${enableLogging ? `# CloudWatch Log Group for Step Functions
resource "aws_cloudwatch_log_group" "step_functions" {
  name              = "/aws/vendedlogs/states/\${var.project_name}-\${var.environment}-state-machine"
  retention_in_days = 7

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-state-machine-logs"
  })
}` : ''}

# Step Functions State Machine
resource "aws_sfn_state_machine" "main" {
  name       = "${stateMachineName}-\${var.environment}"
  type       = "${type}"
  role_arn   = aws_iam_role.step_functions.arn

  definition = jsonencode({
    Comment = "A simple minimal example"
    StartAt = "HelloWorld"
    States = {
      HelloWorld = {
        Type   = "Pass"
        Result = "Hello World!"
        End    = true
      }
    }
  })

  timeout_seconds = ${executionTimeout}

  ${enableLogging ? `logging_configuration {
    log_destination        = aws_cloudwatch_log_group.step_functions.arn
    include_execution_data = true
    level                  = "ALL"
  }` : ''}

  ${enableTracing ? `tracing_configuration {
    enabled = true
  }` : ''}

  tags = merge(local.common_tags, {
    Name = "${stateMachineName}-\${var.environment}"
  })
}`;

  return {
    name: "step-functions.tf",
    path: `${projectName}/step-functions.tf`,
    content,
    language: "hcl",
  };
}
