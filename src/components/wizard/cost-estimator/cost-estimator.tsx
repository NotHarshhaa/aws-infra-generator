"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Calculator,
  PieChart,
  Sparkles,
  Zap,
  CheckCircle2,
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
import { analyzeFinOps, type FinOpsRecommendation } from "@/lib/finops-analyzer";
import { cn } from "@/lib/utils";

export function CostEstimator() {
  const { selectedServices, serviceConfig, region, environment, updateServiceConfig } = useInfraStore();
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

  const finOpsData = useMemo(() => {
    if (!costEstimate) return null;
    return analyzeFinOps(selectedServices, serviceConfig, costEstimate.monthly);
  }, [selectedServices, serviceConfig, costEstimate]);

  const handleApplyFinOps = (rec: FinOpsRecommendation) => {
    if (rec.autoFixAction) {
      updateServiceConfig(
        rec.autoFixAction.serviceId,
        rec.autoFixAction.key,
        rec.autoFixAction.value
      );
    }
  };

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
    if (cost === 0) return "text-emerald-600 dark:text-emerald-400";
    if (cost < 50) return "text-emerald-600 dark:text-emerald-400";
    if (cost < 200) return "text-yellow-600 dark:text-yellow-400";
    if (cost < 500) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
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
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center">
        <Calculator className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-60" />
        <p className="text-xs text-muted-foreground">Select services to see cost estimates</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Primary Cost Header Card */}
      <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-card to-card p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-500" />
              Estimated Infrastructure Monthly Cost
            </h3>
            <p className="text-xs text-muted-foreground capitalize">
              {costEstimate.environment} · {costEstimate.region}
            </p>
          </div>
          <Badge variant="outline" className="rounded-full text-xs font-semibold px-2.5 py-0.5 w-fit">
            {selectedServices.length} Active Services
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/60 bg-background/60 p-3">
            <span className="text-xs text-muted-foreground font-medium">Monthly On-Demand</span>
            <div className={cn("text-2xl font-bold font-mono tracking-tight mt-0.5", getCostColor(costEstimate.monthly))}>
              ${costEstimate.monthly.toFixed(2)}
            </div>
            <span className="text-[10px] text-muted-foreground">~${(costEstimate.monthly / 730).toFixed(3)}/hr</span>
          </div>

          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">1-Yr Savings Plan</span>
            <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5">
              ${(costEstimate.monthly * 0.72).toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 font-medium">Save ~28% with 1-yr commitment</span>
          </div>

          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">3-Yr Savings Plan</span>
            <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5">
              ${(costEstimate.monthly * 0.48).toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 font-medium">Save ~52% with 3-yr commitment</span>
          </div>
        </div>
      </div>

      {/* FinOps Proactive Optimization Advisor */}
      {finOpsData && finOpsData.recommendations.length > 0 && (
        <div className="rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/5 via-card to-card p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" />
              FinOps Right-Sizing & Savings Opportunities
            </h3>
            <Badge className="rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/25 text-[10px]">
              Save up to ${finOpsData.potentialMonthlySavingsUsd.toFixed(2)}/mo
            </Badge>
          </div>

          <div className="space-y-2">
            {finOpsData.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-background/60 text-xs shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{rec.title}</span>
                    <Badge variant="outline" className="rounded-full text-[9px] px-2 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono">
                      -{rec.percentageSavings}%
                    </Badge>
                    <Badge variant="secondary" className="rounded-full text-[9px] px-1.5 py-0 uppercase">
                      {rec.category}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                {rec.autoFixAction && (
                  <Button
                    size="sm"
                    onClick={() => handleApplyFinOps(rec)}
                    className="shrink-0 h-7 rounded-full text-xs bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-xs"
                  >
                    <Zap className="mr-1 h-3 w-3" />
                    Apply Graviton
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Breakdown Accordion */}
      <div className="rounded-2xl border border-border/70 bg-card/85 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <PieChart className="h-3.5 w-3.5" />
            Service-by-Service Cost Breakdown
          </h4>
          <span className="text-[11px] text-muted-foreground font-mono">
            {costEstimate.services.length} items
          </span>
        </div>

        <div className="space-y-2">
          {costEstimate.services.map((service) => (
            <div
              key={service.service}
              className="rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
            >
              <div
                className="flex items-center justify-between cursor-pointer gap-2"
                onClick={() => toggleServiceExpansion(service.service)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground uppercase tracking-wide">
                      {service.service}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                      ${service.monthlyCost.toFixed(2)}/mo
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {expandedServices.has(service.service) ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {expandedServices.has(service.service) && (
                <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
                  <div className="space-y-1.5">
                    {service.breakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.item}</span>
                        <span className="font-mono font-medium text-foreground">
                          {item.cost > 0 ? `$${item.cost.toFixed(2)}` : "Free Tier"} / {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {service.notes.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <ul className="space-y-1">
                        {service.notes.map((note, idx) => (
                          <li key={idx} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                            <span className="text-orange-500 mt-0.5">•</span>
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
    </div>
  );
}
