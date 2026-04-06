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
import { useInfraStore } from "@/lib/store";
import { estimateInfrastructureCost, TotalCostEstimate, CostEstimate } from "@/lib/cost-estimator";

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
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Select services to see cost estimates
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Cost Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                Estimated Cost
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {costEstimate.environment.charAt(0).toUpperCase() + costEstimate.environment.slice(1)} • {costEstimate.region}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs w-fit">
              {costEstimate.services.length} services
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
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
        </CardContent>
      </Card>

      {/* Service Breakdown */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <PieChart className="h-4 w-4 sm:h-5 sm:w-5" />
            Cost Breakdown
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Detailed cost per service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
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
        </CardContent>
      </Card>

      {/* Cost Optimization Tips */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100 text-sm sm:text-base">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 sm:space-y-2">
          <div className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 text-blue-900 dark:text-blue-100">
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
        </CardContent>
      </Card>
    </div>
  );
}
