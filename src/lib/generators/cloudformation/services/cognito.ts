import { ServiceBuilderResult } from '../types';

export function buildCognito(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const userPoolName = cfg.user_pool_name || 'my-user-pool';
  const enableSignIn = cfg.enable_sign_in !== false;
  const enableUserPoolClient = cfg.enable_user_pool_client !== false;

  const userPoolProps: any = {
    UserPoolName: {
      "Fn::Sub": `${"${projectName}-${environment}-${userPoolName}"}`,
    },
    AutoVerifiedAttributes: enableSignIn ? ["email"] : [],
    UsernameAttributes: enableSignIn ? ["email"] : [],
    Policies: {
      PasswordPolicy: {
        MinimumLength: 8,
        RequireLowercase: true,
        RequireNumbers: true,
        RequireSymbols: true,
        RequireUppercase: true,
      },
    },
  };

  resources.UserPool = {
    Type: "AWS::Cognito::UserPool",
    Properties: userPoolProps,
  };

  if (enableUserPoolClient) {
    resources.UserPoolClient = {
      Type: "AWS::Cognito::UserPoolClient",
      Properties: {
        ClientName: {
          "Fn::Sub": `${"${projectName}-${environment}-client"}`,
        },
        UserPoolId: { Ref: "UserPool" },
        ExplicitAuthFlows: [
          "ALLOW_USER_PASSWORD_AUTH",
          "ALLOW_USER_SRP_AUTH",
          "ALLOW_REFRESH_TOKEN_AUTH",
        ],
        GenerateSecret: false,
      },
    };
  }

  outputs.UserPoolId = {
    Description: "Cognito User Pool ID",
    Value: { Ref: "UserPool" },
  };

  outputs.UserPoolArn = {
    Description: "Cognito User Pool ARN",
    Value: { "Fn::GetAtt": ["UserPool", "Arn"] },
  };

  return [resources, outputs];
}
