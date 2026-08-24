"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, Info, CheckCircle2, Wrench, FileCheck, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useInfraStore } from "@/lib";
import { runSecurityAudit, AuditFinding } from "@/lib/security-auditor";
import { auditCompliance, COMPLIANCE_FRAMEWORKS, type ComplianceFramework } from "@/lib/compliance-auditor";
import { cn } from "@/lib/utils";

export function SecurityAuditCard() {
  const { selectedServices, serviceConfig, environment, updateServiceConfig } = useInfraStore();
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | "all">("all");

  const securityFindings = useMemo(() => {
    return runSecurityAudit(selectedServices, serviceConfig, environment);
  }, [selectedServices, serviceConfig, environment]);

  const complianceResult = useMemo(() => {
    return auditCompliance(selectedServices, serviceConfig);
  }, [selectedServices, serviceConfig]);

  const fixableFindings = securityFindings.filter((f) => f.autoFixAvailable && f.fixAction);

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

  const handleFixCompliance = (fixAction?: { serviceId: string; key: string; value: string | number | boolean }) => {
    if (fixAction) {
      updateServiceConfig(fixAction.serviceId, fixAction.key, fixAction.value);
    }
  };

  const filteredComplianceFindings = useMemo(() => {
    if (selectedFramework === "all") return complianceResult.findings;
    return complianceResult.findings.filter((f) => f.frameworks.includes(selectedFramework));
  }, [complianceResult.findings, selectedFramework]);

  return (
    <Card className="rounded-2xl border-border/70 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 sm:pb-4 border-b border-border/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
              {securityFindings.length === 0 && complianceResult.overallScore === 100 ? (
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              ) : (
                <ShieldAlert className="h-5 w-5" />
              )}
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 tracking-tight">
                Architecture Security & Compliance Posture
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full text-xs font-semibold px-2.5 py-0.5",
                    complianceResult.overallScore >= 80
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/25"
                  )}
                >
                  {complianceResult.overallScore}% Ready
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Evaluated against AWS Well-Architected & Enterprise Compliance Frameworks (SOC2, HIPAA, PCI-DSS, CIS).
              </CardDescription>
            </div>
          </div>

          {fixableFindings.length > 0 && (
            <Button
              size="sm"
              onClick={handleFixAll}
              className="rounded-full bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 gap-1.5 shadow-xs text-xs font-medium cursor-pointer"
            >
              <Wrench className="h-3.5 w-3.5" />
              Auto-Fix Issues ({fixableFindings.length})
            </Button>
          )}
        </div>

        {/* Framework Compliance Score Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          {COMPLIANCE_FRAMEWORKS.map((fw) => {
            const score = complianceResult.frameworkScores[fw.id];
            const isSelected = selectedFramework === fw.id;
            return (
              <button
                key={fw.id}
                type="button"
                onClick={() => setSelectedFramework(isSelected ? "all" : fw.id)}
                className={cn(
                  "flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-orange-500/60 bg-orange-500/10 shadow-xs ring-1 ring-orange-500/20"
                    : "border-border/60 bg-muted/25 hover:bg-muted/50 hover:border-border"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold">{fw.shortName}</span>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                    score === 100
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : score >= 60
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "bg-red-500/15 text-red-600 dark:text-red-400"
                  )}>
                    {score}%
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 line-clamp-1 font-normal">
                  {fw.description}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {selectedFramework !== "all" && (
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="text-muted-foreground font-medium">
              Showing rules for <strong>{COMPLIANCE_FRAMEWORKS.find(f => f.id === selectedFramework)?.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => setSelectedFramework("all")}
              className="text-orange-600 dark:text-orange-400 hover:underline cursor-pointer font-medium"
            >
              Show all findings
            </button>
          </div>
        )}

        {filteredComplianceFindings.length === 0 && securityFindings.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>
              Your architecture configuration is fully compliant with <strong>{selectedFramework === "all" ? "all compliance frameworks" : selectedFramework.toUpperCase()}</strong> for the <strong>{environment}</strong> environment.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Render security advisor findings */}
            {selectedFramework === "all" && securityFindings.map((finding) => (
              <div
                key={finding.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-card/60 hover:bg-card transition-colors text-xs shadow-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {finding.severity === "critical" || finding.severity === "high" ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                  ) : (
                    <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{finding.title}</span>
                      <Badge variant="outline" className={cn(
                        "rounded-full text-[9px] px-2 py-0 uppercase font-mono",
                        finding.severity === "critical" ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      )}>
                        {finding.severity}
                      </Badge>
                      <Badge variant="secondary" className="rounded-full text-[10px] px-1.5 py-0 font-mono">
                        {finding.serviceName}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                      {finding.description}
                    </p>
                  </div>
                </div>

                {finding.autoFixAvailable && finding.fixAction && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFixSingle(finding)}
                    className="shrink-0 h-7 rounded-full text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400 font-medium"
                  >
                    Remediate
                  </Button>
                )}
              </div>
            ))}

            {/* Render compliance auditor findings */}
            {filteredComplianceFindings.map((cf) => (
              <div
                key={cf.ruleId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-card/60 hover:bg-card transition-colors text-xs shadow-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <FileCheck className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-foreground">{cf.name}</span>
                      <Badge variant="outline" className="rounded-full text-[9px] px-2 py-0 uppercase font-mono bg-orange-500/10 text-orange-600 border-orange-500/20">
                        {cf.severity}
                      </Badge>
                      {cf.frameworks.map((fw) => (
                        <Badge key={fw} variant="secondary" className="rounded-full text-[9px] px-1.5 py-0 uppercase font-semibold">
                          {fw}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                      {cf.description}
                    </p>
                  </div>
                </div>

                {cf.fixAction && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFixCompliance(cf.fixAction)}
                    className="shrink-0 h-7 rounded-full text-xs border-orange-500/30 text-orange-600 hover:bg-orange-500/10 dark:text-orange-400 font-medium"
                  >
                    Enforce Rule
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
