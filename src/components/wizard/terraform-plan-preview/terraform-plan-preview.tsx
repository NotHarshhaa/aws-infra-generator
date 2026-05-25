"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FileCode2,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Loader2,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useInfraStore,
  buildTerraformPlanPreview,
  type TerraformPlanSummary,
  type TerraformPlanAction,
} from "@/lib";

export function TerraformPlanPreview() {
  const {
    selectedServices,
    serviceConfig,
    projectName,
    region,
    environment,
    outputFormat,
    generatedFiles,
    isGenerationStale,
  } = useInfraStore();
  const [planSummary, setPlanSummary] = useState<TerraformPlanSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());
  const [showSensitive, setShowSensitive] = useState(false);
  const [filterAction, setFilterAction] = useState<string>("all");

  const planInput = useMemo(
    () => ({
      selectedServices,
      serviceConfig,
      projectName,
      region,
      environment,
      outputFormat,
      generatedFiles,
      useGeneratedFiles: generatedFiles.length > 0 && !isGenerationStale,
    }),
    [
      selectedServices,
      serviceConfig,
      projectName,
      region,
      environment,
      outputFormat,
      generatedFiles,
      isGenerationStale,
    ]
  );

  useEffect(() => {
    if (outputFormat !== "terraform" || selectedServices.length === 0) {
      setPlanSummary(null);
      return;
    }

    setIsLoading(true);
    const timer = window.setTimeout(() => {
      try {
        const summary = buildTerraformPlanPreview(planInput);
        setPlanSummary(summary);
      } finally {
        setIsLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [planInput, outputFormat, selectedServices.length]);

  const toggleActionExpansion = (index: number) => {
    const key = `${index}`;
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedActions(newExpanded);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "update":
        return <RefreshCw className="h-4 w-4 text-yellow-600" />;
      case "destroy":
        return <Minus className="h-4 w-4 text-red-600" />;
      default:
        return <Eye className="h-4 w-4 text-blue-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "text-green-600 bg-green-50 dark:bg-green-950/20";
      case "update":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20";
      case "destroy":
        return "text-red-600 bg-red-50 dark:bg-red-950/20";
      default:
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20";
    }
  };

  const getChangeSymbol = (before: unknown, after: unknown) => {
    if (before === null) return "+";
    if (after === null) return "-";
    return "~";
  };

  if (outputFormat !== "terraform") {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <FileCode2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Terraform plan preview is only available for Terraform output format
          </p>
        </CardContent>
      </Card>
    );
  }

  if (selectedServices.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <FileCode2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Select services to preview terraform plan</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Building plan from generated Terraform...
        </CardContent>
      </Card>
    );
  }

  if (!planSummary) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <FileCode2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No Terraform resources found for the current selection</p>
        </CardContent>
      </Card>
    );
  }

  const filteredActions =
    filterAction === "all"
      ? planSummary.actions
      : planSummary.actions.filter((a) => a.action === filterAction);

  const planSource =
    generatedFiles.length > 0 && !isGenerationStale ? "generated files" : "live configuration";

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileCode2 className="h-4 w-4 sm:h-5 sm:w-5" />
                Terraform Plan Preview
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Parsed from {planSource}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs w-fit">
              {planSummary.actions.length} resources
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span className="hidden sm:inline">To Create</span>
                <span className="sm:hidden">Create</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {planSummary.toCreate}
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                <span className="hidden sm:inline">To Update</span>
                <span className="sm:hidden">Update</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {planSummary.toUpdate}
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                <span className="hidden sm:inline">To Destroy</span>
                <span className="sm:hidden">Destroy</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {planSummary.toDestroy}
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Est. Time</span>
                <span className="sm:hidden">Time</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{planSummary.estimatedTime}</div>
            </div>
          </div>

          {isGenerationStale && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-xs">Preview may differ from export</AlertTitle>
              <AlertDescription className="text-xs">
                Configuration changed after your last generation. This preview reflects current settings.
              </AlertDescription>
            </Alert>
          )}

          {planSummary.warnings.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                {planSummary.warnings.map((warning, idx) => (
                  <Alert key={idx} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription className="text-xs">{warning}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-3 sm:pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Button
                variant={filterAction === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterAction("all")}
                className="h-8 text-xs"
              >
                All ({planSummary.actions.length})
              </Button>
              {planSummary.toCreate > 0 && (
                <Button
                  variant={filterAction === "create" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterAction("create")}
                  className="gap-1 h-8 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  <span className="hidden sm:inline">Create</span> ({planSummary.toCreate})
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSensitive(!showSensitive)}
              className="gap-1 sm:gap-2 h-8 text-xs sm:text-sm"
            >
              {showSensitive ? (
                <>
                  <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                  Hide Sensitive
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  Show Sensitive
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-sm sm:text-base">Resource Changes</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {filteredActions.length} resource(s) shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] sm:h-[500px] pr-2 sm:pr-4">
            <div className="space-y-2">
              {filteredActions.map((action: TerraformPlanAction, idx: number) => {
                const isExpanded = expandedActions.has(`${idx}`);
                return (
                  <div
                    key={`${action.resourceType}.${action.resourceName}-${idx}`}
                    className={`border rounded-lg overflow-hidden ${getActionColor(action.action)}`}
                  >
                    <button
                      type="button"
                      className="w-full p-3 text-left hover:opacity-80 transition-opacity"
                      onClick={() => toggleActionExpansion(idx)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getActionIcon(action.action)}
                          <div className="min-w-0">
                            <div className="font-mono text-sm font-semibold truncate">
                              {action.resourceType}.{action.resourceName}
                            </div>
                            <div className="text-xs opacity-75">
                              {action.changes.length} attribute(s)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {action.action}
                          </Badge>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t bg-background/50 p-3 space-y-2">
                        {action.reason && (
                          <div className="text-xs italic text-muted-foreground mb-2">
                            {action.reason}
                          </div>
                        )}
                        <div className="space-y-1 font-mono text-xs">
                          {action.changes.map((change, changeIdx) => {
                            const symbol = getChangeSymbol(change.before, change.after);
                            const isSensitive = change.sensitive && !showSensitive;

                            return (
                              <div key={changeIdx} className="flex items-start gap-2 py-1">
                                <span className="text-muted-foreground mt-0.5">{symbol}</span>
                                <div className="flex-1 min-w-0">
                                  <span className="text-primary font-semibold">
                                    {change.attribute}
                                  </span>
                                  <div className="text-muted-foreground break-all">
                                    {change.after !== null && (
                                      <div className="flex items-start gap-1">
                                        <span className="text-green-600">+</span>
                                        <span>
                                          {isSensitive ? "(sensitive)" : String(change.after)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100 text-sm sm:text-base">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
            After generating and downloading:
          </div>
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm font-mono bg-background/50 p-2 sm:p-3 rounded border">
            <div className="text-muted-foreground text-[10px] sm:text-xs"># Initialize Terraform</div>
            <div>terraform init</div>
            <div className="text-muted-foreground text-[10px] sm:text-xs mt-1.5 sm:mt-2"># Review the plan</div>
            <div>terraform plan</div>
            <div className="text-muted-foreground text-[10px] sm:text-xs mt-1.5 sm:mt-2"># Apply changes</div>
            <div>terraform apply</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
