"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Calculator,
  PieChart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  useInfraStore,
  estimateInfrastructureCost,
  type TotalCostEstimate,
  type CostEstimate,
} from "@/lib";

export function CostEstimator() {
  const { selectedServices, serviceConfig, region, environment } = useInfraStore();
  const [costEstimate, setCostEstimate] = useState<TotalCostEstimate | null>(null);
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    if (selectedServices.length > 0) {
      const estimate = estimateInfrastructureCost(
        selectedServices,
        serviceConfig,
        region,
        environment
      );
      setCostEstimate(estimate);
    } else {
      setCostEstimate(null);
    }
  }, [selectedServices, serviceConfig, region, environment]);

  const toggleServiceExpansion = (serviceId: string) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedServices(newExpanded);
  };

  const getCostColor = (cost: number): string => {
    if (cost === 0) return "text-green-600";
    if (cost < 50) return "text-green-600";
    if (cost < 200) return "text-yellow-600";
    if (cost < 500) return "text-orange-600";
    return "text-red-600";
  };

  const getCostBadgeVariant = (cost: number): "default" | "secondary" | "destructive" | "outline" => {
    if (cost === 0) return "secondary";
    if (cost < 50) return "secondary";
    if (cost < 200) return "default";
    if (cost < 500) return "default";
    return "destructive";
  };

  if (!costEstimate || selectedServices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center">
        <Calculator className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-60" />
        <p className="text-xs text-muted-foreground">Select services to see cost estimates</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-card/80 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-500" />
              Estimated Cost
            </h3>
            <p className="text-[11px] text-muted-foreground capitalize">
              {costEstimate.environment} · {costEstimate.region}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] w-fit">
            {costEstimate.services.length} services
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center py-2 bg-background/50 rounded-lg border border-border/50">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-mono">Monthly</span>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400 font-mono">
              ${costEstimate.monthly.toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-mono">Yearly</span>
            <p className="text-lg font-bold text-foreground font-mono">
              ${costEstimate.yearly.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Category Cost Allocation Bar */}
        {costEstimate.monthly > 0 && (
          <div className="mt-3 space-y-1.5 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-medium">Cost Distribution</span>
              <span className="font-mono text-muted-foreground font-medium">
                ${costEstimate.monthly.toFixed(2)} / mo
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
              {costEstimate.services.map((svc, i) => {
                const pct = (svc.monthlyCost / (costEstimate.monthly || 1)) * 100;
                if (pct === 0) return null;
                const colors = [
                  "bg-blue-500",
                  "bg-amber-500",
                  "bg-emerald-500",
                  "bg-purple-500",
                  "bg-rose-500",
                  "bg-indigo-500",
                ];
                return (
                  <div
                    key={svc.service}
                    style={{ width: `${pct}%` }}
                    className={`h-full ${colors[i % colors.length]}`}
                    title={`${svc.serviceName}: $${svc.monthlyCost.toFixed(2)}`}
                  />
                );
              })}
            </div>
          </div>
        )}

          {showDisclaimer && (
            <>
              <Separator />
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Cost Estimate Disclaimer</AlertTitle>
                <AlertDescription className="text-xs">
                  {costEstimate.disclaimer}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 px-2"
                    onClick={() => setShowDisclaimer(false)}
                  >
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            </>
          )}
      </div>

      <div className="rounded-xl border border-border/80 bg-card/80 p-3 sm:p-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <PieChart className="h-4 w-4 text-orange-500" />
          Cost Breakdown
        </h3>
        <div className="space-y-2">
          {costEstimate.services
            .sort((a, b) => b.monthlyCost - a.monthlyCost)
            .map((service: CostEstimate) => (
              <div
                key={service.service}
                className="border rounded-lg p-2 sm:p-3 hover:bg-accent/50 transition-colors"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleServiceExpansion(service.service)}
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs sm:text-sm truncate">
                        {service.serviceName}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        {service.breakdown.length} component(s)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <Badge variant={getCostBadgeVariant(service.monthlyCost)} className="text-[10px] sm:text-xs">
                      ${service.monthlyCost.toFixed(2)}/mo
                    </Badge>
                    {expandedServices.has(service.service) ? (
                      <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {expandedServices.has(service.service) && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    {/* Cost Breakdown Items */}
                    <div className="space-y-2">
                      {service.breakdown.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="text-muted-foreground">{item.item}</div>
                          <div className="font-mono">
                            {item.cost > 0 ? `$${item.cost.toFixed(2)}` : "Free"} /{" "}
                            {item.unit}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {service.notes.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="text-xs font-semibold mb-1 text-muted-foreground">
                          Notes:
                        </div>
                        <ul className="space-y-1">
                          {service.notes.map((note, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 sm:p-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
          <TrendingUp className="h-4 w-4" />
          Optimization Tips
        </h3>
        <div className="text-[11px] sm:text-xs space-y-1.5 text-blue-900/90 dark:text-blue-100/90">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
              <span>Use Reserved Instances or Savings Plans (up to 72% savings)</span>
            </div>
            <div className="flex items-start gap-1.5 sm:gap-2">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
              <span>Enable S3 Intelligent-Tiering for automatic optimization</span>
            </div>
            <div className="flex items-start gap-1.5 sm:gap-2">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
              <span>Use Spot Instances for non-critical workloads (up to 90% savings)</span>
            </div>
            <div className="flex items-start gap-1.5 sm:gap-2">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
              <span>Set up CloudWatch alarms to monitor costs</span>
            </div>
        </div>
      </div>
    </div>
  );
}
