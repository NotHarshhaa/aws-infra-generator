import { GeneratedFile } from '../types';

export function generateDynamoDB(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const tableName = cfg.table_name || "items";
  const billingMode = cfg.billing_mode || "PAY_PER_REQUEST";
  const readCapacity = cfg.read_capacity || 5;
  const writeCapacity = cfg.write_capacity || 5;
  const enableStreams = cfg.enable_streams === true;
  const enableEncryption = cfg.enable_encryption !== false;

  const content = `# DynamoDB Table
resource "aws_dynamodb_table" "main" {
  name           = "${'${var.project_name}-${var.environment}-'}${tableName}"
  billing_mode   = "${billingMode}"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  ${billingMode === "PROVISIONED" ? `
  read_capacity  = ${readCapacity}
  write_capacity = ${writeCapacity}` : ''}

  ${enableStreams ? `
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"` : ''}

  ${enableEncryption ? `
  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.dynamodb.arn
  }` : ''}

  point_in_time_recovery {
    enabled = true
  }

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-dynamodb'}"
  })
}

${enableEncryption ? `
# KMS Key for DynamoDB Encryption
resource "aws_kms_key" "dynamodb" {
  description = "KMS key for DynamoDB encryption"
  enable_key_rotation = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${'${data.aws_caller_identity.current.account_id}'}:root"
        }
        Action   = "kms:*"
        Resource  = "*"
      },
      {
        Sid = "Allow access for DynamoDB"
        Effect = "Allow"
        Principal = {
          Service = "dynamodb.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-dynamodb-kms'}"
  })
}

# KMS Key Alias
resource "aws_kms_alias" "dynamodb" {
  name          = "alias/${'${var.project_name}-${var.environment}-dynamodb'}"
  target_key_id = aws_kms_key.dynamodb.key_id
}` : ''}

${enableStreams ? `
# Lambda Function for DynamoDB Stream Processing (optional)
resource "aws_iam_role" "dynamodb_stream_processor" {
  name = "${'${var.project_name}-${var.environment}-dynamodb-stream-role'}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-dynamodb-stream-role'}"
  })
}

resource "aws_iam_role_policy_attachment" "dynamodb_stream_processor" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.dynamodb_stream_processor.name
}

resource "aws_iam_role_policy" "dynamodb_stream_processor" {
  name = "${'${var.project_name}-${var.environment}-dynamodb-stream-policy'}"
  role = aws_iam_role.dynamodb_stream_processor.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:DescribeTable",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ]
        Resource = [
          aws_dynamodb_table.main.arn,
          "${'${aws_dynamodb_table.main.arn}/*'}"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# CloudWatch Log Group for Stream Processor
resource "aws_cloudwatch_log_group" "dynamodb_stream" {
  name              = "/aws/lambda/${'${var.project_name}-${var.environment}-dynamodb-stream'}"
  retention_in_days = var.environment == "production" ? 90 : 30

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-dynamodb-stream-logs'}"
  })
}` : ''}

# Data source for current AWS account
data "aws_caller_identity" "current" {}`;

  return {
    name: "dynamodb.tf",
    path: `${projectName}/dynamodb.tf`,
    content,
    language: "hcl",
  };
}
