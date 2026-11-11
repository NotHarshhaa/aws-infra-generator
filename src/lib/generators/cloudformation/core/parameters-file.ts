import { GeneratedFile } from '../types';

export function generateParametersFile(
  services: string[],
  config: Record<string, any>,
  environment: string,
  region: string,
  projectName: string
): GeneratedFile {
  const params: Array<{ ParameterKey: string; ParameterValue: string }> = [
    { ParameterKey: "ProjectName", ParameterValue: projectName },
    { ParameterKey: "Environment", ParameterValue: environment },
    { ParameterKey: "AwsRegion", ParameterValue: region },
  ];

  if (services.includes("vpc")) {
    const vpcCfg = config.vpc?.config || {};
    params.push({
      ParameterKey: "VpcCidr",
      ParameterValue: String(vpcCfg.cidr_block || "10.0.0.0/16"),
    });
  }

  if (services.includes("ec2")) {
    const ec2Cfg = config.ec2?.config || {};
    params.push({
      ParameterKey: "InstanceType",
      ParameterValue: String(ec2Cfg.instance_type || "t3.micro"),
    });
  }

  if (services.includes("rds")) {
    const rdsCfg = config.rds?.config || {};
    params.push({
      ParameterKey: "DBInstanceClass",
      ParameterValue: String(rdsCfg.instance_class || "db.t3.micro"),
    });
  }

  const content = JSON.stringify(params, null, 2);

  return {
    name: "parameters.json",
    path: `${projectName}/parameters.json`,
    content,
    language: "json",
  };
}
