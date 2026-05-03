import { ServiceBuilderResult } from '../types';

export function buildKinesis(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const streamType = cfg.stream_type || 'data-streams';
  const streamName = cfg.stream_name || 'data-stream';
  const shardCount = cfg.shard_count || 1;
  const retentionPeriod = cfg.retention_period || 24;
  const enableEncryption = cfg.enable_encryption !== false;

  if (streamType === 'data-streams') {
    const streamProps: any = {
      ShardCount: shardCount,
      RetentionPeriodHours: retentionPeriod,
      StreamMode: "PROVISIONED",
    };

    if (enableEncryption) {
      streamProps.StreamEncryption = {
        EncryptionType: "KMS",
        KeyId: "alias/aws/kinesis",
      };
    }

    resources.KinesisStream = {
      Type: "AWS::Kinesis::Stream",
      Properties: streamProps,
    };

    outputs.StreamArn = {
      Description: "Kinesis Data Stream ARN",
      Value: { "Fn::GetAtt": ["KinesisStream", "Arn"] },
    };

    outputs.StreamName = {
      Description: "Kinesis Data Stream Name",
      Value: { Ref: "KinesisStream" },
    };
  }

  return [resources, outputs];
}
