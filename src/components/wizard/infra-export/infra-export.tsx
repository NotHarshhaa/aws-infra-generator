"use client";

import { useState, useEffect } from "react";
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
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Shield,
  Package,
  Eye,
  GitBranch,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { useInfraStore } from "@/lib/store";
import { downloadInfrastructure } from "@/lib/api";

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
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [includeReadme, setIncludeReadme] = useState(true);
  const [includeGitignore, setIncludeGitignore] = useState(true);
  const [selectedDeployment, setSelectedDeployment] = useState("terraform");
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

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
        `aws cloudformation deploy --template-file template.yaml --stack-name ${projectName}-stack --capabilities CAPABILITY_IAM`
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
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Simulate download progress
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      const blob = await downloadInfrastructure({
        services: selectedServices,
        config: serviceConfig,
        environment,
        region,
        format: outputFormat,
        projectName,
      });

      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName}-${outputFormat}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Generate share URL (mock)
      setShareUrl(`https://infra-share.example.com/${projectName}-${Date.now()}`);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      clearInterval(progressInterval);
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(0), 1000);
    }
  };

  const handleShare = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedFile('share-url');
        setTimeout(() => setCopiedFile(null), 2000);
      } catch (err) {
        console.error('Failed to copy share URL:', err);
      }
    }
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
  };

  const deployCommands =
    outputFormat === "terraform"
      ? [
          "cd " + projectName,
          "terraform init",
          "terraform plan",
          "terraform apply",
        ]
      : [
          "cd " + projectName,
          `aws cloudformation deploy --template-file template.yaml --stack-name ${projectName}-stack --capabilities CAPABILITY_IAM`,
        ];

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-lg sm:text-2xl font-bold">Export Infrastructure</h2>
        <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
          Download your generated infrastructure templates and deploy them.
        </p>
      </div>

      {/* Export Statistics */}
      <Card>
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="text-sm sm:text-lg">Export Summary</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Overview of your generated infrastructure package
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalFiles}</div>
              <div className="text-xs text-muted-foreground">Files</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalSize}</div>
              <div className="text-xs text-muted-foreground">Size</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalLines}</div>
              <div className="text-xs text-muted-foreground">Lines</div>
            </div>
            <div className="text-center hidden md:block">
              <div className="text-lg sm:text-2xl font-bold">{stats.securityScore}%</div>
              <div className="text-xs text-muted-foreground">Security</div>
            </div>
            <div className="text-center hidden md:block">
              <div className="text-lg sm:text-2xl font-bold">{stats.estimatedDeployTime}</div>
              <div className="text-xs text-muted-foreground">Deploy</div>
            </div>
          </div>
          
          {/* Mobile-only additional stats */}
          <div className="grid grid-cols-2 gap-2 mt-2 md:hidden">
            <div className="text-center">
              <div className="text-lg font-bold">{stats.securityScore}%</div>
              <div className="text-xs text-muted-foreground">Security</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{stats.estimatedDeployTime}</div>
              <div className="text-xs text-muted-foreground">Deploy</div>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span className="text-xs sm:text-sm text-green-700">Infrastructure generated successfully!</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Security best practices applied</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Download Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <FileArchive className="h-4 w-4 sm:h-5 sm:w-5" />
            Download Package
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Download all generated files as a ZIP archive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
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
                className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                    Downloading... {downloadProgress}%
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download ZIP
                  </>
                )}
              </Button>
              
              {isDownloading && (
                <Progress value={downloadProgress} className="w-full h-1 sm:h-2" />
              )}
              
              {shareUrl && (
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm"
                    >
                      {copiedFile === 'share-url' ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 className="mr-1 h-3 w-3" />
                          Share
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy share URL to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced File Preview */}
      <Card>
        <CardHeader className="pb-2 sm:pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <FileCode2 className="h-4 w-4 sm:h-5 sm:w-5" />
                Generated Files
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Preview and copy individual files
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAllFiles}
                  >
                    {copiedFile === 'all-files' ? (
                      <>
                        <Check className="mr-1 h-3 w-3" />
                        Copied All!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" />
                        Copy All
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy all files to clipboard</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger>
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={showLineNumbers}
                      onCheckedChange={setShowLineNumbers}
                    />
                    <span className="text-sm">Line Numbers</span>
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
            defaultValue={generatedFiles[0]?.name || ""}
          >
            <TabsList className="flex-wrap h-auto gap-1">
              {generatedFiles.map((file) => (
                <TabsTrigger key={file.name} value={file.name} className="text-xs">
                  {file.name}
                  <Badge variant="secondary" className="ml-2 text-[10px]">
                    {file.language}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            {generatedFiles.map((file) => (
              <TabsContent key={file.name} value={file.name}>
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
                        <TooltipTrigger>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(file.content, file.name)}
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
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy file content to clipboard</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const blob = new Blob([file.content], { type: 'text/plain' });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = file.name;
                              a.click();
                              window.URL.revokeObjectURL(url);
                            }}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open file in new tab</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[400px] w-full rounded-md border bg-muted/30">
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
        </CardContent>
      </Card>

      {/* Enhanced Deploy Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Deploy Instructions
          </CardTitle>
          <CardDescription>
            Choose your preferred deployment method
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const commands = deploymentOptions.find(opt => opt.id === selectedDeployment)?.commands.join('\n') || '';
                        navigator.clipboard.writeText(commands);
                      }}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy Commands
                    </Button>
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
        </CardContent>
      </Card>

      <Separator />

      {/* Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex gap-2 sm:flex-row sm:gap-2">
          <Button variant="outline" size="sm" onClick={onBackToHome} className="flex-1 h-8 sm:h-9">
            <Home className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Home</span>
          </Button>
          <Button variant="outline" onClick={() => setStep("generate")} className="flex-1 h-8 sm:h-9">
            <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to Generate</span>
            <span className="sm:hidden">Generate</span>
          </Button>
        </div>
        <Button variant="outline" onClick={handleStartOver} className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm">
          <RotateCcw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Start Over</span>
          <span className="sm:hidden">Reset</span>
        </Button>
      </div>
    </div>
  );
}
