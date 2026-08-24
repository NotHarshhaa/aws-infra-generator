"use client";

import { useState, useRef } from "react";
import { Download, Upload, FileJson, Copy, Check, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useInfraStore } from "@/lib";
import { OutputFormat, Environment } from "@/lib/types";

interface ConfigImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfigImportExportDialog({
  open,
  onOpenChange,
}: ConfigImportExportDialogProps) {
  const {
    selectedServices,
    serviceConfig,
    projectName,
    environment,
    region,
    outputFormat,
    setSelectedServices,
    updateServiceConfig,
    setProjectName,
    setEnvironment,
    setRegion,
    setOutputFormat,
  } = useInfraStore();

  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [importJsonText, setImportJsonText] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentConfigJson = () => {
    return JSON.stringify(
      {
        version: "1.0",
        timestamp: new Date().toISOString(),
        projectName,
        environment,
        region,
        outputFormat,
        selectedServices,
        serviceConfig,
      },
      null,
      2
    );
  };

  const handleDownloadConfig = () => {
    const jsonStr = getCurrentConfigJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName || "aws-infra"}-config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Architecture configuration exported!");
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(getCurrentConfigJson());
    setCopied(true);
    toast.success("Configuration JSON copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const parseAndApplyConfig = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== "object") {
        throw new Error("Invalid JSON structure");
      }

      if (Array.isArray(data.selectedServices)) {
        setSelectedServices(data.selectedServices);
      }

      if (data.serviceConfig && typeof data.serviceConfig === "object") {
        Object.entries(data.serviceConfig).forEach(([serviceId, item]: [string, any]) => {
          if (item && item.config) {
            Object.entries(item.config).forEach(([key, val]: [string, any]) => {
              updateServiceConfig(serviceId, key, val);
            });
          }
        });
      }

      if (data.projectName) setProjectName(String(data.projectName));
      if (data.environment) setEnvironment(data.environment as Environment);
      if (data.region) setRegion(String(data.region));
      if (data.outputFormat) setOutputFormat(data.outputFormat as OutputFormat);

      toast.success("Architecture configuration imported successfully!");
      onOpenChange(false);
      setImportJsonText("");
    } catch (err: any) {
      toast.error(`Failed to import configuration: ${err.message || "Invalid JSON"}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseAndApplyConfig(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileJson className="h-5 w-5 text-blue-500" />
            Infrastructure Config (JSON)
          </DialogTitle>
          <DialogDescription className="text-xs">
            Export your visual stack configuration or import an existing setup to resume anytime.
          </DialogDescription>
        </DialogHeader>

        {/* Tab switch */}
        <div className="flex rounded-md bg-muted p-1 text-xs">
          <button
            onClick={() => setActiveTab("export")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-sm font-medium transition-all ${
              activeTab === "export"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            Export Config
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-sm font-medium transition-all ${
              activeTab === "import"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Import Config
          </button>
        </div>

        {activeTab === "export" ? (
          <div className="space-y-3 pt-1">
            <Textarea
              readOnly
              value={getCurrentConfigJson()}
              className="font-mono text-xs h-48 bg-muted/30 resize-none"
            />
            <div className="flex items-center justify-between gap-2">
              <Button size="sm" variant="outline" onClick={handleCopyJson} className="gap-1.5 text-xs">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy JSON"}
              </Button>
              <Button size="sm" onClick={handleDownloadConfig} className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="h-3.5 w-3.5" />
                Download JSON File
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-blue-500/50 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-xs font-medium text-center">
                Click to upload <span className="text-blue-500 font-mono">aws-infra-config.json</span> file
              </p>
              <p className="text-[11px] text-muted-foreground text-center">
                or drag & drop your exported stack configuration file here
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Or paste configuration JSON directly:
              </label>
              <Textarea
                placeholder='{"projectName": "my-stack", "selectedServices": ["vpc", "ec2"]}'
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="font-mono text-xs h-28 bg-muted/30 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                onClick={() => parseAndApplyConfig(importJsonText)}
                disabled={!importJsonText.trim()}
                className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Apply Configuration
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
