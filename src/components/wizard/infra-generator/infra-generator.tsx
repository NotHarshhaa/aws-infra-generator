"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode2,
  FolderTree,
  Home,
  Download,
  Copy,
  GitBranch,
  Clock,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useInfraStore } from "@/lib/store";
import { generateInfrastructure, validateInfrastructure } from "@/lib/api";
import { getServiceById } from "@/lib/aws-services";
import { cn } from "@/lib/utils";
import {
  wizardStyles,
  WizardHeader,
  WizardPanel,
  WizardStatRow,
  WizardActionBar,
  GeneratedFileTabsList,
  GenerationStaleBanner,
} from "@/components/wizard/shared";

interface InfraGeneratorProps {
  onBackToHome: () => void;
}

interface GenerationStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "error";
  duration?: number;
}

interface FileStats {
  lines: number;
  size: string;
  complexity: "Low" | "Medium" | "High";
}

export function InfraGenerator({ onBackToHome }: InfraGeneratorProps) {
  const {
    selectedServices,
    serviceConfig,
    environment,
    region,
    outputFormat,
    projectName,
    isGenerating,
    generatedFiles,
    validationResult,
    setIsGenerating,
    setGeneratedFiles,
    setValidationResult,
    setStep,
    isGenerationStale,
  } = useInfraStore();

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeFileTab, setActiveFileTab] = useState<string>("");
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fileStats, setFileStats] = useState<Record<string, FileStats>>({});
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);

  useEffect(() => {
    // Calculate estimated generation time based on complexity
    const baseTime = 2000; // 2 seconds base
    const serviceTime = selectedServices.length * 800; // 800ms per service
    const configTime = Object.keys(serviceConfig).length * 100; // 100ms per config
    setEstimatedTime(baseTime + serviceTime + configTime);
  }, [selectedServices, serviceConfig]);

  const calculateFileStats = (content: string): FileStats => {
    const lines = content.split('\n').length;
    const size = `${(content.length / 1024).toFixed(1)} KB`;
    
    // Simple complexity calculation based on lines and content
    let complexity: "Low" | "Medium" | "High" = "Low";
    if (lines > 100) complexity = "Medium";
    if (lines > 300 || content.includes('resource') && content.split('resource').length > 10) complexity = "High";
    
    return { lines, size, complexity };
  };

  const initializeGenerationSteps = (): GenerationStep[] => [
    {
      id: "validate",
      name: "Validating Configuration",
      description: "Checking service dependencies and configuration",
      status: "pending"
    },
    {
      id: "template",
      name: "Generating Templates",
      description: `Creating ${outputFormat} templates`,
      status: "pending"
    },
    {
      id: "resources",
      name: "Processing Resources",
      description: "Configuring AWS resources and services",
      status: "pending"
    },
    {
      id: "optimize",
      name: "Optimizing Code",
      description: "Applying best practices and optimizations",
      status: "pending"
    },
    {
      id: "finalize",
      name: "Finalizing",
      description: "Final validation and file preparation",
      status: "pending"
    }
  ];

  const updateStepStatus = (stepId: string, status: GenerationStep['status'], duration?: number) => {
    setGenerationSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, duration } : step
    ));
  };

  const copyToClipboard = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadFile = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = () => {
    generatedFiles.forEach(file => {
      downloadFile(file.content, file.name);
    });
  };
  const handleValidate = async () => {
    setError(null);
    setIsValidating(true);
    
    try {
      const result = await validateInfrastructure({
        services: selectedServices,
        config: serviceConfig,
        environment,
        projectName,
      });
      setValidationResult(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Validation failed"
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setProgress(0);
    setGenerationSteps(initializeGenerationSteps());

    try {
      updateStepStatus("validate", "running");
      setProgress(10);

      const validation = await validateInfrastructure({
        services: selectedServices,
        config: serviceConfig,
        environment,
        projectName,
      });
      setValidationResult(validation);

      if (!validation.valid) {
        updateStepStatus("validate", "error");
        setError("Fix validation errors before generating infrastructure.");
        return;
      }

      updateStepStatus("validate", "completed");
      setProgress(25);

      updateStepStatus("template", "running");
      const result = await generateInfrastructure({
        services: selectedServices,
        config: serviceConfig,
        environment,
        region,
        format: outputFormat,
        projectName,
      });

      updateStepStatus("template", "completed");
      updateStepStatus("resources", "completed");
      updateStepStatus("optimize", "completed");
      updateStepStatus("finalize", "completed");
      setProgress(100);

      setGeneratedFiles(result.files);
      setValidationResult(result.validation);

      const stats: Record<string, FileStats> = {};
      result.files.forEach((file) => {
        stats[file.name] = calculateFileStats(file.content);
      });
      setFileStats(stats);

      if (result.files.length > 0) {
        setActiveFileTab(result.files[0].name);
      }
    } catch (err) {
      setGenerationSteps((prev) =>
        prev.map((step) =>
          step.status === "running" ? { ...step, status: "error" as const } : step
        )
      );
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={wizardStyles.shell}>
      <WizardHeader
        step="03"
        title="Generate Infrastructure"
        description="Validate your config and produce production-ready IaC templates."
        icon={Sparkles}
      />

      <GenerationStaleBanner />

      <WizardPanel title="Infrastructure Summary" description="Project overview" icon={FolderTree}>
        <WizardStatRow
          columns={4}
          stats={[
            { label: "Project", value: <span className="text-xs truncate max-w-[80px]">{projectName}</span> },
            { label: "Region", value: region.split("-")[1]?.toUpperCase() || region },
            {
              label: "Environment",
              value: (
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {environment}
                </Badge>
              ),
            },
            {
              label: "Format",
              value: (
                <Badge className="text-[10px] bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/20">
                  {outputFormat}
                </Badge>
              ),
            },
          ]}
        />
        <Separator className="my-2 sm:my-3" />
        <WizardStatRow
          columns={3}
          stats={[
            { label: "Services", value: selectedServices.length },
            { label: "Est. Time", value: `${(estimatedTime / 1000).toFixed(1)}s` },
            {
              label: "Complexity",
              value:
                selectedServices.length <= 2
                  ? "Low"
                  : selectedServices.length <= 4
                    ? "Medium"
                    : "High",
            },
          ]}
        />
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedServices.map((sid) => {
            const service = getServiceById(sid);
            return (
              <Badge key={sid} variant="outline" className="text-[10px] h-5 px-1.5">
                {service?.name || sid}
              </Badge>
            );
          })}
        </div>
      </WizardPanel>

      {/* Validation */}
      {validationResult && (
        <WizardPanel
          title="Validation Result"
          icon={validationResult.valid ? CheckCircle2 : XCircle}
        >
          <div className="space-y-2">
            {validationResult.errors.map((err, i) => (
              <Alert key={i} variant="destructive" className="p-3 sm:p-4">
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <AlertTitle className="text-xs sm:text-sm">{err.service}</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">{err.message}</AlertDescription>
              </Alert>
            ))}
            {validationResult.warnings.map((warn, i) => (
              <Alert key={i} className="p-3 sm:p-4">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                <AlertTitle className="text-xs sm:text-sm">{warn.service}</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">{warn.message}</AlertDescription>
              </Alert>
            ))}
            {validationResult.valid &&
              validationResult.errors.length === 0 && (
                <Alert className="p-3 sm:p-4">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  <AlertTitle className="text-xs sm:text-sm">All checks passed</AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm">
                    Your infrastructure configuration is valid and ready
                    to generate.
                  </AlertDescription>
                </Alert>
              )}
          </div>
        </WizardPanel>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="p-3 sm:p-4">
          <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <AlertTitle className="text-xs sm:text-sm">Error</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Enhanced Progress with Steps */}
      {isGenerating && (
        <WizardPanel title="Generating..." description="Processing step by step" icon={Loader2}>
          <Progress value={progress} className="w-full h-1.5 sm:h-2 mb-3" />
          <div className="space-y-2">
              {generationSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-100 text-green-600' :
                    step.status === 'running' ? 'bg-blue-100 text-blue-600' :
                    step.status === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : step.status === 'running' ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : step.status === 'error' ? (
                      <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <p className={`font-medium text-xs sm:text-sm truncate ${
                        step.status === 'running' ? 'text-blue-600' :
                        step.status === 'completed' ? 'text-green-600' :
                        step.status === 'error' ? 'text-red-600' :
                        'text-gray-500'
                      }`}>
                        {step.name}
                      </p>
                      {step.duration && (
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          ({(step.duration / 1000).toFixed(1)}s)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </WizardPanel>
      )}

      {generatedFiles.length > 0 && (
        <WizardPanel
          title="Generated Files"
          description={`${generatedFiles.length} file${generatedFiles.length !== 1 ? "s" : ""}`}
          icon={FileCode2}
          action={
            <Label className="flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-xs">
              <Switch checked={showLineNumbers} onCheckedChange={setShowLineNumbers} className="scale-75" />
              #
            </Label>
          }
        >
            <Tabs
              value={activeFileTab}
              onValueChange={setActiveFileTab}
              className="w-full min-w-0 gap-3"
            >
              <GeneratedFileTabsList
                files={generatedFiles}
                renderBadge={(fileName: string) => {
                  const stats = fileStats[fileName];
                  if (!stats) return null;
                  return (
                    <Badge
                      variant="secondary"
                      className="file-tab-badge ml-1 hidden border-0 bg-muted/80 text-[10px] sm:inline-flex group-data-active/trigger:bg-white/20 group-data-active/trigger:text-white"
                    >
                      {stats.complexity}
                    </Badge>
                  );
                }}
              />
              {generatedFiles.map((file) => {
                const stats = fileStats[file.name];
                return (
                  <TabsContent key={file.name} value={file.name} className="mt-0 space-y-3 outline-none">
                    {stats && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground border-b pb-2">
                        <span>{stats.lines} lines</span>
                        <span>{stats.size}</span>
                        <Badge variant={stats.complexity === 'High' ? 'destructive' : stats.complexity === 'Medium' ? 'default' : 'secondary'}>
                          {stats.complexity} Complexity
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(file.content, file.name)}
                        className="flex items-center gap-2"
                        title="Copy file content to clipboard"
                      >
                        {copiedFile === file.name ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copiedFile === file.name ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(file.content, file.name)}
                        className="flex items-center gap-2"
                        title="Download this file"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                    <ScrollArea className={cn("w-full rounded-lg", wizardStyles.codeBlock, "h-[280px] sm:h-[400px]")}>
                      <pre className="p-3 sm:p-4">
                        <code className={showLineNumbers ? 'flex' : ''}>
                          {showLineNumbers ? (
                            <div className="flex">
                              <div className="pr-4 text-gray-400 select-none border-r">
                                {file.content.split('\n').map((_, i) => (
                                  <div key={i} className="text-right">
                                    {i + 1}
                                  </div>
                                ))}
                              </div>
                              <div className="pl-4">
                                <code>{file.content}</code>
                              </div>
                            </div>
                          ) : (
                            <code>{file.content}</code>
                          )}
                        </code>
                      </pre>
                    </ScrollArea>
                  </TabsContent>
                );
              })}
            </Tabs>
        </WizardPanel>
      )}

      <WizardActionBar>
        <div className="flex gap-2 flex-1 sm:flex-none">
          <Button variant="outline" size="sm" onClick={onBackToHome} className="h-8 flex-1 sm:h-9 text-xs">
            <Home className="mr-1 h-3 w-3" />
            Home
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStep("configure")} className="h-8 flex-1 sm:h-9 text-xs">
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back
          </Button>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={isGenerating || isValidating}
            className="h-8 flex-1 sm:h-9 text-xs"
          >
            {isValidating ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Shield className="mr-1 h-3 w-3" />
            )}
            Validate
          </Button>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || isValidating || selectedServices.length === 0}
            className="h-8 flex-1 sm:h-9 text-xs bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isGenerating ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <FileCode2 className="mr-1 h-3 w-3" />
            )}
            Generate
          </Button>
          {generatedFiles.length > 0 && !isGenerationStale && validationResult?.valid !== false && (
            <Button
              size="sm"
              onClick={() => setStep("export")}
              className="h-8 flex-1 sm:h-9 text-xs bg-orange-500 hover:bg-orange-600 text-white"
            >
              Export
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </WizardActionBar>
    </div>
  );
}
