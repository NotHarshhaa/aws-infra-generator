import { ServiceBuilderResult } from '../types';

export function buildSecretsManager(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const secretName = cfg.secret_name || 'db-credentials';
  const enableRotation = cfg.enable_rotation === true;
  const rotationIntervalDays = cfg.rotation_interval_days || 30;

  const secretProps: any = {
    Name: {
      "Fn::Sub": `${"${projectName}-${environment}-${secretName}"}`,
    },
    Description: `${cfg.secret_type || 'generic'} secret for ${projectName}`,
    SecretString: JSON.stringify({
      username: "admin",
      password: "CHANGE_ME_PASSWORD",
    }),
  };

  if (enableRotation) {
    secretProps.RotationRules = {
      AutomaticallyAfterDays: rotationIntervalDays,
    };
  }

  resources.Secret = {
    Type: "AWS::SecretsManager::Secret",
    Properties: secretProps,
  };

  outputs.SecretArn = {
    Description: "Secrets Manager Secret ARN",
    Value: { Ref: "Secret" },
  };

  outputs.SecretName = {
    Description: "Secrets Manager Secret Name",
    Value: { Ref: "Secret" },
  };

  return [resources, outputs];
}
