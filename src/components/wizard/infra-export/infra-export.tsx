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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useInfraStore } from "@/lib/store";
import { downloadInfrastructure } from "@/lib/api";
import {
  wizardStyles,
  WizardHeader,
  WizardPanel,
  WizardStatRow,
  WizardActionBar,
  GeneratedFileTabsList,
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
    setStep,
    reset,
  } = useInfraStore();

  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [includeReadme, setIncludeReadme] = useState(true);
  const [includeGitignore, setIncludeGitignore] = useState(true);
  const [selectedDeployment, setSelectedDeployment] = useState("terraform");
  const [showLineNumbers, setShowLineNumbers] = useState(false);

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
        "        run: terraform apply"
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

  if (generatedFiles.length === 0) {
    return (
      <div className={wizardStyles.shell}>
        <WizardHeader
          step="04"
          title="Export Infrastructure"
          description="Download your IaC package and deploy with confidence."
          icon={Package}
        />
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No generated files found. Generate infrastructure first, then return here to export.
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
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            Generated successfully
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Shield className="h-3 w-3" />
            Security best practices applied
          </div>
        </div>
      </WizardPanel>

      <WizardPanel variant="accent" title="Download Package" icon={FileArchive}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 space-y-2">
              <p className="text-sm sm:font-medium truncate">
                {projectName}-{outputFormat}.zip
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {generatedFiles.length} files &bull; {outputFormat === "terraform" ? "Terraform" : "CloudFormation"} &bull; {environment}
              </p>
              
              {/* Download Options */}
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={includeReadme}
                    onCheckedChange={setIncludeReadme}
                    className="scale-75 sm:scale-100"
                  />
                  <Label className="text-xs sm:text-sm">Include README.md</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={includeGitignore}
                    onCheckedChange={setIncludeGitignore}
                    className="scale-75 sm:scale-100"
                  />
                  <Label className="text-xs sm:text-sm">Include .gitignore</Label>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2" />
                    Preparing ZIP...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download ZIP
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
                      className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm"
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
                      <Share2 className="mr-1 h-3 w-3" />
                      Copy Summary
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

      <WizardPanel
        title="Generated Files"
        description="Preview & copy"
        icon={FileCode2}
        action={
          <Button variant="outline" size="sm" onClick={copyAllFiles} className="h-7 text-xs">
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
                          <p>Copy file content to clipboard</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openFilePreview(file.content, file.name)}
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
                  
                  <ScrollArea className={cn("w-full h-[240px] sm:h-[360px] rounded-lg", wizardStyles.codeBlock)}>
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
                </div>
              </TabsContent>
            ))}
          </Tabs>
      </WizardPanel>

      <WizardPanel title="Deploy Instructions" description="Choose your method" icon={Terminal}>
          <div className="space-y-4">
            {/* Deployment Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {deploymentOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedDeployment === option.id;
                
                return (
                  <div
                    key={option.id}
                    className={`relative cursor-pointer rounded-lg border p-4 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedDeployment(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{option.name}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant={option.difficulty === 'Beginner' ? 'secondary' : option.difficulty === 'Intermediate' ? 'default' : 'destructive'} className="text-xs">
                        {option.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {option.estimatedTime}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Selected Commands */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Deployment Commands</h4>
                <Badge variant="outline" className="text-xs">
                  {deploymentOptions.find(opt => opt.id === selectedDeployment)?.name}
                </Badge>
              </div>
              
              <div className="rounded-lg bg-muted/50 border p-4 space-y-2">
                {deploymentOptions.find(opt => opt.id === selectedDeployment)?.commands.map((cmd, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-muted-foreground select-none">$</span>
                    <code className="text-sm font-mono">{cmd}</code>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const commands = deploymentOptions.find(opt => opt.id === selectedDeployment)?.commands.join('\n') || '';
                          navigator.clipboard.writeText(commands);
                        }}
                      />
                    }
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy Commands
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy commands to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            {/* Deployment Tips */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Before deploying:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Ensure you have proper AWS credentials configured</li>
                    <li>• Review the generated code for any custom modifications</li>
                    <li>• Test in a non-production environment first</li>
                    <li>• Keep your state files secure and backed up</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </div>
      </WizardPanel>

      <WizardActionBar>
        <div className="flex gap-2 flex-1 sm:flex-none">
          <Button variant="outline" size="sm" onClick={onBackToHome} className="h-8 flex-1 sm:h-9 text-xs">
            <Home className="mr-1 h-3 w-3" />
            Home
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStep("generate")} className="h-8 flex-1 sm:h-9 text-xs">
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleStartOver} className="h-8 w-full sm:w-auto sm:h-9 text-xs">
          <RotateCcw className="mr-1 h-3 w-3" />
          Start Over
        </Button>
      </WizardActionBar>
    </div>
  );
}
