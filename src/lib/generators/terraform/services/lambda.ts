import { GeneratedFile } from '../types';

export function generateLambda(
  cfg: Record<string, any>,
  environment: string,
  projectName: string
): GeneratedFile {
  const functionName = cfg.function_name || `${projectName}-${environment}-lambda`;
  const runtime = cfg.runtime || "python3.11";
  const handler = cfg.handler || "index.lambda_handler";
  const memorySize = cfg.memory_size || 128;
  const timeout = cfg.timeout || 30;
  const environmentVariables = cfg.environment_variables || {};
  const enableVpc = cfg.enable_vpc === true;
  const enableMonitoring = cfg.enable_monitoring === true;
  const enableTracing = cfg.enable_tracing === true;
  const reservedConcurrency = cfg.reserved_concurrency || null;

  let content = `# Lambda Function
resource "aws_lambda_function" "main" {
  filename         = "lambda.zip"
  function_name    = "${functionName}"
  role            = aws_iam_role.lambda.arn
  handler         = "${handler}"
  runtime         = "${runtime}"
  
  memory_size     = ${memorySize}
  timeout         = ${timeout}
  
  ${enableTracing ? `tracing_config_mode = "Active"` : ''}
  ${reservedConcurrency ? `reserved_concurrent_executions = ${reservedConcurrency}` : ''}
  
  ${enableVpc ? `
  vpc_config {
    subnet_ids         = [aws_subnet.private_0.id, aws_subnet.private_1.id]
    security_group_ids = [aws_security_group.lambda.id]
  }` : ''}
  
  environment {
    variables = {
      ${Object.entries(environmentVariables).map(([key, value]) => `${key} = "${value}"`).join('\n      ')}
    }
  }
  
  tags = {
    Name = "\${var.project_name}-\${var.environment}-lambda"
    Environment = "\${var.environment}"
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda" {
  name = "\${var.project_name}-\${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "\${var.project_name}-\${var.environment}-lambda-role"
  }
}

# Basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda.name
}

`;

  // VPC access policy
  if (enableVpc) {
    content += `# VPC access policy
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  role       = aws_iam_role.lambda.name
}

# Security group for Lambda
resource "aws_security_group" "lambda" {
  name_prefix = "\${var.project_name}-\${var.environment}-lambda-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for Lambda function"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "\${var.project_name}-\${var.environment}-lambda-sg"
  }
}

`;
  }

  // Add S3 access if needed
  if (cfg.s3_access === true) {
    content += `# S3 access policy
resource "aws_iam_policy" "lambda_s3" {
  name        = "\${var.project_name}-\${var.environment}-lambda-s3"
  role        = aws_iam_role.lambda.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement: [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          ${cfg.s3_bucket_arn || 'aws_s3_bucket.main.arn'},
          ${cfg.s3_bucket_arn ? `"${cfg.s3_bucket_arn}/*"` : '"${aws_s3_bucket.main.arn}/*"'}
        ]
      }
    ]
  })
}

`;
  }

  // Add DynamoDB access if needed
  if (cfg.dynamodb_access === true) {
    content += `# DynamoDB access policy
resource "aws_iam_policy" "lambda_dynamodb" {
  name        = "\${var.project_name}-\${var.environment}-lambda-dynamodb"
  role        = aws_iam_role.lambda.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement: [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource: aws_dynamodb_table.main.arn
      }
    ]
  })
}

`;
  }

  // Add SQS access if needed
  if (cfg.sqs_access === true) {
    content += `# SQS access policy
resource "aws_iam_policy" "lambda_sqs" {
  name        = "\${var.project_name}-\${var.environment}-lambda-sqs"
  role        = aws_iam_role.lambda.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement: [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.main.arn
      }
    ]
  })
}

`;
  }

  // Add EventBridge trigger if needed
  if (cfg.eventbridge_trigger === true) {
    content += `# EventBridge rule for Lambda trigger
resource "aws_cloudwatch_event_rule" "lambda_trigger" {
  name                = "\${var.project_name}-\${var.environment}-lambda-trigger"
  description         = "Trigger Lambda function on schedule"
  schedule_expression = "${cfg.schedule_expression || "rate(5 minutes)"}"

  tags = {
    Name = "\${var.project_name}-\${var.environment}-lambda-trigger"
  }
}

resource "aws_cloudwatch_event_target" "lambda" {
  rule      = aws_cloudwatch_event_rule.lambda_trigger.name
  target_id = "LambdaTarget"
  arn       = aws_lambda_function.main.arn
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.main.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.lambda_trigger.arn
}

`;
  }

  // Add API Gateway trigger if needed
  if (cfg.api_gateway_trigger === true) {
    content += `# API Gateway
resource "aws_api_gateway_rest_api" "main" {
  name        = "\${var.project_name}-\${var.environment}-api"
  description = "API Gateway for ${projectName}"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name = "\${var.project_name}-\${var.environment}-api"
    Environment = "\${var.environment}"
  }
}

# API Gateway Resource
resource "aws_api_gateway_resource" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "{proxy+}"
}

# API Gateway Method (ANY for proxy)
resource "aws_api_gateway_method" "main" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.main.id
  http_method   = "ANY"
  authorizationType = "NONE"
}

# API Gateway Integration
resource "aws_api_gateway_integration" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.main.id
  http_method = aws_api_gateway_method.main.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.main.invoke_arn
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.main.id,
      aws_api_gateway_method.main.id,
      aws_api_gateway_integration.main.id
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway Stage
resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = "\${var.environment}"
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.main.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "\${aws_api_gateway_rest_api.main.execution_arn}/*/*/*"
}
`;
  }

  // Add CloudWatch Log Group for API Gateway
  if (cfg.enable_logging === true) {
    content += `# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/apigateway/\${var.project_name}-\${var.environment}-api"
  retention_in_days = ${cfg.log_retention_days || 14}

  tags = {
    Name = "\${var.project_name}-\${var.environment}-api-logs"
  }
}
`;
  }

  // Add CloudWatch monitoring
  if (enableMonitoring) {
    content += `# CloudWatch alarms for Lambda
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "\${var.project_name}-\${var.environment}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Lambda function has too many errors"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    FunctionName = aws_lambda_function.main.function_name
  }
}

resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "\${var.project_name}-\${var.environment}-lambda-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Average"
  threshold           = ${timeout * 1000 * 0.8}  // 80% of timeout
  alarm_description   = "Lambda function duration is too high"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    FunctionName = aws_lambda_function.main.function_name
  }
}

resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  alarm_name          = "\${var.project_name}-\${var.environment}-lambda-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Lambda function is being throttled"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    FunctionName = aws_lambda_function.main.function_name
  }
}
`;
  }

  return {
    name: "lambda.tf",
    path: `${projectName}/lambda.tf`,
    content,
    language: "hcl",
  };
}
