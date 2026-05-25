import { AlertTriangle, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ClearAllDialogProps {
  selectedCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ClearAllDialog({ selectedCount, onCancel, onConfirm }: ClearAllDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Clear All Services?
          </CardTitle>
          <CardDescription>
            This will remove all {selectedCount} selected service
            {selectedCount !== 1 ? "s" : ""} and reset your configuration. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">This will also clear:</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All selected services and their dependencies</li>
              <li>• Any applied preset template</li>
              <li>• Service configurations</li>
              <li>• Search and filter settings</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm} className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
