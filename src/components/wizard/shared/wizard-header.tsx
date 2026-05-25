import type { LucideIcon } from "lucide-react";
import { wizardStyles } from "./wizard-styles";

interface WizardHeaderProps {
  step: string;
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function WizardHeader({ step, title, description, icon: Icon }: WizardHeaderProps) {
  return (
    <div className={wizardStyles.header}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
              Step {step}
            </span>
            <span className="h-1 w-1 rounded-full bg-orange-500/50" />
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">AWS Infra Wizard</span>
          </div>
          <h2 className={wizardStyles.headerTitle}>{title}</h2>
          <p className={wizardStyles.headerDesc}>{description}</p>
        </div>
      </div>
    </div>
  );
}
