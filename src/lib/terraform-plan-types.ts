export interface TerraformPlanAction {
  action: "create" | "update" | "destroy" | "read" | "no-op";
  resourceType: string;
  resourceName: string;
  changes: PlanChange[];
  reason?: string;
}

export interface PlanChange {
  attribute: string;
  before: string | number | boolean | null;
  after: string | number | boolean | null;
  sensitive?: boolean;
}

export interface TerraformPlanSummary {
  toCreate: number;
  toUpdate: number;
  toDestroy: number;
  toRead: number;
  actions: TerraformPlanAction[];
  warnings: string[];
  estimatedTime: string;
}
