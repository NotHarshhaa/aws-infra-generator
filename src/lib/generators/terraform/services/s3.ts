import { GeneratedFile } from '../types';

export function generateS3(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const bucketSuffix = cfg.bucket_name || "data";
  const versioning = cfg.versioning !== false;
  const encryption = cfg.encryption || "AES256";
  const blockPublic = cfg.block_public_access !== false;

  let content = `resource "aws_s3_bucket" "main" {
  bucket = "${'${var.project_name}-${var.environment}-'}${bucketSuffix}"

  tags = {
    Name = "${'${var.project_name}-${var.environment}-'}${bucketSuffix}"
  }
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id

  versioning_configuration {
    status = "${versioning ? 'Enabled' : 'Disabled'}"
  }
}`;

  if (encryption !== "none") {
    content += `

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "${encryption}"
    }
  }
}`;
  }

  if (blockPublic) {
    content += `

resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`;
  }

  return {
    name: "s3.tf",
    path: `${projectName}/s3.tf`,
    content,
    language: "hcl",
  };
}
