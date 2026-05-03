import { GeneratedFile } from '../types';

export function generateCloudFront(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const priceClass = cfg.price_class || "PriceClass_100";
  const defaultTtl = cfg.default_ttl || 86400;
  const enableCompress = cfg.enable_compress !== false;
  const httpsOnly = cfg.enable_https_only !== false;

  const content = `# CloudFront Distribution for S3 content
resource "aws_cloudfront_distribution" "main" {
  enabled = true
  is_ipv6_enabled = true
  comment = "${'${var.project_name}-${var.environment}'} distribution"
  default_root_object = "index.html"

  price_class = "${priceClass}"

  # S3 Origin
  origin {
    domain_name = aws_s3_bucket.app.bucket_regional_domain_name
    origin_id = "S3-${'${var.project_name}-${var.environment}'}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }

  # Default Cache Behavior
  default_cache_behavior {
    allowed_methods = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = "S3-${'${var.project_name}-${var.environment}'}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "${httpsOnly ? "redirect-to-https" : "allow-all"}"
    compress = ${enableCompress}
    default_ttl = ${defaultTtl}
    min_ttl = 0
    max_ttl = 31536000
  }

  # Restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL Certificate
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-cloudfront'}"
  })
}

# Origin Access Identity for S3 access
resource "aws_cloudfront_origin_access_identity" "main" {
  comment = "Origin Access Identity for ${'${var.project_name}-${var.environment}'}"

  tags = merge(local.common_tags, {
    Name = "${'${var.project_name}-${var.environment}-oai'}"
  })
}

# S3 Bucket Policy for CloudFront access
resource "aws_s3_bucket_policy" "cloudfront" {
  bucket = aws_s3_bucket.app.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action = "s3:GetObject"
        Resource = "${'${aws_s3_bucket.app.arn}/*'}"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.main.arn
          }
        }
      }
    ]
  })
}`;

  return {
    name: "cloudfront.tf",
    path: `${projectName}/cloudfront.tf`,
    content,
    language: "hcl",
  };
}
