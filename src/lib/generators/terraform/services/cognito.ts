import { GeneratedFile } from '../types';

export function generateCognito(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const userPoolName = cfg.user_pool_name || 'my-user-pool';
  const enableSignIn = cfg.enable_sign_in !== false;
  const enableUserPoolClient = cfg.enable_user_pool_client !== false;

  const content = `# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "\${var.project_name}-\${var.environment}-${userPoolName}"

  ${enableSignIn ? `username_attributes      = ["email"]
  auto_verified_attributes = ["email"]` : ''}

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  tags = merge(local.common_tags, {
    Name = "\${var.project_name}-\${var.environment}-${userPoolName}"
  })
}

${enableUserPoolClient ? `# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "main" {
  name         = "\${var.project_name}-\${var.environment}-client"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  generate_secret = false
}` : ''}`;

  return {
    name: "cognito.tf",
    path: `${projectName}/cognito.tf`,
    content,
    language: "hcl",
  };
}
