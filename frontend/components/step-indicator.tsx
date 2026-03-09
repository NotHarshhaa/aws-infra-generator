"use client";

import { Check, ChevronRight } from "lucide-react";
import { WizardStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS: { id: WizardStep; label: string; number: number }[] = [
  { id: "services", label: "Select Services", number: 1 },
  { id: "configure", label: "Configure", number: 2 },
  { id: "generate", label: "Generate", number: 3 },
  { id: "export", label: "Export", number: 4 },
];

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
  completedSteps: WizardStep[];
}

export function StepIndicator({
  currentStep,
  onStepClick,
  completedSteps,
}: StepIndicatorProps) {
  return (
    <nav className="flex items-center justify-center gap-0.5 sm:gap-2 py-4 sm:py-6 overflow-x-auto px-2">
      <div className="flex items-center gap-0.5 sm:gap-2 min-w-max">
        {STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isClickable = isCompleted || isActive;

          return (
            <div key={step.id} className="flex items-center gap-0.5 sm:gap-2">
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 rounded-full px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                  isActive &&
                    "bg-primary text-primary-foreground shadow-md",
                  isCompleted &&
                    !isActive &&
                    "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer",
                  !isActive &&
                    !isCompleted &&
                    "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-xs font-bold",
                    isActive && "bg-primary-foreground text-primary",
                    isCompleted && !isActive && "bg-primary text-primary-foreground",
                    !isActive && !isCompleted && "bg-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  ) : (
                    step.number
                  )}
                </span>
                <span className="hidden xs:inline sm:inline">{step.label}</span>
              </button>
              {index < STEPS.length - 1 && (
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
