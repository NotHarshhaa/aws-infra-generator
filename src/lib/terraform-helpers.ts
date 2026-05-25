/** Build a Terraform list expression of indexed subnet resource IDs. */
export function terraformSubnetIdList(
  kind: "public" | "private",
  count: number
): string {
  if (count <= 0) {
    return "[]";
  }

  const ids = Array.from(
    { length: count },
    (_, index) => `aws_subnet.${kind}_${index}.id`
  );

  return `[${ids.join(", ")}]`;
}

/** Reference VPC-local subnet ID lists generated in vpc.tf. */
export function terraformLocalSubnetIds(kind: "public" | "private"): string {
  return `local.${kind}_subnet_ids`;
}
