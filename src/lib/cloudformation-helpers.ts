/** CloudFront Route53 alias targets always use this hosted zone ID. */
export const CLOUDFRONT_HOSTED_ZONE_ID = "Z2FDTNDATAQYW2";

export type CloudFormationBuildContext = {
  publicSubnetCount: number;
  privateSubnetCount: number;
  selectedServices: string[];
};

export function getCloudFormationBuildContext(
  services: string[],
  config: Record<string, { config?: Record<string, unknown> }>
): CloudFormationBuildContext {
  const vpcConfig = config.vpc?.config ?? {};

  return {
    publicSubnetCount:
      parseInt(String(vpcConfig.public_subnets ?? "2"), 10) || 2,
    privateSubnetCount:
      parseInt(String(vpcConfig.private_subnets ?? "2"), 10) || 2,
    selectedServices: services,
  };
}

export function cfPublicSubnetRefs(count: number): { Ref: string }[] {
  return Array.from({ length: Math.max(count, 0) }, (_, index) => ({
    Ref: `PublicSubnet${index}`,
  }));
}

export function cfPrivateSubnetRefs(count: number): { Ref: string }[] {
  return Array.from({ length: Math.max(count, 0) }, (_, index) => ({
    Ref: `PrivateSubnet${index}`,
  }));
}

export function cfSubnetRefAt(
  context: CloudFormationBuildContext,
  index: number
): { Ref: string } {
  if (index < context.privateSubnetCount) {
    return { Ref: `PrivateSubnet${index}` };
  }

  const publicIndex = index - context.privateSubnetCount;
  if (publicIndex < context.publicSubnetCount) {
    return { Ref: `PublicSubnet${publicIndex}` };
  }

  return { Ref: "PrivateSubnet0" };
}

export function cfPublicSubnetIdsJoin(count: number) {
  return { "Fn::Join": [",", cfPublicSubnetRefs(count)] };
}

export function cfPrivateSubnetIdsJoin(count: number) {
  return { "Fn::Join": [",", cfPrivateSubnetRefs(count)] };
}
