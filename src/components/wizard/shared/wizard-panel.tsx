import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { wizardStyles } from "./wizard-styles";

interface WizardPanelProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  variant?: "default" | "accent";
  className?: string;
  bodyClassName?: string;
}

export function WizardPanel({
  title,
  description,
  icon: Icon,
  action,
  children,
  variant = "default",
  className,
  bodyClassName,
}: WizardPanelProps) {
  return (
    <div
      className={cn(
        variant === "accent" ? wizardStyles.panelAccent : wizardStyles.panel,
        className
      )}
    >
      {(title || action) && (
        <div className={wizardStyles.panelHeader}>
          <div className="min-w-0">
            {title && (
              <h3 className={wizardStyles.panelTitle}>
                {Icon && <Icon className="h-4 w-4 text-orange-500 shrink-0" />}
                <span className="truncate">{title}</span>
              </h3>
            )}
            {description && <p className={wizardStyles.panelDesc}>{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(wizardStyles.panelBody, !title && !action && "pt-3 sm:pt-4", bodyClassName)}>
        {children}
      </div>
    </div>
  );
}
