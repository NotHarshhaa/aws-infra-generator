import { RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ServiceStats } from "./types";

interface InfrastructureOverviewProps {
  stats: ServiceStats;
  hasSelection: boolean;
  onClearAll: () => void;
}

export function InfrastructureOverview({
  stats,
  hasSelection,
  onClearAll,
}: InfrastructureOverviewProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Infrastructure Overview</CardTitle>
          {hasSelection && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-xs h-8 px-2 sm:px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Clear all selected services and start over"
            >
              <RotateCcw className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.selectedServices}</div>
            <div className="text-xs text-muted-foreground">Selected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.requiredDependencies}</div>
            <div className="text-xs text-muted-foreground">Dependencies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalServices}</div>
            <div className="text-xs text-muted-foreground">Total Services</div>
          </div>
          <div className="text-center">
            <Badge
              variant={
                stats.estimatedComplexity === "High"
                  ? "destructive"
                  : stats.estimatedComplexity === "Medium"
                    ? "default"
                    : "secondary"
              }
            >
              {stats.estimatedComplexity} Complexity
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">Estimated</div>
          </div>
          <div className="text-center">
            <Badge
              variant={
                stats.estimatedCost === "High"
                  ? "destructive"
                  : stats.estimatedCost === "Medium"
                    ? "default"
                    : "secondary"
              }
            >
              {stats.estimatedCost} Cost
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">Estimated</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
