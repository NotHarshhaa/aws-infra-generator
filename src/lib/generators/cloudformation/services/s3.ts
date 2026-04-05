import { ServiceBuilderResult } from '../types';

export function buildS3(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const bucketSuffix = cfg.bucket_name || "data";
  const versioning = cfg.versioning !== false;
  const encryption = cfg.encryption || "AES256";
  const blockPublic = cfg.block_public_access !== false;

  const bucketConfig: any = {
    Type: "AWS::S3::Bucket",
    Properties: {
      BucketName: {
        "Fn::Sub": `${"${ProjectName}-${Environment}-"}${bucketSuffix}`,
      },
      Tags: [
        {
          Key: "Name",
          Value: {
            "Fn::Sub": `${"${ProjectName}-${Environment}-"}${bucketSuffix}`,
          },
        },
      ],
    },
  };

  if (versioning) {
    bucketConfig.Properties.VersioningConfiguration = {
      Status: "Enabled",
    };
  }

  if (encryption !== "none") {
    bucketConfig.Properties.BucketEncryption = {
      ServerSideEncryptionConfiguration: [
        {
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: encryption,
          },
        },
      ],
    };
  }

  if (blockPublic) {
    bucketConfig.Properties.PublicAccessBlockConfiguration = {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    };
  }

  resources.S3Bucket = bucketConfig;

  outputs.S3BucketName = {
    Description: "S3 Bucket Name",
    Value: { Ref: "S3Bucket" },
  };
  outputs.S3BucketArn = {
    Description: "S3 Bucket ARN",
    Value: { "Fn::GetAtt": ["S3Bucket", "Arn"] },
  };

  return [resources, outputs];
}
