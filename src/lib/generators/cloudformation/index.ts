import { GeneratedFile } from './types';
import { buildParameters } from './core/parameters';
import { buildVpc } from './services/vpc';
import { buildEc2 } from './services/ec2';
import { buildS3 } from './services/s3';
import { buildRds } from './services/rds';
import { buildAlb } from './services/alb';
import { buildIam } from './services/iam';

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
