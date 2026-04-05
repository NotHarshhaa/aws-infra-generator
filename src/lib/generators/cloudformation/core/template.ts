import { CloudFormationTemplate, GeneratedFile } from '../types';

export function buildTemplate(
  services: string[],
  config: Record<string, any>,
  environment: string,
  region: string,
  projectName: string,
  serviceBuilders: Record<string, Function>
): GeneratedFile[] {
  const template: CloudFormationTemplate = {
    AWSTemplateFormatVersion: "2010-09-09",
    Description: `CloudFormation template for ${projectName} (${environment})`,
    Parameters: {}, // Will be filled by buildParameters
    Resources: {},
    Outputs: {},
  };

  // Build parameters first
  const { buildParameters } = require('./parameters');
  template.Parameters = buildParameters(services, config, environment, region, projectName);

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
