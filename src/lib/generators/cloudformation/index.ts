import { GeneratedFile } from './types';
import { buildParameters } from './core/parameters';
import { buildVpc } from './services/vpc';
import { buildEc2 } from './services/ec2';
import { buildS3 } from './services/s3';
import { buildRds } from './services/rds';
import { buildAlb } from './services/alb';
import { buildIam } from './services/iam';
import { generateRoute53 } from './services/route53';
import { generateEfs } from './services/efs';
import { generateSqs } from './services/sqs';
import { generateSns } from './services/sns';
import { generateLambda } from './services/lambda';
import { generateElastiCache } from './services/elasticache';
import { generateApiGateway } from './services/api-gateway';
import { generateCloudWatch } from './services/cloudwatch';
import { buildCloudFront } from './services/cloudfront';
import { buildEcs } from './services/ecs';
import { buildEks } from './services/eks';
import { buildDynamoDB } from './services/dynamodb';
import { buildStepFunctions } from './services/step-functions';
import { buildEventBridge } from './services/eventbridge';
import { buildKinesis } from './services/kinesis';
import { buildSecretsManager } from './services/secrets-manager';
import { buildKMS } from './services/kms';
import { buildAWSConfig } from './services/aws-config';
import { buildAWSBackup } from './services/aws-backup';
import { buildCognito } from './services/cognito';
import { buildCodeBuild } from './services/codebuild';
import { buildCodePipeline } from './services/codepipeline';
import { buildCodeDeploy } from './services/codedeploy';
import { buildCloudFormationStackSets } from './services/cloudformation-stacksets';

export type { 
  ServiceConfig, 
  GeneratedFile, 
  GenerateRequest, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  CloudFormationTemplate,
  ServiceBuilderResult
} from './types';

export class CloudFormationGenerator {
  generate(
    services: string[],
    config: Record<string, any>,
    environment: string,
    region: string,
    projectName: string
  ): GeneratedFile[] {
    const template: any = {
      AWSTemplateFormatVersion: "2010-09-09",
      Description: `CloudFormation template for ${projectName} (${environment})`,
      Parameters: buildParameters(services, config, environment, region, projectName),
      Resources: {},
      Outputs: {},
    };

    // Service builders mapping
    const serviceBuilders: Record<string, Function> = {
      vpc: buildVpc,
      ec2: buildEc2,
      s3: buildS3,
      rds: buildRds,
      alb: buildAlb,
      iam: buildIam,
      'route53': generateRoute53,
      'efs': generateEfs,
      'sqs': generateSqs,
      'sns': generateSns,
      'lambda': generateLambda,
      'elasticache': generateElastiCache,
      'api-gateway': generateApiGateway,
      'cloudwatch': generateCloudWatch,
      'cloudfront': buildCloudFront,
      'ecs': buildEcs,
      'eks': buildEks,
      'dynamodb': buildDynamoDB,
      'step-functions': buildStepFunctions,
      'eventbridge': buildEventBridge,
      'kinesis': buildKinesis,
      'secrets-manager': buildSecretsManager,
      'kms': buildKMS,
      'aws-config': buildAWSConfig,
      'aws-backup': buildAWSBackup,
      'cognito': buildCognito,
      'codebuild': buildCodeBuild,
      'codepipeline': buildCodePipeline,
      'codedeploy': buildCodeDeploy,
      'cloudformation-stacksets': buildCloudFormationStackSets,
    };

    // Build resources and outputs for each service
    for (const svc of services) {
      const svcConfig = config[svc]?.config || {};
      const builder = serviceBuilders[svc];
      if (builder) {
        const [resources, outputs] = builder(svcConfig, environment, projectName);
        Object.assign(template.Resources, resources);
        Object.assign(template.Outputs, outputs);
      }
    }

    const content = JSON.stringify(template, null, 2);

    return [
      {
        name: "template.json",
        path: `${projectName}/template.json`,
        content,
        language: "json",
      },
    ];
  }
}
