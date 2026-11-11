"use client";

import { useState } from "react";
import {
  FolderGit2,
  Globe2,
  Layers,
  Server,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Tag,
  Database,
  Mail,
  Building,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AWS_REGIONS, OutputFormat } from "@/lib";
import { WizardPanel } from "@/components/wizard/shared";
import { cn } from "@/lib/utils";

interface ProjectSettingsCardProps {
  projectName: string;
  region: string;
  environment: "development" | "staging" | "production";
  outputFormat: OutputFormat;
  backendType?: "local" | "s3";
  ownerEmail?: string;
  costCenter?: string;
  projectNameError?: string;
  onProjectNameChange: (name: string) => void;
  onRegionChange: (region: string) => void;
  onEnvironmentChange: (env: "development" | "staging" | "production") => void;
  onOutputFormatChange: (format: OutputFormat) => void;
  onBackendTypeChange?: (type: "local" | "s3") => void;
  onOwnerEmailChange?: (email: string) => void;
  onCostCenterChange?: (costCenter: string) => void;
}

export function ProjectSettingsCard({
  projectName,
  region,
  environment,
  outputFormat,
  backendType = "local",
  ownerEmail = "admin@example.com",
  costCenter = "engineering",
  projectNameError,
  onProjectNameChange,
  onRegionChange,
  onEnvironmentChange,
  onOutputFormatChange,
  onBackendTypeChange,
  onOwnerEmailChange,
  onCostCenterChange,
}: ProjectSettingsCardProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedRegion = AWS_REGIONS.find((r) => r.value === region);

  const envProfiles = [
    {
      id: "development" as const,
      label: "Development",
      desc: "Single AZ, minimal cost",
      badge: "Cost-Effective",
      color: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      activeBg: "bg-emerald-500/15 border-emerald-500",
    },
    {
      id: "staging" as const,
      label: "Staging",
      desc: "Pre-prod parity & test",
      badge: "Balanced",
      color: "border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10",
      activeBg: "bg-blue-500/15 border-blue-500",
    },
    {
      id: "production" as const,
      label: "Production",
      desc: "Multi-AZ, encrypted, HA",
      badge: "High-Availability",
      color: "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10",
      activeBg: "bg-amber-500/15 border-amber-500",
    },
  ];

  return (
    <WizardPanel
      title="Project Settings"
      description="Global stack configuration, environment profiles & state governance"
      icon={FolderGit2}
      action={
        <Badge variant="outline" className="text-[10px] font-mono tracking-tight gap-1 bg-muted/40">
          <Globe2 className="h-3 w-3 text-orange-500" />
          {selectedRegion ? selectedRegion.label.split("(")[0].trim() : region}
        </Badge>
      }
    >
      <div className="space-y-4">
        {/* Row 1: Project Name & Region */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="projectName" className="text-xs font-semibold flex items-center gap-1.5">
                <FolderGit2 className="h-3.5 w-3.5 text-muted-foreground" />
                Project Name
              </Label>
              <span className="text-[10px] text-muted-foreground font-mono">
                {projectName.length}/32 chars
              </span>
            </div>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              placeholder="e.g. acme-backend-infra"
              className={cn(
                "h-9 text-xs sm:text-sm bg-muted/20 font-mono transition-all",
                projectNameError
                  ? "border-red-500 focus-visible:ring-red-500/20"
                  : "border-border/70 hover:border-border"
              )}
            />
            {projectNameError ? (
              <p className="text-[10px] text-red-500">{projectNameError}</p>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                Prefixed to all generated resource identifiers and state files.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="region" className="text-xs font-semibold flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />
              AWS Region
            </Label>
            <Select value={region} onValueChange={(v) => v && onRegionChange(v)}>
              <SelectTrigger id="region" className="h-9 text-xs sm:text-sm bg-muted/20 border-border/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {AWS_REGIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value} className="text-xs sm:text-sm">
                    <span className="font-medium">{r.label}</span>
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground">({r.value})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Availability zones and latency targets will align with {region}.
            </p>
          </div>
        </div>

        {/* Row 2: Environment Profile Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
              Environment Profile
            </span>
            <span className="text-[10px] text-muted-foreground font-normal">
              Applies best practices for sizing & redundancy
            </span>
          </Label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {envProfiles.map((p) => {
              const isSelected = environment === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onEnvironmentChange(p.id)}
                  className={cn(
                    "text-left p-2.5 rounded-xl border transition-all cursor-pointer relative",
                    isSelected
                      ? cn("border-2 shadow-xs", p.activeBg)
                      : "border-border/60 bg-muted/10 hover:bg-muted/30 hover:border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs tracking-tight">{p.label}</span>
                    <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 border", p.color)}>
                      {p.badge}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Output Format */}
        <div className="space-y-1.5">
          <Label htmlFor="format" className="text-xs font-semibold flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            Infrastructure as Code Target
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                id: "terraform" as OutputFormat,
                name: "Terraform (HCL)",
                badge: "v1.5+",
                desc: "Modular .tf files with variables & tfvars",
              },
              {
                id: "cloudformation" as OutputFormat,
                name: "CloudFormation",
                badge: "JSON",
                desc: "Native AWS templates & parameters.json",
              },
              {
                id: "cdk" as OutputFormat,
                name: "AWS CDK (TS)",
                badge: "v2.130+",
                desc: "TypeScript constructs & cdk synth",
              },
            ].map((f) => {
              const isSelected = outputFormat === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onOutputFormatChange(f.id)}
                  className={cn(
                    "text-left p-2.5 rounded-xl border transition-all cursor-pointer",
                    isSelected
                      ? "border-2 border-orange-500 bg-orange-500/10 shadow-xs"
                      : "border-border/60 bg-muted/10 hover:bg-muted/30 hover:border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-foreground">{f.name}</span>
                    <Badge variant="secondary" className="text-[9px] px-1 h-4">
                      {f.badge}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{f.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Governance & Tagging Accordion */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1"
          >
            <Tag className="h-3.5 w-3.5 text-orange-500" />
            <span>Advanced Backend & Resource Tagging</span>
            {showAdvanced ? (
              <ChevronUp className="h-3.5 w-3.5 ml-0.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 space-y-3 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {outputFormat === "terraform" && onBackendTypeChange && (
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium flex items-center gap-1 text-muted-foreground">
                      <Database className="h-3 w-3" />
                      Terraform State Backend
                    </Label>
                    <Select
                      value={backendType}
                      onValueChange={(v) => v && onBackendTypeChange(v as "local" | "s3")}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local State (.tfstate)</SelectItem>
                        <SelectItem value="s3">S3 Remote + DynamoDB Lock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {onOwnerEmailChange && (
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      Owner Email (Tag)
                    </Label>
                    <Input
                      value={ownerEmail}
                      onChange={(e) => onOwnerEmailChange(e.target.value)}
                      placeholder="admin@example.com"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                )}

                {onCostCenterChange && (
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium flex items-center gap-1 text-muted-foreground">
                      <Building className="h-3 w-3" />
                      Cost Center (Tag)
                    </Label>
                    <Input
                      value={costCenter}
                      onChange={(e) => onCostCenterChange(e.target.value)}
                      placeholder="engineering"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                )}
              </div>

              {outputFormat === "terraform" && backendType === "s3" && (
                <div className="text-[10px] text-muted-foreground font-mono bg-background/80 p-2 rounded-lg border border-border/50">
                  State bucket: <span className="text-orange-600 dark:text-orange-400 font-semibold">{projectName}-{environment}-terraform-state</span> • DynamoDB: <span className="text-orange-600 dark:text-orange-400 font-semibold">{projectName}-{environment}-terraform-locks</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </WizardPanel>
  );
}
