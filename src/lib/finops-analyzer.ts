import { ServiceConfig } from "./types";

export interface FinOpsRecommendation {
  id: string;
  category: "compute" | "storage" | "database" | "commitment";
  title: string;
  description: string;
  monthlySavingsUsd: number;
  percentageSavings: number;
  effort: "low" | "medium" | "high";
  serviceId: string;
  autoFixAction?: {
    serviceId: string;
    key: string;
    value: string | number | boolean;
  };
}

export interface FinOpsAnalysis {
  monthlyBaseCostUsd: number;
  potentialMonthlySavingsUsd: number;
  savingsPlans1YrDiscountUsd: number;
  savingsPlans3YrDiscountUsd: number;
  recommendations: FinOpsRecommendation[];
}

export function analyzeFinOps(
  selectedServices: string[],
  serviceConfig: ServiceConfig,
  baseMonthlyCost: number
): FinOpsAnalysis {
  const recommendations: FinOpsRecommendation[] = [];

  // 1. EC2 Graviton Optimization
  if (selectedServices.includes("ec2") && serviceConfig.ec2?.enabled) {
    const instanceType = String(serviceConfig.ec2.config?.instance_type || "t3.micro");
    if (instanceType.startsWith("t3.") || instanceType.startsWith("t2.") || instanceType.startsWith("m5.") || instanceType.startsWith("c5.")) {
      const gravitonReplacement = instanceType
        .replace("t3.", "t4g.")
        .replace("t2.", "t4g.")
        .replace("m5.", "m6g.")
        .replace("c5.", "c7g.");

      recommendations.push({
        id: "finops-ec2-graviton",
        category: "compute",
        title: `Switch to AWS Graviton (${gravitonReplacement})`,
        description: `Upgrading from ${instanceType} to Arm-based ${gravitonReplacement} delivers up to 20% lower hourly cost with 40% better price/performance.`,
        monthlySavingsUsd: 14.5,
        percentageSavings: 20,
        effort: "low",
        serviceId: "ec2",
        autoFixAction: {
          serviceId: "ec2",
          key: "instance_type",
          value: gravitonReplacement,
        },
      });
    }
  }

  // 2. RDS Graviton Instance
  if (selectedServices.includes("rds") && serviceConfig.rds?.enabled) {
    const instanceClass = String(serviceConfig.rds.config?.instance_class || "db.t3.micro");
    if (instanceClass.includes("db.t3.") || instanceClass.includes("db.m5.")) {
      const gravitonClass = instanceClass
        .replace("db.t3.", "db.t4g.")
        .replace("db.m5.", "db.m6g.");

      recommendations.push({
        id: "finops-rds-graviton",
        category: "database",
        title: `Upgrade RDS to Graviton (${gravitonClass})`,
        description: `Deploying RDS instances on ${gravitonClass} provides a seamless, drop-in 20% cost reduction with reduced p99 query latencies.`,
        monthlySavingsUsd: 22.0,
        percentageSavings: 20,
        effort: "low",
        serviceId: "rds",
        autoFixAction: {
          serviceId: "rds",
          key: "instance_class",
          value: gravitonClass,
        },
      });
    }
  }

  // 3. S3 Intelligent-Tiering
  if (selectedServices.includes("s3") && serviceConfig.s3?.enabled) {
    recommendations.push({
      id: "finops-s3-tiering",
      category: "storage",
      title: "Enable S3 Intelligent-Tiering Storage Class",
      description: "Automatically move infrequently accessed objects across tiers to slash monthly storage costs by up to 68% without retrieval fees.",
      monthlySavingsUsd: 18.0,
      percentageSavings: 35,
      effort: "low",
      serviceId: "s3",
    });
  }

  // 4. Compute Savings Plans 1-Yr / 3-Yr Projections
  const savingsPlans1YrDiscountUsd = Math.round(baseMonthlyCost * 0.28 * 100) / 100;
  const savingsPlans3YrDiscountUsd = Math.round(baseMonthlyCost * 0.52 * 100) / 100;

  const totalRecommendationSavings = recommendations.reduce(
    (sum, r) => sum + r.monthlySavingsUsd,
    0
  );

  return {
    monthlyBaseCostUsd: baseMonthlyCost,
    potentialMonthlySavingsUsd: totalRecommendationSavings,
    savingsPlans1YrDiscountUsd,
    savingsPlans3YrDiscountUsd,
    recommendations,
  };
}
