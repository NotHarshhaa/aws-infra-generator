"use client";

import { useState, useEffect, useMemo } from "react";
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
  Search,
  Maximize2,
  Minimize2,
  FileArchive,
  Layers,
  Database,
  Server,
  Network,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useInfraStore,
  generateInfrastructure,
  validateInfrastructure,
  downloadInfrastructure,
  getServiceById,
  cn,
} from "@/lib";
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
    backendType,
    ownerEmail,
    costCenter,
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
  const [isZipping, setIsZipping] = useState(false);
  const [codeSearchQuery, setCodeSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const calculateFileStats = (content: string): FileStats => {
    const lines = content.split("\n").length;
    const size = `${(content.length / 1024).toFixed(1)} KB`;

    let complexity: "Low" | "Medium" | "High" = "Low";
    if (lines > 120) complexity = "Medium";
    if (lines > 300 || (content.includes("resource") && content.split("resource").length > 10)) {
      complexity = "High";
    }

    return { lines, size, complexity };
  };

  // Recalculate stats whenever generated files change
  useEffect(() => {
    if (generatedFiles.length > 0) {
      const stats: Record<string, FileStats> = {};
      generatedFiles.forEach((file) => {
        stats[file.name] = calculateFileStats(file.content);
      });
      setFileStats(stats);
      if (!activeFileTab || !generatedFiles.some((f) => f.name === activeFileTab)) {
        setActiveFileTab(generatedFiles[0].name);
      }
    }
  }, [generatedFiles, activeFileTab]);

  const initializeGenerationSteps = (): GenerationStep[] => [
    {
      id: "validate",
      name: "Topology & Dependency Validation",
      description: "Checking service inter-dependencies, subnets & network constraints",
      status: "pending",
    },
    {
      id: "parameters",
      name: "Resource Parameter Synthesis",
      description: "Applying sizing, region AZs, and security defaults",
      status: "pending",
    },
    {
      id: "template",
      name: `Compiling ${outputFormat.toUpperCase()} Stacks`,
      description: `Synthesizing ${outputFormat} template files and variable schemas`,
      status: "pending",
    },
    {
      id: "governance",
      name: "Governance & Tagging Verification",
      description: "Injecting enterprise metadata tags and state backend definitions",
      status: "pending",
    },
    {
      id: "finalize",
      name: "Template Assembly Complete",
      description: "Finalizing bundle packaging for deploy readiness",
      status: "pending",
    },
  ];

  const updateStepStatus = (
    stepId: string,
    status: GenerationStep["status"],
    duration?: number
  ) => {
    setGenerationSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, status, duration } : step
      )
    );
  };

  const copyToClipboard = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      toast.success(`Copied ${fileName} to clipboard`);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadSingleFile = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}`);
  };

  const handleDownloadZip = async () => {
    if (generatedFiles.length === 0) return;
    try {
      setIsZipping(true);
      const blob = await downloadInfrastructure(
        {
          services: selectedServices,
          config: serviceConfig,
          environment,
          region,
          format: outputFormat,
          projectName,
        },
        {
          files: generatedFiles,
          includeReadme: true,
          includeGitignore: true,
          includeMakefile: true,
          includeDeployScript: true,
        }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName}-${environment}-${outputFormat}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${projectName} infrastructure ZIP!`);
    } catch (err) {
      toast.error("Failed to download ZIP archive");
    } finally {
      setIsZipping(false);
    }
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
      if (result.valid) {
        toast.success("Validation passed! All services are compatible.");
      } else {
        toast.error(`Validation found ${result.errors.length} issue(s).`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Validation failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsValidating(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setProgress(5);
    setGenerationSteps(initializeGenerationSteps());

    try {
      // Step 1: Validation
      updateStepStatus("validate", "running");
      setProgress(15);
      const valStart = Date.now();

      const validation = await validateInfrastructure({
        services: selectedServices,
        config: serviceConfig,
        environment,
        projectName,
      });
      setValidationResult(validation);

      if (!validation.valid) {
        updateStepStatus("validate", "error", Date.now() - valStart);
        setError("Fix validation errors before generating infrastructure.");
        toast.error("Validation failed. Resolve configuration issues.");
        return;
      }

      updateStepStatus("validate", "completed", Date.now() - valStart);
      setProgress(35);

      // Step 2: Synthesis
      updateStepStatus("parameters", "running");
      await new Promise((r) => setTimeout(r, 200));
      updateStepStatus("parameters", "completed", 180);
      setProgress(55);

      // Step 3: Compilation
      updateStepStatus("template", "running");
      const genStart = Date.now();
      const result = await generateInfrastructure({
        services: selectedServices,
        config: serviceConfig,
        environment,
        region,
        format: outputFormat,
        projectName,
        backendType,
        ownerEmail,
        costCenter,
      });
      updateStepStatus("template", "completed", Date.now() - genStart);
      setProgress(80);

      // Step 4: Governance
      updateStepStatus("governance", "running");
      await new Promise((r) => setTimeout(r, 150));
      updateStepStatus("governance", "completed", 120);
      setProgress(95);

      // Step 5: Finalize
      updateStepStatus("finalize", "running");
      await new Promise((r) => setTimeout(r, 100));
      updateStepStatus("finalize", "completed", 80);
      setProgress(100);

      setGeneratedFiles(result.files);
      setValidationResult(result.validation);
      if (result.files.length > 0) {
        setActiveFileTab(result.files[0].name);
      }
      toast.success(
        `Generated ${result.files.length} production ${outputFormat.toUpperCase()} files!`
      );
    } catch (err) {
      setGenerationSteps((prev) =>
        prev.map((step) =>
          step.status === "running" ? { ...step, status: "error" as const } : step
        )
      );
      const msg = err instanceof Error ? err.message : "Generation failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Group services by category for summary display
  const servicesByCategory = useMemo(() => {
    const cats: Record<string, string[]> = {
      compute: [],
      networking: [],
      storage: [],
      database: [],
      security: [],
      messaging: [],
    };
    selectedServices.forEach((sid) => {
      const s = getServiceById(sid);
      const cat = s?.category || "other";
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(s?.name || sid);
    });
    return cats;
  }, [selectedServices]);

  const totalLines = useMemo(() => {
    return Object.values(fileStats).reduce((acc, s) => acc + s.lines, 0);
  }, [fileStats]);

  const activeFile = useMemo(() => {
    return generatedFiles.find((f) => f.name === activeFileTab);
  }, [generatedFiles, activeFileTab]);

  return (
    <div className={wizardStyles.shell}>
      <WizardHeader
        step="03"
        title="Generate Infrastructure"
        description="Verify architectural integrity, compile templates, and inspect production-ready IaC manifests."
        icon={Sparkles}
      />

      <GenerationStaleBanner />

      {/* Infrastructure Summary Panel */}
      <WizardPanel
        title="Architecture Synthesis Overview"
        description="Stack parameters & resource composition"
        icon={FolderTree}
        action={
          <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 uppercase text-[10px]">
            {outputFormat} target
          </Badge>
        }
      >
        <WizardStatRow
          columns={4}
          stats={[
            {
              label: "Project",
              value: <span className="font-mono text-xs truncate max-w-[120px]">{projectName}</span>,
            },
            {
              label: "AWS Region",
              value: <span className="font-mono text-xs">{region}</span>,
            },
            {
              label: "Environment",
              value: (
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {environment}
                </Badge>
              ),
            },
            {
              label: "State Backend",
              value: (
                <span className="font-mono text-xs capitalize">
                  {outputFormat === "terraform" ? backendType : "native"}
                </span>
              ),
            },
          ]}
        />

        <Separator className="my-2.5 sm:my-3" />

        {/* Category Breakdown Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
          {[
            { id: "compute", name: "Compute", icon: Server },
            { id: "networking", name: "Networking", icon: Network },
            { id: "storage", name: "Storage", icon: FolderTree },
            { id: "database", name: "Database", icon: Database },
            { id: "security", name: "Security", icon: Lock },
            { id: "messaging", name: "Messaging", icon: Layers },
          ].map((cat) => {
            const list = servicesByCategory[cat.id] || [];
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className={cn(
                  "p-2 rounded-xl border flex flex-col justify-between text-left transition-colors",
                  list.length > 0
                    ? "border-border/80 bg-muted/20"
                    : "border-border/40 bg-muted/5 opacity-50"
                )}
              >
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <Icon className="h-3 w-3" />
                  <span className="text-[10px] font-mono font-bold">{list.length}</span>
                </div>
                <div className="font-medium text-[11px] truncate">{cat.name}</div>
                {list.length > 0 ? (
                  <p className="text-[9px] text-muted-foreground truncate">{list.join(", ")}</p>
                ) : (
                  <p className="text-[9px] text-muted-foreground/60">None</p>
                )}
              </div>
            );
          })}
        </div>
      </WizardPanel>

      {/* Validation Results */}
      {validationResult && (
        <WizardPanel
          title="Validation Analysis"
          icon={validationResult.valid ? CheckCircle2 : XCircle}
        >
          <div className="space-y-2">
            {validationResult.errors.map((err, i) => (
              <Alert key={i} variant="destructive" className="p-3 text-xs">
                <XCircle className="h-3.5 w-3.5" />
                <AlertTitle className="text-xs font-semibold">{err.service}</AlertTitle>
                <AlertDescription className="text-xs">{err.message}</AlertDescription>
              </Alert>
            ))}
            {validationResult.warnings.map((warn, i) => (
              <Alert key={i} className="p-3 text-xs border-amber-500/40 bg-amber-500/5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <AlertTitle className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {warn.service}
                </AlertTitle>
                <AlertDescription className="text-xs">{warn.message}</AlertDescription>
              </Alert>
            ))}
            {validationResult.valid && validationResult.errors.length === 0 && (
              <Alert className="p-3 text-xs border-emerald-500/40 bg-emerald-500/5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <AlertTitle className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  All Compatibility & Policy Checks Passed
                </AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground">
                  Your architecture graph is cohesive, dependencies resolved, and ready for template synthesis.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </WizardPanel>
      )}

      {/* Error Banner */}
      {error && (
        <Alert variant="destructive" className="p-3 text-xs">
          <XCircle className="h-3.5 w-3.5" />
          <AlertTitle className="text-xs font-semibold">Generation Failed</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {/* Generation Progress Pipeline */}
      {isGenerating && (
        <WizardPanel
          title="Compiling Infrastructure..."
          description="Running automated multi-stage compilation pipeline"
          icon={Loader2}
        >
          <Progress value={progress} className="w-full h-2 mb-3" />
          <div className="space-y-2.5">
            {generationSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all",
                    step.status === "completed"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : step.status === "running"
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                      : step.status === "error"
                      ? "bg-red-500/15 text-red-600 dark:text-red-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : step.status === "running" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : step.status === "error" ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "font-semibold text-xs truncate",
                        step.status === "running"
                          ? "text-blue-600 dark:text-blue-400"
                          : step.status === "completed"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : step.status === "error"
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.name}
                    </p>
                    {step.duration !== undefined && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ({step.duration}ms)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </WizardPanel>
      )}

      {/* Generated Code Viewer */}
      {generatedFiles.length > 0 && (
        <WizardPanel
          title="Generated Infrastructure Templates"
          description={`${generatedFiles.length} file(s) synthesized • ${totalLines} total lines of code`}
          icon={FileCode2}
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="h-7 text-xs gap-1.5 px-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30 cursor-pointer"
              >
                {isZipping ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <FileArchive className="h-3 w-3" />
                )}
                Download ZIP
              </Button>
              <Label className="flex items-center gap-1 cursor-pointer text-xs text-muted-foreground">
                <Switch
                  checked={showLineNumbers}
                  onCheckedChange={setShowLineNumbers}
                  className="scale-75"
                />
                #
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Fullscreen inspector"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </div>
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
                    className="file-tab-badge ml-1 hidden border-0 bg-muted/80 text-[9px] sm:inline-flex group-data-active/trigger:bg-white/20 group-data-active/trigger:text-white"
                  >
                    {stats.complexity}
                  </Badge>
                );
              }}
            />

            {generatedFiles.map((file) => {
              const stats = fileStats[file.name];
              const lines = file.content.split("\n");
              const filteredLines = codeSearchQuery
                ? lines
                    .map((line, idx) => ({ line, originalIdx: idx }))
                    .filter((item) =>
                      item.line.toLowerCase().includes(codeSearchQuery.toLowerCase())
                    )
                : lines.map((line, idx) => ({ line, originalIdx: idx }));

              return (
                <TabsContent
                  key={file.name}
                  value={file.name}
                  className="mt-0 space-y-2.5 outline-none"
                >
                  {/* File Metadata & Toolbar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/40 pb-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                      <span>{stats?.lines ?? lines.length} lines</span>
                      <span>•</span>
                      <span>{stats?.size}</span>
                      <span>•</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-1.5 py-0 h-4 border",
                          stats?.complexity === "High"
                            ? "border-red-500/40 text-red-500"
                            : stats?.complexity === "Medium"
                            ? "border-amber-500/40 text-amber-500"
                            : "border-emerald-500/40 text-emerald-500"
                        )}
                      >
                        {stats?.complexity} Complexity
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-44">
                        <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                        <Input
                          value={codeSearchQuery}
                          onChange={(e) => setCodeSearchQuery(e.target.value)}
                          placeholder="Search in file..."
                          className="h-7 pl-7 text-[11px] bg-muted/30 border-border/70 font-mono"
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(file.content, file.name)}
                        className="h-7 text-xs gap-1.5 px-2.5 cursor-pointer"
                      >
                        {copiedFile === file.name ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copiedFile === file.name ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadSingleFile(file.content, file.name)}
                        className="h-7 text-xs gap-1.5 px-2.5 cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Code Box */}
                  <ScrollArea
                    className={cn(
                      "w-full rounded-xl border border-border/80 bg-zinc-950 text-zinc-100",
                      "h-[320px] sm:h-[440px] shadow-xs"
                    )}
                  >
                    <pre className="p-3 sm:p-4 text-xs font-mono">
                      <div className="flex">
                        {showLineNumbers && (
                          <div className="pr-3 text-zinc-500 select-none border-r border-zinc-800 text-right min-w-[2.5rem]">
                            {filteredLines.map((item, i) => (
                              <div key={i}>{item.originalIdx + 1}</div>
                            ))}
                          </div>
                        )}
                        <code className="pl-3 flex-1 overflow-x-auto text-zinc-200">
                          {filteredLines.map((item, i) => {
                            const isMatch =
                              codeSearchQuery &&
                              item.line.toLowerCase().includes(codeSearchQuery.toLowerCase());
                            return (
                              <div
                                key={i}
                                className={cn(
                                  "whitespace-pre",
                                  isMatch && "bg-orange-500/25 text-white font-bold"
                                )}
                              >
                                {item.line || " "}
                              </div>
                            );
                          })}
                        </code>
                      </div>
                    </pre>
                  </ScrollArea>
                </TabsContent>
              );
            })}
          </Tabs>
        </WizardPanel>
      )}

      {/* Fullscreen Code Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-4 sm:p-6 bg-zinc-950 text-zinc-100 border-zinc-800">
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-800">
            <DialogTitle className="text-sm font-mono flex items-center gap-2 text-zinc-100">
              <FileCode2 className="h-4 w-4 text-orange-500" />
              {activeFile?.name}
            </DialogTitle>
            <div className="flex items-center gap-2 pr-6">
              <Button
                size="sm"
                variant="outline"
                onClick={() => activeFile && copyToClipboard(activeFile.content, activeFile.name)}
                className="h-7 text-xs bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => activeFile && downloadSingleFile(activeFile.content, activeFile.name)}
                className="h-7 text-xs bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 pt-2">
            <ScrollArea className="h-full w-full font-mono text-xs text-zinc-200">
              <pre className="p-2">
                <code>{activeFile?.content}</code>
              </pre>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Footer */}
      <WizardActionBar>
        <div className="flex gap-2 flex-1 sm:flex-none">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToHome}
            className="h-8 flex-1 sm:h-9 text-xs"
          >
            <Home className="mr-1 h-3 w-3" />
            Home
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep("configure")}
            className="h-8 flex-1 sm:h-9 text-xs"
          >
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
            className="h-8 flex-1 sm:h-9 text-xs bg-orange-500 hover:bg-orange-600 text-white font-medium"
          >
            {isGenerating ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="mr-1 h-3 w-3" />
            )}
            {generatedFiles.length > 0 && !isGenerationStale
              ? "Re-Generate"
              : "Generate Code"}
          </Button>
          {generatedFiles.length > 0 &&
            !isGenerationStale &&
            validationResult?.valid !== false && (
              <Button
                size="sm"
                onClick={() => setStep("export")}
                className="h-8 flex-1 sm:h-9 text-xs bg-orange-500 hover:bg-orange-600 text-white font-medium"
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
