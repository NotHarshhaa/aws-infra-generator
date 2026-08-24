"use client";

import { useState } from "react";
import {
  Download,
  FileArchive,
  FileCode2,
  Copy,
  Check,
  ArrowLeft,
  RotateCcw,
  Terminal,
  Home,
  Share2,
  Github,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Package,
  Eye,
  GitBranch,
  Container,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useInfraStore } from "@/lib/store";
import { downloadInfrastructure } from "@/lib/api";
import { getAllCicdPipelines, type CicdPipeline } from "@/lib/cicd-generators";
import {
  wizardStyles,
  WizardHeader,
  WizardPanel,
  WizardStatRow,
  WizardActionBar,
  GeneratedFileTabsList,
  GenerationStaleBanner,
} from "@/components/wizard/shared";
import { cn } from "@/lib/utils";

interface InfraExportProps {
  onBackToHome: () => void;
}

interface ExportStats {
  totalFiles: number;
  totalSize: string;
  totalLines: number;
  estimatedDeployTime: string;
  securityScore: number;
}

interface DeploymentOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  commands: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
}

export function InfraExport({ onBackToHome }: InfraExportProps) {
  const {
    selectedServices,
    serviceConfig,
    environment,
    region,
    outputFormat,
    projectName,
    generatedFiles,
    isGenerationStale,
    setStep,
    reset,
  } = useInfraStore();

  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [includeReadme, setIncludeReadme] = useState(true);
  const [includeGitignore, setIncludeGitignore] = useState(true);
  const [includeMakefile, setIncludeMakefile] = useState(true);
  const [includeDeployScript, setIncludeDeployScript] = useState(true);
  const [selectedDeployment, setSelectedDeployment] = useState("terraform");
  const [selectedCicd, setSelectedCicd] = useState("github-actions");
  const [showLineNumbers, setShowLineNumbers] = useState(false);

  const cicdPipelines = getAllCicdPipelines({
    projectName: projectName || "aws-infra",
    environment,
    region,
    outputFormat,
  });

  // Calculate export statistics
  const calculateExportStats = (): ExportStats => {
    const totalLines = generatedFiles.reduce((acc, file) => acc + file.content.split('\n').length, 0);
    const totalSize = `${(generatedFiles.reduce((acc, file) => acc + file.content.length, 0) / 1024).toFixed(1)} KB`;
    const estimatedDeployTime = selectedServices.length <= 2 ? "5-10 min" : selectedServices.length <= 4 ? "10-20 min" : "20-30 min";
    const securityScore = Math.min(100, 60 + (selectedServices.length * 8) + (outputFormat === 'terraform' ? 10 : 5));
    
    return {
      totalFiles: generatedFiles.length,
      totalSize,
      totalLines,
      estimatedDeployTime,
      securityScore
    };
  };

  const stats = calculateExportStats();

  // Deployment options
  const deploymentOptions: DeploymentOption[] = [
    {
      id: "terraform",
      name: "Terraform CLI",
      description: "Deploy using Terraform command line tools",
      icon: Terminal,
      commands: [
        `cd ${projectName}`,
        "terraform init",
        "terraform plan",
        "terraform apply"
      ],
      difficulty: "Beginner",
      estimatedTime: stats.estimatedDeployTime
    },
    {
      id: "cloudformation",
      name: "AWS CLI",
      description: "Deploy using AWS CloudFormation CLI",
      icon: Cloud,
      commands: [
        `cd ${projectName}`,
        `aws cloudformation deploy --template-file template.json --stack-name ${projectName}-stack --capabilities CAPABILITY_IAM`,
      ],
      difficulty: "Intermediate",
      estimatedTime: stats.estimatedDeployTime
    },
    {
      id: "cdk",
      name: "AWS CDK CLI",
      description: "Deploy using AWS Cloud Development Kit (TypeScript)",
      icon: Terminal,
      commands: [
        `cd ${projectName}`,
        "npm install",
        "npx cdk synth",
        "npx cdk deploy"
      ],
      difficulty: "Intermediate",
      estimatedTime: stats.estimatedDeployTime
    },
    {
      id: "github",
      name: "GitHub Actions",
      description: "Deploy using GitHub Actions CI/CD",
      icon: Github,
      commands: [
        "# .github/workflows/deploy.yml",
        "name: Deploy Infrastructure",
        "on: [push]",
        "jobs:",
        "  deploy:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v2",
        "      - name: Deploy",
        outputFormat === "cdk"
          ? "        run: npx cdk deploy --all --require-approval never"
          : outputFormat === "terraform"
          ? "        run: terraform apply -auto-approve"
          : "        run: aws cloudformation deploy --template-file template.json --stack-name my-stack"
      ],
      difficulty: "Advanced",
      estimatedTime: "15-25 min"
    }
  ];

  const handleCopy = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = async () => {
    if (generatedFiles.length === 0) {
      setDownloadError("No generated files available. Go back and generate infrastructure first.");
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
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
          includeReadme,
          includeGitignore,
          includeMakefile,
          includeDeployScript,
        }
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName}-${outputFormat}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopySummary = async () => {
    const summary = [
      `Project: ${projectName}`,
      `Environment: ${environment}`,
      `Region: ${region}`,
      `Format: ${outputFormat}`,
      `Services: ${selectedServices.join(", ")}`,
      `Files: ${generatedFiles.map((file) => file.name).join(", ")}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedFile("summary");
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error("Failed to copy summary:", err);
    }
  };

  const openFilePreview = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  };

  const copyAllFiles = async () => {
    const allContent = generatedFiles.map(file => 
      `// ${file.name}\n${'='.repeat(50)}\n${file.content}\n\n`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(allContent);
      setCopiedFile('all-files');
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error('Failed to copy all files:', err);
    }
  };

  const handleStartOver = () => {
    reset();
    setStep("services");
  };

  if (generatedFiles.length === 0 || isGenerationStale) {
    return (
      <div className={wizardStyles.shell}>
        <WizardHeader
          step="04"
          title="Export Infrastructure"
          description="Download your IaC package and deploy with confidence."
          icon={Package}
        />
        <Alert variant={isGenerationStale ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isGenerationStale
              ? "Configuration changed after your last generation. Re-generate infrastructure before exporting."
              : "No generated files found. Generate infrastructure first, then return here to export."}
          </AlertDescription>
        </Alert>
        <WizardActionBar>
          <Button variant="outline" size="sm" onClick={() => setStep("generate")} className="h-8 text-xs">
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to Generate
          </Button>
        </WizardActionBar>
      </div>
    );
  }

  return (
    <div className={wizardStyles.shell}>
      <WizardHeader
        step="04"
        title="Export Infrastructure"
        description="Download your IaC package and deploy with confidence."
        icon={Package}
      />

      <GenerationStaleBanner />

      <WizardPanel title="Export Summary" description="Package overview">
        <WizardStatRow
          columns={5}
          stats={[
            { label: "Files", value: stats.totalFiles },
            { label: "Size", value: stats.totalSize },
            { label: "Lines", value: stats.totalLines },
            { label: "Security", value: `${stats.securityScore}%` },
            { label: "Deploy", value: stats.estimatedDeployTime },
          ]}
        />
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Generated successfully with validated syntax
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-orange-500" />
            Security & Well-Architected governance checks applied
          </div>
        </div>
      </WizardPanel>

      <WizardPanel variant="accent" title="Download IaC Package" icon={FileArchive}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 space-y-2.5">
              <div>
                <p className="text-sm font-semibold truncate">
                  {projectName}-{outputFormat}.zip
                </p>
                <p className="text-xs text-muted-foreground">
                  {generatedFiles.length} template files &bull; {outputFormat.toUpperCase()} &bull; {environment} ({region})
                </p>
              </div>
              
              {/* Download Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={includeReadme}
                    onCheckedChange={setIncludeReadme}
                    className="scale-75 sm:scale-90"
                  />
                  <Label className="text-xs cursor-pointer">README.md</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={includeGitignore}
                    onCheckedChange={setIncludeGitignore}
                    className="scale-75 sm:scale-90"
                  />
                  <Label className="text-xs cursor-pointer">.gitignore</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={includeMakefile}
                    onCheckedChange={setIncludeMakefile}
                    className="scale-75 sm:scale-90"
                  />
                  <Label className="text-xs cursor-pointer">Makefile</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={includeDeployScript}
                    onCheckedChange={setIncludeDeployScript}
                    className="scale-75 sm:scale-90"
                  />
                  <Label className="text-xs cursor-pointer">deploy.sh</Label>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full sm:w-auto rounded-full h-9 px-5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-xs"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                    Packaging ZIP...
                  </>
                ) : (
                  <>
                    <Download className="mr-1.5 h-4 w-4" />
                    Download ZIP Bundle
                  </>
                )}
              </Button>

              {downloadError && (
                <p className="text-xs text-red-500">{downloadError}</p>
              )}

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopySummary}
                      className="w-full sm:w-auto rounded-full h-8 text-xs border-border/70"
                    />
                  }
                >
                  {copiedFile === "summary" ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="mr-1.5 h-3.5 w-3.5" />
                      Copy Project Summary
                    </>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy project summary to clipboard</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
      </WizardPanel>

      {/* Generated Code Viewer */}
      <WizardPanel
        title="Generated Files"
        description="Preview & copy code"
        icon={FileCode2}
        action={
          <Button variant="outline" size="sm" onClick={copyAllFiles} className="rounded-full h-7 text-xs">
            {copiedFile === "all-files" ? (
              <>
                <Check className="mr-1 h-3 w-3" />
                Copied all
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3 w-3" />
                Copy all
              </>
            )}
          </Button>
        }
      >
          <Tabs
            defaultValue={generatedFiles[0]?.name || ""}
            className="w-full min-w-0 gap-3"
          >
            <GeneratedFileTabsList
              files={generatedFiles}
              renderBadge={(fileName) => {
                const file = generatedFiles.find((f) => f.name === fileName);
                if (!file) return null;
                return (
                  <Badge
                    variant="secondary"
                    className="file-tab-badge ml-1 hidden border-0 bg-muted/80 text-[10px] sm:inline-flex group-data-active/trigger:bg-white/20 group-data-active/trigger:text-white"
                  >
                    {file.language}
                  </Badge>
                );
              }}
            />
            {generatedFiles.map((file) => (
              <TabsContent key={file.name} value={file.name} className="mt-0 outline-none">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {file.path}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {file.language}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(file.content, file.name)}
                              className="rounded-full h-7 px-3 text-xs"
                            />
                          }
                        >
                          {copiedFile === file.name ? (
                            <>
                              <Check className="mr-1 h-3 w-3" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-3 w-3" />
                              Copy
                            </>
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy file content</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openFilePreview(file.content, file.name)}
                              className="rounded-full h-7 px-3 text-xs"
                            />
                          }
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open file in new tab</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  
                  <ScrollArea className={cn("w-full h-[240px] sm:h-[360px] rounded-2xl", wizardStyles.codeBlock)}>
                    <pre className="p-4 text-xs font-mono">
                      {showLineNumbers ? (
                        <div className="flex">
                          <div className="pr-4 text-gray-400 select-none border-r">
                            {file.content.split('\n').map((_, i) => (
                              <div key={i} className="text-right">
                                {i + 1}
                              </div>
                            ))}
                          </div>
                          <code className="pl-4 flex-1 overflow-x-auto">{file.content}</code>
                        </div>
                      ) : (
                        <code>{file.content}</code>
                      )}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
            ))}
          </Tabs>
      </WizardPanel>

      {/* Enterprise CI/CD Pipeline Generator */}
      <WizardPanel
        title="Automated CI/CD Pipelines"
        description="Ready-to-use workflows for GitHub, GitLab & AWS CodeBuild"
        icon={GitBranch}
      >
        <Tabs value={selectedCicd} onValueChange={setSelectedCicd} className="w-full">
          <TabsList className="rounded-full bg-muted/50 p-1 mb-3">
            {cicdPipelines.map((pipe) => (
              <TabsTrigger
                key={pipe.id}
                value={pipe.id}
                className="rounded-full text-xs font-medium px-3.5 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
              >
                {pipe.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {cicdPipelines.map((pipe) => (
            <TabsContent key={pipe.id} value={pipe.id} className="space-y-3 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold font-mono">{pipe.filename}</span>
                  <p className="text-[11px] text-muted-foreground">{pipe.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(pipe.content, pipe.id)}
                  className="rounded-full h-7 px-3 text-xs"
                >
                  {copiedFile === pipe.id ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy Pipeline
                    </>
                  )}
                </Button>
              </div>

              <ScrollArea className={cn("w-full h-[220px] rounded-2xl", wizardStyles.codeBlock)}>
                <pre className="p-4 text-xs font-mono">
                  <code>{pipe.content}</code>
                </pre>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </WizardPanel>

      {/* Deployment Instructions */}
      <WizardPanel title="Deployment Methods & Automation Tooling" description="Run locally, in Docker, or via CI/CD" icon={Terminal}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {deploymentOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedDeployment === option.id;
                
                return (
                  <div
                    key={option.id}
                    className={cn(
                      "cursor-pointer rounded-2xl border p-3.5 transition-all text-left",
                      isSelected
                        ? "border-orange-500/60 bg-orange-500/10 shadow-xs ring-1 ring-orange-500/20"
                        : "border-border/70 hover:bg-muted/40"
                    )}
                    onClick={() => setSelectedDeployment(option.id)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl",
                        isSelected ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold tracking-tight">{option.name}</h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{option.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <Badge variant="secondary" className="rounded-full text-[9px] px-1.5 py-0 font-medium">
                        {option.difficulty}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-[9px] px-1.5 py-0">
                        {option.estimatedTime}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Selected Commands */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold">Deployment Commands</h4>
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    {deploymentOptions.find(opt => opt.id === selectedDeployment)?.name}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const commands = deploymentOptions.find(opt => opt.id === selectedDeployment)?.commands.join('\n') || '';
                    try {
                      await navigator.clipboard.writeText(commands);
                      setCopiedFile("commands");
                      setTimeout(() => setCopiedFile(null), 2000);
                    } catch (err) {
                      console.error("Failed to copy commands:", err);
                    }
                  }}
                  className="rounded-full h-7 px-3 text-xs"
                >
                  {copiedFile === "commands" ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy Commands
                    </>
                  )}
                </Button>
              </div>
              
              <div className="rounded-2xl bg-zinc-950 p-3.5 space-y-1.5 text-zinc-200 border border-border/80">
                {deploymentOptions.find(opt => opt.id === selectedDeployment)?.commands.map((cmd, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-zinc-500 select-none">$</span>
                    <code className="text-emerald-400">{cmd}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </WizardPanel>

      <WizardActionBar>
        <div className="flex gap-2 flex-1 sm:flex-none">
          <Button variant="outline" size="sm" onClick={onBackToHome} className="rounded-full h-8 flex-1 sm:h-9 text-xs">
            <Home className="mr-1 h-3.5 w-3.5" />
            Home
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStep("generate")} className="rounded-full h-8 flex-1 sm:h-9 text-xs">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Back
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleStartOver} className="rounded-full h-8 w-full sm:w-auto sm:h-9 text-xs">
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Start Over
        </Button>
      </WizardActionBar>
    </div>
  );
}
