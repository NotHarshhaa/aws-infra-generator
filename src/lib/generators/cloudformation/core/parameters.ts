export function buildParameters(
  services: string[],
  config: Record<string, any>,
  environment: string,
  region: string,
  projectName: string
): any {
  const params: any = {
    Environment: {
      Type: "String",
      Default: environment,
      AllowedValues: ["development", "staging", "production"],
      Description: "Environment name",
    },
    ProjectName: {
      Type: "String",
      Default: projectName,
      Description: "Project name",
    },
  };

  if (services.includes("vpc")) {
    const vpcCfg = config.vpc?.config || {};
    params.VpcCidr = {
      Type: "String",
      Default: vpcCfg.cidr_block || "10.0.0.0/16",
      Description: "VPC CIDR block",
    };
  }

  if (services.includes("ec2")) {
    const ec2Cfg = config.ec2?.config || {};
    params.InstanceType = {
      Type: "String",
      Default: ec2Cfg.instance_type || "t3.micro",
      Description: "EC2 instance type",
    };
  }

  if (services.includes("rds")) {
    const rdsCfg = config.rds?.config || {};
    params.DBInstanceClass = {
      Type: "String",
      Default: rdsCfg.instance_class || "db.t3.micro",
      Description: "RDS instance class",
    };
    params.DBEngine = {
      Type: "String",
      Default: rdsCfg.engine || "postgres",
      Description: "Database engine",
    };
  }

  return params;
}
