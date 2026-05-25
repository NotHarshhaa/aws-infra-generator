import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardPanel } from "@/components/wizard/shared";

interface ClearAllDialogProps {
  selectedCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ClearAllDialog({ selectedCount, onCancel, onConfirm }: ClearAllDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-3 sm:p-4">
      <WizardPanel
        variant="accent"
        title="Clear all services?"
        className="w-full max-w-md shadow-2xl"
        bodyClassName="space-y-3"
      >
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p>
            Remove all {selectedCount} selected service{selectedCount !== 1 ? "s" : ""} and reset
            filters. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1 h-8 text-xs">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1 h-8 text-xs">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Clear All
          </Button>
        </div>
      </WizardPanel>
    </div>
  );
}
