import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WizardPanel, WizardStatRow } from "@/components/wizard/shared";
import type { ServiceStats } from "./types";

interface InfrastructureOverviewProps {
  stats: ServiceStats;
  hasSelection: boolean;
  onClearAll: () => void;
}

export function InfrastructureOverview({
  stats,
  hasSelection,
  onClearAll,
}: InfrastructureOverviewProps) {
  return (
    <WizardPanel
      title="Stack Overview"
      description="Live estimate as you build"
      action={
        hasSelection ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 px-2 text-[11px] sm:text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Clear
          </Button>
        ) : undefined
      }
    >
      <WizardStatRow
        columns={5}
        stats={[
          { label: "Selected", value: stats.selectedServices, valueClassName: "text-orange-600 dark:text-orange-400" },
          { label: "Deps", value: stats.requiredDependencies, valueClassName: "text-blue-600" },
          { label: "Total", value: stats.totalServices, valueClassName: "text-emerald-600" },
          {
            label: "Complexity",
            value: (
              <Badge
                variant={
                  stats.estimatedComplexity === "High"
                    ? "destructive"
                    : stats.estimatedComplexity === "Medium"
                      ? "default"
                      : "secondary"
                }
                className="text-[10px] px-1.5 py-0"
              >
                {stats.estimatedComplexity}
              </Badge>
            ),
          },
          {
            label: "Cost",
            value: (
              <Badge
                variant={
                  stats.estimatedCost === "High"
                    ? "destructive"
                    : stats.estimatedCost === "Medium"
                      ? "default"
                      : "secondary"
                }
                className="text-[10px] px-1.5 py-0"
              >
                {stats.estimatedCost}
              </Badge>
            ),
          },
        ]}
      />
    </WizardPanel>
  );
}
