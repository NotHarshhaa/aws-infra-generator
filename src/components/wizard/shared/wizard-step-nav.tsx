"use client";

import { Check, Layers, Settings, Sparkles, Download } from "lucide-react";
import { WizardStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS: {
  id: WizardStep;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "services", label: "Services", shortLabel: "Pick", icon: Layers },
  { id: "configure", label: "Configure", shortLabel: "Config", icon: Settings },
  { id: "generate", label: "Generate", shortLabel: "Gen", icon: Sparkles },
  { id: "export", label: "Export", shortLabel: "Export", icon: Download },
];

interface WizardStepNavProps {
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
  completedSteps: WizardStep[];
}

export function WizardStepNav({
  currentStep,
  onStepClick,
  completedSteps,
}: WizardStepNavProps) {
  return (
    <nav className="mb-3 sm:mb-5 px-1">
      <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm p-1 sm:p-1.5">
        <div className="grid grid-cols-4 gap-0.5 sm:gap-1">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            const isClickable = isCompleted || isActive;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5 transition-all",
                  isActive && "bg-orange-500 text-white shadow-md shadow-orange-500/20",
                  isCompleted &&
                    !isActive &&
                    "bg-orange-500/10 text-orange-700 dark:text-orange-300 hover:bg-orange-500/15 cursor-pointer",
                  !isActive &&
                    !isCompleted &&
                    "text-muted-foreground cursor-not-allowed opacity-50"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md text-xs",
                    isActive && "bg-white/20",
                    isCompleted && !isActive && "bg-orange-500/20",
                    !isActive && !isCompleted && "bg-muted"
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  ) : (
                    <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  )}
                </span>
                <span className="text-[10px] sm:text-sm font-medium leading-none">
                  <span className="sm:hidden">{step.shortLabel}</span>
                  <span className="hidden sm:inline">{step.label}</span>
                </span>
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-white/80 sm:hidden" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
