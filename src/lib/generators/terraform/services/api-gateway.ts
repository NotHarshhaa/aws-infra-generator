import { GeneratedFile } from '../types';

export function generateApiGateway(
  cfg: Record<string, any>,
  environment: string,
  projectName: string
): GeneratedFile {
  const apiType = cfg.api_type || "rest";
  const stageName = cfg.stage_name || environment;
  const enableCors = cfg.enable_cors !== false;
  const enableLogging = cfg.enable_logging !== false;
  const enableThrottling = cfg.enable_throttling === true;
  const enableWaf = cfg.enable_waf === true;

  let content = '';

  if (apiType === "rest") {
    content += `# REST API Gateway
resource "aws_api_gateway_rest_api" "main" {
  name        = "\${var.project_name}-\${var.environment}-api"
  description = "REST API for ${projectName}"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action   = "execute-api:Invoke"
        Resource = "arn:aws:execute-api:*:*:*"
      }
    ]
  })

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
  authorization = "NONE"

  ${enableCors ? `request_parameters = {
    "method.request.header.Access-Control-Request-Headers" = true
    "method.request.header.Access-Control-Request-Method" = true
  }` : ''}
}

# API Gateway Integration
resource "aws_api_gateway_integration" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.main.id
  http_method = aws_api_gateway_method.main.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = ${cfg.lambda_integration === true ? 'aws_lambda_function.main.invoke_arn' : `"http://\${aws_lb.main.dns_name}"`}

  ${enableCors ? `request_parameters = {
    "integration.request.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "integration.request.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "integration.request.header.Access-Control-Allow-Origin"  = "'*'"
  }` : ''}
}

${enableCors ? `# CORS Method
resource "aws_api_gateway_method" "options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.main.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# CORS Integration
resource "aws_api_gateway_integration" "options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.main.id
  http_method = aws_api_gateway_method.options.http_method

  type = "MOCK"
  
  request_templates = {
    "application/json" = "{\\"statusCode\\": 200}"
  }
}

# CORS Method Response
resource "aws_api_gateway_method_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.main.id
  http_method = aws_api_gateway_method.options.http_method
  status_code  = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# CORS Integration Response
resource "aws_api_gateway_integration_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.main.id
  http_method = aws_api_gateway_method.options.http_method
  status_code  = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}
` : ''}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.main.id,
      aws_api_gateway_method.main.id,
      aws_api_gateway_integration.main.id
      ${enableCors ? `,
      aws_api_gateway_method.options.id,
      aws_api_gateway_integration.options.id` : ''}
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
  stage_name    = "${stageName}"

  ${enableThrottling ? `
  default_settings {
    throttling_rate_limit    = ${cfg.throttle_rate_limit || 100}
    throttling_burst_limit   = ${cfg.throttle_burst_limit || 200}
  }` : ''}

  ${enableLogging ? `
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api.arn
    format          = jsonencode({
      requestId = "$context.requestId",
      ip        = "$context.identity.sourceIp",
      caller    = "$context.identity.caller",
      user      = "$context.identity.user",
      requestTime = "$context.requestTime",
      httpMethod  = "$context.httpMethod",
      resourcePath = "$context.resourcePath",
      status      = "$context.status",
      protocol    = "$context.protocol",
      responseLength = "$context.responseLength"
    })
  }

  xray_tracing_enabled = true
  
  method_settings {
    method_path = "*/*"
    logging_level = "INFO"
    metrics_enabled = true
    data_trace_enabled = ${cfg.data_trace_enabled === true}
  }` : ''}

  tags = {
    Name = "\${var.project_name}-\${var.environment}-api-stage"
    Environment = "\${var.environment}"
  }
}

${cfg.lambda_integration === true ? `# Lambda Permission for API Gateway
resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.main.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "\${aws_api_gateway_rest_api.main.execution_arn}/*/*/*"
}
` : ''}

${enableLogging ? `# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/apigateway/\${var.project_name}-\${var.environment}-api"
  retention_in_days = ${cfg.log_retention_days || 14}

  tags = {
    Name = "\${var.project_name}-\${var.environment}-api-logs"
  }
}
` : ''}

`;
  } else if (apiType === "http") {
    content += `# HTTP API Gateway
resource "aws_apigatewayv2_api" "main" {
  name          = "\${var.project_name}-\${var.environment}-http-api"
  protocol_type = "HTTP"
  description   = "HTTP API for ${projectName}"

  tags = {
    Name = "\${var.project_name}-\${var.environment}-http-api"
    Environment = "\${var.environment}"
  }
}

# HTTP API Integration
resource "aws_apigatewayv2_integration" "main" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "HTTP_PROXY"
  integration_uri  = "http://\${aws_lb.main.dns_name}"
  connection_type  = "INTERNET"

  request_parameters = {
    "overwrite:header.X-Forwarded-For" = "\$context.sourceIp"
  }
}

# HTTP API Route
resource "aws_apigatewayv2_route" "main" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "$default"
  target    = "integrations/\${aws_apigatewayv2_integration.main.id}"
}

# HTTP API Stage
resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "${stageName}"
  auto_deploy = true

  ${enableThrottling ? `
  default_route_settings {
    throttling_burst_limit = ${cfg.throttle_burst_limit || 200}
    throttling_rate_limit  = ${cfg.throttle_rate_limit || 100}
  }` : ''}

  tags = {
    Name = "\${var.project_name}-\${var.environment}-http-api-stage"
    Environment = "\${var.environment}"
  }
}

`;
  }

  // Add WAF if enabled
  if (enableWaf) {
    content += `# WAF Web ACL
resource "aws_wafv2_web_acl" "main" {
  name  = "\${var.project_name}-\${var.environment}-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "RateLimit"
    priority = 1

    statement {
      rate_based_statement {
        limit              = ${cfg.waf_rate_limit || 2000}
        aggregate_key_type = "IP"
      }
    }

    action {
      block {}
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "RateLimit"
      sampled_requests_enabled    = true
    }
  }

  tags = {
    Name = "\${var.project_name}-\${var.environment}-waf"
    Environment = "\${var.environment}"
  }
}

# WAF Association
resource "aws_wafv2_web_acl_association" "main" {
  resource_arn = ${apiType === "rest" ? 'aws_api_gateway_stage.main.arn' : 'aws_apigatewayv2_stage.main.arn'}
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}

`;
  }

  // Add CloudWatch alarms
  if (cfg.enable_monitoring === true) {
    if (apiType === "rest") {
      content += `# CloudWatch alarms for REST API
resource "aws_cloudwatch_metric_alarm" "api_4xx_errors" {
  alarm_name          = "\${var.project_name}-\${var.environment}-api-4xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "API has too many 4XX errors"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    ApiName = aws_api_gateway_rest_api.main.name
  }
}

resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "\${var.project_name}-\${var.environment}-api-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "API has too many 5XX errors"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    ApiName = aws_api_gateway_rest_api.main.name
  }
}
`;
    } else {
      content += `# CloudWatch alarms for HTTP API
resource "aws_cloudwatch_metric_alarm" "http_api_4xx_errors" {
  alarm_name          = "\${var.project_name}-\${var.environment}-http-api-4xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4xxError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "HTTP API has too many 4XX errors"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    ApiName = aws_apigatewayv2_api.main.name
  }
}

resource "aws_cloudwatch_metric_alarm" "http_api_5xx_errors" {
  alarm_name          = "\${var.project_name}-\${var.environment}-http-api-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5xxError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "HTTP API has too many 5XX errors"
  alarm_actions       = [aws_sns_topic.main.arn]

  dimensions = {
    ApiName = aws_apigatewayv2_api.main.name
  }
}
`;
    }
  }

  return {
    name: "api-gateway.tf",
    path: `${projectName}/api-gateway.tf`,
    content,
    language: "hcl",
  };
}
