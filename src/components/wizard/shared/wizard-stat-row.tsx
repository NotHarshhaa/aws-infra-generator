import { cn } from "@/lib/utils";
import { wizardStyles } from "./wizard-styles";

export interface WizardStatItem {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

interface WizardStatRowProps {
  stats: WizardStatItem[];
  columns?: 2 | 3 | 4 | 5;
}

export function WizardStatRow({ stats, columns = 4 }: WizardStatRowProps) {
  const gridClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-5",
  }[columns];

  return (
    <div className={cn("grid gap-1.5 sm:gap-2", gridClass)}>
      {stats.map((stat) => (
        <div key={stat.label} className={wizardStyles.statChip}>
          <div className={cn(wizardStyles.statValue, stat.valueClassName)}>{stat.value}</div>
          <div className={wizardStyles.statLabel}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
