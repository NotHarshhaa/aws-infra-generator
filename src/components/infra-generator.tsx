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
  Eye,
  GitBranch,
  Clock,
  Zap,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { useInfraStore } from "@/lib/store";
import { generateInfrastructure, validateInfrastructure } from "@/lib/api";
import { getServiceById } from "@/lib/aws-services";

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

    const stepDuration = estimatedTime / 5; // Divide time among steps
    
    try {
      // Step 1: Validation
      updateStepStatus("validate", "running");
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      updateStepStatus("validate", "completed", stepDuration);
      setProgress(20);

      // Step 2: Template Generation
      updateStepStatus("template", "running");
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      updateStepStatus("template", "completed", stepDuration);
      setProgress(40);

      // Step 3: Resource Processing
      updateStepStatus("resources", "running");
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      updateStepStatus("resources", "completed", stepDuration);
      setProgress(60);

      // Step 4: Optimization
      updateStepStatus("optimize", "running");
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      updateStepStatus("optimize", "completed", stepDuration);
      setProgress(80);

      // Step 5: Finalization
      updateStepStatus("finalize", "running");
      
      const result = await generateInfrastructure({
        services: selectedServices,
        config: serviceConfig,
        environment,
        region,
        format: outputFormat,
        projectName,
      });

      updateStepStatus("finalize", "completed", stepDuration);
      setProgress(100);
      setGeneratedFiles(result.files);
      setValidationResult(result.validation);

      // Calculate file stats
      const stats: Record<string, FileStats> = {};
      result.files.forEach(file => {
        stats[file.name] = calculateFileStats(file.content);
      });
      setFileStats(stats);

      if (result.files.length > 0) {
        setActiveFileTab(result.files[0].name);
      }
    } catch (err) {
      // Mark current step as error
      const currentStep = generationSteps.find(step => step.status === "running");
      if (currentStep) {
        updateStepStatus(currentStep.id, "error");
      }
      setError(
        err instanceof Error ? err.message : "Generation failed"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-lg sm:text-2xl font-bold">Generate Infrastructure</h2>
        <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
          Validate and generate your infrastructure templates.
        </p>
      </div>

      {/* Enhanced Summary */}
      <Card>
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <FolderTree className="h-3 w-3 sm:h-5 sm:w-5" />
            Infrastructure Summary
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Overview of your infrastructure configuration and estimated generation time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Project</p>
              <p className="text-xs sm:font-semibold truncate">{projectName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Region</p>
              <p className="text-xs sm:font-semibold">{region}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Environment</p>
              <Badge variant="secondary" className="text-xs">{environment}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Format</p>
              <Badge className="text-xs">{outputFormat}</Badge>
            </div>
          </div>
          <Separator className="my-2 sm:my-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <GitBranch className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Services</p>
                <p className="text-xs sm:font-semibold">{selectedServices.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Est. Time</p>
                <p className="text-xs sm:font-semibold">{(estimatedTime / 1000).toFixed(1)}s</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Complexity</p>
                <p className="text-xs sm:font-semibold">
                  {selectedServices.length <= 2 ? "Low" : selectedServices.length <= 4 ? "Medium" : "High"}
                </p>
              </div>
            </div>
          </div>
          <Separator className="my-2 sm:my-4" />
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Selected Services</p>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {selectedServices.map((sid) => {
                const service = getServiceById(sid);
                return (
                  <Badge key={sid} variant="outline" className="flex items-center gap-1 text-xs">
                    {service?.name || sid}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation */}
      {validationResult && (
        <Card>
          <CardHeader className="pb-2 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
              {validationResult.valid ? (
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              )}
              Validation Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
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
          </CardContent>
        </Card>
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
        <Card>
          <CardHeader className="pb-2 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              Generating Infrastructure
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Processing your infrastructure configuration step by step
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Progress value={progress} className="w-full h-2 sm:h-4" />
            
            <div className="space-y-2 sm:space-y-3">
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
          </CardContent>
        </Card>
      )}

      {/* Enhanced Generated Files */}
      {generatedFiles.length > 0 && (
        <Card>
          <CardHeader className="pb-2 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                  <FileCode2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Generated Files
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {generatedFiles.length} file{generatedFiles.length !== 1 ? "s" : ""} generated
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <Switch
                        checked={showLineNumbers}
                        onCheckedChange={setShowLineNumbers}
                        className="scale-75 sm:scale-100"
                      />
                      <span className="text-xs sm:text-sm hidden sm:inline">Line Numbers</span>
                      <span className="text-xs sm:hidden">#</span>
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle line numbers in code view</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeFileTab}
              onValueChange={setActiveFileTab}
            >
              <TabsList className="flex-wrap h-auto gap-1 p-1">
                {generatedFiles.map((file) => (
                  <TabsTrigger key={file.name} value={file.name} className="text-xs relative h-7 px-2 sm:h-8 sm:px-3">
                    <span className="truncate max-w-20 sm:max-w-none">{file.name}</span>
                    {fileStats[file.name] && (
                      <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] hidden sm:inline-flex">
                        {fileStats[file.name].complexity}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              {generatedFiles.map((file) => {
                const stats = fileStats[file.name];
                return (
                  <TabsContent key={file.name} value={file.name} className="space-y-3">
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
                    <ScrollArea className="h-[400px] w-full rounded-md border">
                      <pre className="p-4 text-sm">
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
          </CardContent>
        </Card>
      )}

      {/* Enhanced Actions */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 sm:flex-row sm:gap-2">
          <Button variant="outline" size="sm" onClick={onBackToHome} className="flex-1 h-8 sm:h-9">
            <Home className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Home</span>
          </Button>
          <Button variant="outline" onClick={() => setStep("configure")} className="flex-1 h-8 sm:h-9">
            <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to Configure</span>
            <span className="sm:hidden">Configure</span>
          </Button>
        </div>
        <div className="flex gap-2 sm:flex-row sm:gap-3">
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={isGenerating || isValidating}
            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
          >
            {isValidating ? (
              <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Shield className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            )}
            {isValidating ? 'Validating...' : 'Validate'}
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || isValidating}
            size="sm"
            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
          >
            {isGenerating ? (
              <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <FileCode2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
          {generatedFiles.length > 0 && (
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <Button 
                    onClick={downloadAllFiles} 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Download All</span>
                    <span className="sm:hidden">Download</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download all generated files as ZIP</p>
                </TooltipContent>
              </Tooltip>
              <Button onClick={() => setStep("export")} size="sm" className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm">
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
                <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
