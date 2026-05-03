import { GeneratedFile } from './types';
import { generateProvider } from './core/provider';
import { generateVariables } from './core/variables';
import { generateOutputs } from './core/outputs';
import { generateVpc } from './services/vpc';
import { generateEc2 } from './services/ec2';
import { generateS3 } from './services/s3';
import { generateRds } from './services/rds';
import { generateAlb } from './services/alb';
import { generateIam } from './services/iam';
import { generateRoute53 } from './services/route53';
import { generateEfs } from './services/efs';
import { generateSqs } from './services/sqs';
import { generateSns } from './services/sns';
import { generateLambda } from './services/lambda';
import { generateElastiCache } from './services/elasticache';
import { generateApiGateway } from './services/api-gateway';
import { generateCloudWatch } from './services/cloudwatch';
import { generateCloudFront } from './services/cloudfront';
import { generateEcs } from './services/ecs';
import { generateEks } from './services/eks';
import { generateDynamoDB } from './services/dynamodb';

export type { 
  ServiceConfig, 
  GeneratedFile, 
  GenerateRequest, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning 
} from './types';

export class TerraformGenerator {
  generate(
    services: string[],
    config: Record<string, any>,
    environment: string,
    region: string,
    projectName: string
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Provider / main.tf
    files.push(generateProvider(region, projectName, environment));

    // Variables
    files.push(generateVariables(services, config, environment, region, projectName));

    // Per-service files
    const serviceGenerators: Record<string, Function> = {
      vpc: generateVpc,
      ec2: generateEc2,
      s3: generateS3,
      rds: generateRds,
      alb: generateAlb,
      iam: generateIam,
      'route53': generateRoute53,
      'efs': generateEfs,
      'sqs': generateSqs,
      'sns': generateSns,
      'lambda': generateLambda,
      'elasticache': generateElastiCache,
      'api-gateway': generateApiGateway,
      'cloudwatch': generateCloudWatch,
      'cloudfront': generateCloudFront,
      'ecs': generateEcs,
      'eks': generateEks,
      'dynamodb': generateDynamoDB,
    };

    for (const svc of services) {
      const svcConfig = config[svc]?.config || {};
      const generator = serviceGenerators[svc];
      if (generator) {
        files.push(generator(svcConfig, environment, projectName));
      }
    }

    // Outputs
    files.push(generateOutputs(services, projectName));

    return files;
  }
}
