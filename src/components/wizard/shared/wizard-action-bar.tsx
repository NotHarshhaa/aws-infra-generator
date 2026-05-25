import type { ReactNode } from "react";
import { wizardStyles } from "./wizard-styles";

interface WizardActionBarProps {
  children: ReactNode;
}

export function WizardActionBar({ children }: WizardActionBarProps) {
  return (
    <div className={wizardStyles.actionBar}>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {children}
      </div>
    </div>
  );
}
