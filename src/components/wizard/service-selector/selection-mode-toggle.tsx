import { Server, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SelectionModeToggleProps {
  mode: "manual" | "templates";
  onModeChange: (mode: "manual" | "templates") => void;
}

export function SelectionModeToggle({ mode, onModeChange }: SelectionModeToggleProps) {
  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2 p-1 bg-muted rounded-lg w-full max-w-xs sm:max-w-md">
            <Button
              variant={mode === "manual" ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange("manual")}
              className="text-xs sm:text-sm flex-1 h-8 sm:h-9 px-2"
            >
              <Server className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Manual
            </Button>
            <Button
              variant={mode === "templates" ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange("templates")}
              className="text-xs sm:text-sm flex-1 h-8 sm:h-9 px-2"
            >
              <Zap className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Templates
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
