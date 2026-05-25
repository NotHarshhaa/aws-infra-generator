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
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-xs sm:text-sm text-muted-foreground">Monthly</div>
              <div className={`text-xl sm:text-3xl font-bold ${getCostColor(costEstimate.monthly)}`}>
                ${costEstimate.monthly.toFixed(2)}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                per month
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="text-xs sm:text-sm text-muted-foreground">Yearly</div>
              <div className={`text-xl sm:text-3xl font-bold ${getCostColor(costEstimate.yearly)}`}>
                ${costEstimate.yearly.toFixed(2)}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                per year
              </div>
            </div>
          </div>

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
