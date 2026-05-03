import { GeneratedFile } from '../types';

export function generateCloudFormationStackSets(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const stackSetName = cfg.stackset_name || 'my-stackset';

  const content = `# CloudFormation StackSet
resource "aws_cloudformation_stack_set" "main" {
  name = "\${var.project_name}-\${var.environment}-${stackSetName}"
  description = "StackSet for \${var.project_name} multi-account deployment"
  permission_model = "SELF_MANAGED"
  capabilities = ["CAPABILITY_IAM"]

  template_body = jsonencode({
    AWSTemplateFormatVersion = "2010-09-09"
    Description = "Template for \${var.project_name} stack instances"
    Resources = {
      ExampleResource = {
        Type = "AWS::S3::Bucket"
        Properties = {
          BucketName = "\${var.project_name}-\${var.environment}-example"
        }
      }
    }
  })

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-${stackSetName}"
  })
}`;

  return {
    name: "cloudformation-stacksets.tf",
    path: `${projectName}/cloudformation-stacksets.tf`,
    content,
    language: "hcl",
  };
}
