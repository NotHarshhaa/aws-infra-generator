import { CloudFormationTemplate, ServiceBuilderResult } from '../types';

export function buildDynamoDB(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const tableName = cfg.table_name || "items";
  const billingMode = cfg.billing_mode || "PAY_PER_REQUEST";
  const readCapacity = cfg.read_capacity || 5;
  const writeCapacity = cfg.write_capacity || 5;
  const enableStreams = cfg.enable_streams === true;
  const enableEncryption = cfg.enable_encryption !== false;

  const resources: any = {
    DynamoDBTable: {
      Type: "AWS::DynamoDB::Table",
      Properties: {
        TableName: `${projectName}-${environment}-${tableName}`,
        BillingMode: billingMode,
        AttributeDefinitions: [
          {
            AttributeName: "id",
            AttributeType: "S"
          }
        ],
        KeySchema: [
          {
            AttributeName: "id",
            KeyType: "HASH"
          }
        ],
        ...(billingMode === "PROVISIONED" && {
          ProvisionedThroughput: {
            ReadCapacityUnits: readCapacity,
            WriteCapacityUnits: writeCapacity
          }
        }),
        ...(enableStreams && {
          StreamSpecification: {
            StreamViewType: "NEW_AND_OLD_IMAGES"
          }
        }),
        ...(enableEncryption && {
          SSESpecification: {
            SSEEnabled: true,
            SSEType: "KMS",
            KMSMasterKeyId: { "Ref": "DynamoDBKMSKey" }
          }
        }),
        PointInTimeRecoverySpecification: {
          PointInTimeRecoveryEnabled: true
        },
        Tags: [
          {
            Key: "Name",
            Value: `${projectName}-${environment}-dynamodb`
          }
        ]
      }
    },
    ...(enableEncryption && {
      DynamoDBKMSKey: {
        Type: "AWS::KMS::Key",
        Properties: {
          Description: "KMS key for DynamoDB encryption",
          EnableKeyRotation: true,
          KeyPolicy: {
            Version: "2012-10-17",
            Statement: [
              {
                Sid: "Enable IAM User Permissions",
                Effect: "Allow",
                Principal: {
                  AWS: { "Fn::Sub": "arn:aws:iam::${AWS::AccountId}:root" }
                },
                Action: "kms:*",
                Resource: "*"
              },
              {
                Sid: "Allow access for DynamoDB",
                Effect: "Allow",
                Principal: {
                  Service: "dynamodb.amazonaws.com"
                },
                Action: [
                  "kms:Encrypt",
                  "kms:Decrypt",
                  "kms:ReEncrypt*",
                  "kms:GenerateDataKey*",
                  "kms:DescribeKey"
                ],
                Resource: "*"
              }
            ]
          },
          Tags: [
            {
              Key: "Name",
              Value: `${projectName}-${environment}-dynamodb-kms`
            }
          ]
        }
      },
      DynamoDBKMSKeyAlias: {
        Type: "AWS::KMS::Alias",
        Properties: {
          AliasName: `alias/${projectName}-${environment}-dynamodb`,
          TargetKeyId: { "Ref": "DynamoDBKMSKey" }
        }
      }
    }),
    ...(enableStreams && {
      DynamoDBStreamProcessorRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: `${projectName}-${environment}-dynamodb-stream-role`,
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: {
                  Service: "lambda.amazonaws.com"
                },
                Action: "sts:AssumeRole"
              }
            ]
          },
          ManagedPolicyArns: [
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
          ],
          Policies: [
            {
              PolicyName: `${projectName}-${environment}-dynamodb-stream-policy`,
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: [
                      "dynamodb:DescribeTable",
                      "dynamodb:Query",
                      "dynamodb:Scan",
                      "dynamodb:GetItem",
                      "dynamodb:PutItem",
                      "dynamodb:UpdateItem",
                      "dynamodb:DeleteItem"
                    ],
                    Resource: [
                      { "Fn::GetAtt": ["DynamoDBTable", "Arn"] },
                      {
                        "Fn::Join": [
                          "",
                          [
                            { "Fn::GetAtt": ["DynamoDBTable", "Arn"] },
                            "/*"
                          ]
                        ]
                      }
                    ]
                  },
                  {
                    Effect: "Allow",
                    Action: [
                      "logs:CreateLogGroup",
                      "logs:CreateLogStream",
                      "logs:PutLogEvents"
                    ],
                    Resource: "arn:aws:logs:*:*:*"
                  }
                ]
              }
            }
          ],
          Tags: [
            {
              Key: "Name",
              Value: `${projectName}-${environment}-dynamodb-stream-role`
            }
          ]
        }
      },
      DynamoDBStreamLogGroup: {
        Type: "AWS::Logs::LogGroup",
        Properties: {
          LogGroupName: `/aws/lambda/${projectName}-${environment}-dynamodb-stream`,
          RetentionInDays: environment === "production" ? 90 : 30,
          Tags: [
            {
              Key: "Name",
              Value: `${projectName}-${environment}-dynamodb-stream-logs`
            }
          ]
        }
      }
    })
  };

  const outputs: any = {
    DynamoDBTableName: {
      Description: "DynamoDB table name",
      Value: { "Ref": "DynamoDBTable" }
    },
    DynamoDBTableArn: {
      Description: "DynamoDB table ARN",
      Value: { "Fn::GetAtt": ["DynamoDBTable", "Arn"] }
    },
    ...(enableStreams && {
      DynamoDBStreamArn: {
        Description: "DynamoDB stream ARN",
        Value: { "Fn::GetAtt": ["DynamoDBTable", "StreamArn"] }
      }
    }),
    ...(enableEncryption && {
      DynamoDBKMSKeyId: {
        Description: "KMS key ID for DynamoDB encryption",
        Value: { "Ref": "DynamoDBKMSKey" }
      }
    })
  };

  return [resources, outputs];
}
