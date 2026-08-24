"use client";

import { Check, Layers, Settings, Sparkles, Download } from "lucide-react";
import { WizardStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS: {
  id: WizardStep;
  stepNum: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "services", stepNum: "1", label: "Select Services", shortLabel: "Services", icon: Layers },
  { id: "configure", stepNum: "2", label: "Configure Stack", shortLabel: "Config", icon: Settings },
  { id: "generate", stepNum: "3", label: "Generate IaC", shortLabel: "Generate", icon: Sparkles },
  { id: "export", stepNum: "4", label: "Export & Deploy", shortLabel: "Export", icon: Download },
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
    <nav className="mb-4 sm:mb-6 px-1">
      <div className="rounded-full border border-border/70 bg-card/85 backdrop-blur-2xl p-1.5 shadow-xs max-w-4xl mx-auto">
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
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
                  "group relative flex items-center justify-center gap-1.5 sm:gap-2.5 rounded-full px-2 py-2 sm:px-4 sm:py-2.5 transition-all text-left",
                  isActive
                    ? "bg-orange-500 text-white shadow-xs font-semibold"
                    : isCompleted
                    ? "bg-orange-500/10 text-orange-700 dark:text-orange-300 hover:bg-orange-500/15 cursor-pointer font-medium"
                    : "text-muted-foreground/60 cursor-not-allowed opacity-60 hover:opacity-75"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-transform group-hover:scale-105",
                    isActive
                      ? "bg-white text-orange-600 shadow-xs"
                      : isCompleted
                      ? "bg-orange-500 text-white"
                      : "bg-muted text-muted-foreground border border-border/50"
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  ) : (
                    <span>{step.stepNum}</span>
                  )}
                </span>
                
                <div className="min-w-0 flex items-center gap-1.5">
                  <Icon className={cn("h-3.5 w-3.5 hidden md:inline-block shrink-0", isActive ? "text-white" : isCompleted ? "text-orange-500" : "text-muted-foreground")} />
                  <span className="text-[11px] sm:text-xs tracking-tight truncate">
                    <span className="sm:hidden">{step.shortLabel}</span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
