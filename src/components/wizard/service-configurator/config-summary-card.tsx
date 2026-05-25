import { Badge } from "@/components/ui/badge";
import { WizardPanel, WizardStatRow } from "@/components/wizard/shared";

interface ConfigSummaryCardProps {
  serviceCount: number;
  environment: string;
  region: string;
  hasErrors: boolean;
}

export function ConfigSummaryCard({
  serviceCount,
  environment,
  region,
  hasErrors,
}: ConfigSummaryCardProps) {
  return (
    <WizardPanel title="Summary" description="Quick snapshot">
      <WizardStatRow
        columns={3}
        stats={[
          { label: "Services", value: serviceCount, valueClassName: "text-orange-600" },
          {
            label: "Environment",
            value: (
              <Badge variant="secondary" className="text-[10px] capitalize">
                {environment}
              </Badge>
            ),
          },
          {
            label: "Region",
            value: region.split("-")[1]?.toUpperCase() || region,
          },
        ]}
      />
      {hasErrors && (
        <div className="mt-2 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1.5">
          <p className="text-[11px] text-red-600 dark:text-red-400">
            Fix validation errors before generating
          </p>
        </div>
      )}
    </WizardPanel>
  );
}
