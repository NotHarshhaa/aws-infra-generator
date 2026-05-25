import { Server, Zap } from "lucide-react";
import { wizardStyles } from "@/components/wizard/shared";

interface SelectionModeToggleProps {
  mode: "manual" | "templates";
  onModeChange: (mode: "manual" | "templates") => void;
}

export function SelectionModeToggle({ mode, onModeChange }: SelectionModeToggleProps) {
  return (
    <div className={wizardStyles.segmented}>
      <button
        type="button"
        onClick={() => onModeChange("manual")}
        className={wizardStyles.segmentedBtn(mode === "manual")}
      >
        <Server className="mr-1 inline h-3 w-3" />
        Manual
      </button>
      <button
        type="button"
        onClick={() => onModeChange("templates")}
        className={wizardStyles.segmentedBtn(mode === "templates")}
      >
        <Zap className="mr-1 inline h-3 w-3" />
        Templates
      </button>
    </div>
  );
}
