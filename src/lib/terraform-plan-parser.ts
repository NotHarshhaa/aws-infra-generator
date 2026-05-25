import type { GeneratedFile } from "./types";
import type {
  TerraformPlanAction,
  TerraformPlanSummary,
} from "./terraform-plan-types";

interface ParsedResource {
  type: string;
  name: string;
  attributes: { attribute: string; after: string }[];
}

const SENSITIVE_ATTRIBUTES = new Set([
  "password",
  "secret",
  "token",
  "private_key",
  "access_key",
  "secret_key",
]);

function extractResourceBlocks(content: string): ParsedResource[] {
  const resources: ParsedResource[] = [];
  const resourcePattern = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = resourcePattern.exec(content)) !== null) {
    const type = match[1];
    const name = match[2];
    const startIndex = match.index + match[0].length;
    let depth = 1;
    let index = startIndex;

    while (index < content.length && depth > 0) {
      const char = content[index];
      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;
      index += 1;
    }

    const body = content.slice(startIndex, index - 1);
    const attributes: { attribute: string; after: string }[] = [];

    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("dynamic ")) continue;
      if (trimmed.startsWith("tags") || trimmed.startsWith("lifecycle")) continue;

      const attrMatch = trimmed.match(/^([A-Za-z0-9_.]+)\s*=\s*(.+)$/);
      if (!attrMatch) continue;

      const attribute = attrMatch[1];
      let value = attrMatch[2].trim();
      if (value.endsWith(",")) value = value.slice(0, -1);

      attributes.push({ attribute, after: value });
      if (attributes.length >= 8) break;
    }

    resources.push({ type, name, attributes });
  }

  return resources;
}

function estimatePlanDuration(resourceCount: number): string {
  if (resourceCount <= 5) return "2-5 minutes";
  if (resourceCount <= 15) return "5-10 minutes";
  if (resourceCount <= 30) return "10-20 minutes";
  return "20+ minutes";
}

export function buildPlanSummaryFromTerraformFiles(
  files: GeneratedFile[]
): TerraformPlanSummary {
  const terraformFiles = files.filter(
    (file) => file.name.endsWith(".tf") || file.language === "hcl"
  );

  const actions: TerraformPlanAction[] = [];
  const warnings: string[] = [];

  for (const file of terraformFiles) {
    const parsed = extractResourceBlocks(file.content);
    for (const resource of parsed) {
      actions.push({
        action: "create",
        resourceType: resource.type,
        resourceName: resource.name,
        reason: `Defined in ${file.name}`,
        changes: resource.attributes.map(({ attribute, after }) => ({
          attribute,
          before: null,
          after,
          sensitive: SENSITIVE_ATTRIBUTES.has(attribute.toLowerCase()),
        })),
      });
    }
  }

  if (actions.some((action) => action.resourceType.includes("nat_gateway"))) {
    warnings.push("NAT Gateway resources can add recurring cost (~$32/month per gateway).");
  }

  if (actions.some((action) => action.resourceType.includes("db_instance"))) {
    warnings.push("RDS credentials may be stored in Terraform state. Consider AWS Secrets Manager.");
  }

  if (actions.some((action) => action.resourceType.includes("eks_cluster"))) {
    warnings.push("EKS cluster creation typically takes 10-15 minutes.");
  }

  const toCreate = actions.filter((action) => action.action === "create").length;
  const toUpdate = actions.filter((action) => action.action === "update").length;
  const toDestroy = actions.filter((action) => action.action === "destroy").length;
  const toRead = actions.filter((action) => action.action === "read").length;

  return {
    toCreate,
    toUpdate,
    toDestroy,
    toRead,
    actions,
    warnings,
    estimatedTime: estimatePlanDuration(toCreate + toUpdate + toDestroy),
  };
}

export type { ParsedResource };
