"use client";

import { useMemo } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, Info, CheckCircle2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useInfraStore } from "@/lib";
import { runSecurityAudit, AuditFinding } from "@/lib/security-auditor";

export function SecurityAuditCard() {
  const { selectedServices, serviceConfig, environment, updateServiceConfig } = useInfraStore();

  const findings = useMemo(() => {
    return runSecurityAudit(selectedServices, serviceConfig, environment);
  }, [selectedServices, serviceConfig, environment]);

  const fixableFindings = findings.filter((f) => f.autoFixAvailable && f.fixAction);

  const handleFixAll = () => {
    fixableFindings.forEach((f) => {
      if (f.fixAction) {
        updateServiceConfig(f.fixAction.serviceId, f.fixAction.key, f.fixAction.value);
      }
    });
  };

  const handleFixSingle = (finding: AuditFinding) => {
    if (finding.fixAction) {
      updateServiceConfig(
        finding.fixAction.serviceId,
        finding.fixAction.key,
        finding.fixAction.value
      );
    }
  };

  return (
    <Card className="border-border/60 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 dark:bg-amber-400/15 dark:text-amber-400">
              {findings.length === 0 ? (
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              ) : (
                <ShieldAlert className="h-5 w-5" />
              )}
            </div>
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                AWS Architecture & Security Advisor
                {findings.length === 0 ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                    Clean Status
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
                    {findings.length} Issue{findings.length > 1 ? "s" : ""} Found
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time security and reliability audit against AWS Well-Architected Framework.
              </CardDescription>
            </div>
          </div>

          {fixableFindings.length > 0 && (
            <Button
              size="sm"
              onClick={handleFixAll}
              className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 gap-1.5 shadow-xs"
            >
              <Wrench className="h-3.5 w-3.5" />
              Auto-Fix Recommendations ({fixableFindings.length})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {findings.length === 0 ? (
          <div className="flex items-center gap-3 p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>
              Your current infrastructure configuration meets AWS security and reliability best practices for the <strong>{environment}</strong> environment.
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {findings.map((finding) => {
              const severityColor =
                finding.severity === "critical"
                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                  : finding.severity === "high"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : finding.severity === "medium"
                  ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  : "bg-slate-500/10 text-slate-500 border-slate-500/20";

              return (
                <div
                  key={finding.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/80 bg-background/50 hover:bg-background/80 transition-colors text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    {finding.severity === "critical" || finding.severity === "high" ? (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    ) : (
                      <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{finding.title}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 uppercase font-mono ${severityColor}`}>
                          {finding.severity}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          [{finding.serviceName}]
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                        {finding.description}
                      </p>
                    </div>
                  </div>

                  {finding.autoFixAvailable && finding.fixAction && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFixSingle(finding)}
                      className="shrink-0 h-7 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
                    >
                      Fix Issue
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
