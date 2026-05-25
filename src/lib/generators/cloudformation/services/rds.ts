import { ServiceBuilderResult } from '../types';
import {
  cfPrivateSubnetRefs,
  type CloudFormationBuildContext,
} from '../../../cloudformation-helpers';

export function buildRds(
  cfg: Record<string, any>,
  environment: string,
  projectName: string,
  context?: CloudFormationBuildContext
): ServiceBuilderResult {
  const resources: any = {};
  const outputs: any = {};

  const engine = cfg.engine || "postgres";
  const engineVersion = cfg.engine_version || "16";
  const instanceClass = cfg.instance_class || "db.t3.micro";
  const storage = cfg.allocated_storage || 20;
  const multiAz = cfg.multi_az === true;
  const backupRetention = cfg.backup_retention || 7;
  const port = engine === "postgres" ? 5432 : 3306;

  resources.DBSubnetGroup = {
    Type: "AWS::RDS::DBSubnetGroup",
    Properties: {
      DBSubnetGroupDescription: "Database subnet group",
      SubnetIds: cfPrivateSubnetRefs(context?.privateSubnetCount ?? 2),
      Tags: [
        {
          Key: "Name",
          Value: {
            "Fn::Sub": "${ProjectName}-${Environment}-db-subnet",
          },
        },
      ],
    },
  };

  resources.RDSSecurityGroup = {
    Type: "AWS::EC2::SecurityGroup",
    Properties: {
      GroupDescription: "RDS security group",
      VpcId: { Ref: "VPC" },
      SecurityGroupIngress: [
        {
          IpProtocol: "tcp",
          FromPort: port,
          ToPort: port,
          CidrIp: { Ref: "VpcCidr" },
          Description: "Database access from VPC",
        },
      ],
      Tags: [
        {
          Key: "Name",
          Value: {
            "Fn::Sub": "${ProjectName}-${Environment}-rds-sg",
          },
        },
      ],
    },
  };

  resources.RDSInstance = {
    Type: "AWS::RDS::DBInstance",
    Properties: {
      DBInstanceIdentifier: {
        "Fn::Sub": "${ProjectName}-${Environment}-db",
      },
      Engine: { Ref: "DBEngine" },
      EngineVersion: engineVersion,
      DBInstanceClass: { Ref: "DBInstanceClass" },
      AllocatedStorage: storage,
      StorageType: "gp3",
      StorageEncrypted: true,
      MasterUsername: "dbadmin",
      MasterUserPassword: "CHANGE_ME_IMMEDIATELY",
      DBSubnetGroupName: { Ref: "DBSubnetGroup" },
      VPCSecurityGroups: [{ Ref: "RDSSecurityGroup" }],
      MultiAZ: multiAz,
      BackupRetentionPeriod: backupRetention,
      Tags: [
        {
          Key: "Name",
          Value: {
            "Fn::Sub": "${ProjectName}-${Environment}-db",
          },
        },
      ],
    },
  };

  outputs.RDSEndpoint = {
    Description: "RDS Endpoint",
    Value: { "Fn::GetAtt": ["RDSInstance", "Endpoint.Address"] },
  };
  outputs.RDSPort = {
    Description: "RDS Port",
    Value: { "Fn::GetAtt": ["RDSInstance", "Endpoint.Port"] },
  };

  return [resources, outputs];
}
