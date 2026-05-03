import { ServiceBuilderResult } from '../types';

export function buildKMS(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const keyType = cfg.key_type || 'symmetric';
  const keySpec = cfg.key_spec || 'SYMMETRIC_DEFAULT';
  const enableKeyRotation = cfg.enable_key_rotation === true;

  const keyProps: any = {
    Description: `${keyType} KMS key for ${projectName}`,
    Enabled: true,
    EnableKeyRotation: enableKeyRotation,
    KeySpec: keySpec,
    KeyUsage: "ENCRYPT_DECRYPT",
  };

  resources.KMSKey = {
    Type: "AWS::KMS::Key",
    Properties: keyProps,
  };

  resources.KMSKeyAlias = {
    Type: "AWS::KMS::Alias",
    Properties: {
      AliasName: {
        "Fn::Sub": `alias/${"${projectName}-${environment}-key"}`,
      },
      TargetKeyId: { Ref: "KMSKey" },
    },
  };

  outputs.KeyArn = {
    Description: "KMS Key ARN",
    Value: { "Fn::GetAtt": ["KMSKey", "Arn"] },
  };

  outputs.KeyId = {
    Description: "KMS Key ID",
    Value: { Ref: "KMSKey" },
  };

  return [resources, outputs];
}
