import { GeneratedFile } from '../types';

export function generateS3(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const bucketSuffix = cfg.bucket_name || "data";
  const versioning = cfg.versioning !== false;
  const encryption = cfg.encryption || "AES256";
  const blockPublic = cfg.block_public_access !== false;
  const lifecycleDays = cfg.lifecycle_days || 30;

  const content = `# S3 Bucket with proper security and lifecycle management
resource "aws_s3_bucket" "main" {
  bucket = "${'${var.project_name}-${var.environment}-'}${bucketSuffix}"

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-'}${bucketSuffix}"
  })
}

# S3 Bucket versioning configuration
resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id

  versioning_configuration {
    status = "${versioning ? 'Enabled' : 'Disabled'}"
  }
}

${encryption !== "none" ? `
# S3 Bucket server-side encryption configuration
resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "${encryption}"
    }
  }
}` : ''}

${blockPublic ? `
# S3 Bucket public access block for security
resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}` : ''}

# S3 Bucket lifecycle configuration for cost optimization
resource "aws_s3_bucket_lifecycle_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    id     = "lifecycle_policy"
    status = "Enabled"

    transition {
      days          = ${lifecycleDays}
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = ${lifecycleDays + 30}
      storage_class = "GLACIER"
    }

    transition {
      days          = ${lifecycleDays + 90}
      storage_class = "DEEP_ARCHIVE"
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }

    abort_incomplete_multipart_upload {
      days = 7
    }
  }
}

# S3 Bucket logging configuration (optional)
resource "aws_s3_bucket_logging" "main" {
  bucket = aws_s3_bucket.main.id

  target_bucket = aws_s3_bucket.main.id
  target_prefix = "log/"
}

# S3 Bucket policy for additional security
resource "aws_s3_bucket_policy" "main" {
  bucket = aws_s3_bucket.main.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "AllowSSLRequestsOnly"
        Action = "s3:*"
        Effect = "Deny"
        Resource = [
          aws_s3_bucket.main.arn,
          "${'${aws_s3_bucket.main.arn}/*'}"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport": "false"
          }
        }
        Principal = "*"
      }
    ]
  })
}`;

  return {
    name: "s3.tf",
    path: `${projectName}/s3.tf`,
    content,
    language: "hcl",
  };
}
