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
import Link from "next/link";
import { useInfraStore } from "@/lib/store";
import { downloadInfrastructure } from "@/lib/api";

interface InfraExportProps {
  onBackToHome: () => void;
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

  const handleCopy = async (content: string, fileName: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadInfrastructure({
        services: selectedServices,
        config: serviceConfig,
        environment,
        region,
        format: outputFormat,
        projectName,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName}-${outputFormat}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Error handled silently - download failure
    } finally {
      setIsDownloading(false);
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
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold">Export Infrastructure</h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
          Download your generated infrastructure templates and deploy them.
        </p>
      </div>

      {/* Download Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileArchive className="h-4 w-4 sm:h-5 sm:w-5" />
            Download Package
          </CardTitle>
          <CardDescription>
            Download all generated files as a ZIP archive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="font-medium">
                {projectName}-{outputFormat}.zip
              </p>
              <p className="text-sm text-muted-foreground">
                {generatedFiles.length} files &bull;{" "}
                {outputFormat === "terraform" ? "Terraform" : "CloudFormation"}{" "}
                &bull; {environment}
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download ZIP"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode2 className="h-5 w-5" />
            Generated Files
          </CardTitle>
          <CardDescription>
            Preview and copy individual files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={generatedFiles[0]?.name || ""}
          >
            <TabsList className="flex-wrap h-auto gap-1">
              {generatedFiles.map((file) => (
                <TabsTrigger key={file.name} value={file.name} className="text-xs">
                  {file.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {generatedFiles.map((file) => (
              <TabsContent key={file.name} value={file.name}>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => handleCopy(file.content, file.name)}
                  >
                    {copiedFile === file.name ? (
                      <>
                        <Check className="mr-1 h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                  <ScrollArea className="h-[350px] w-full rounded-md border bg-muted/30">
                    <pre className="p-4 text-sm">
                      <code>{file.content}</code>
                    </pre>
                  </ScrollArea>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {file.path}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {file.language}
                  </Badge>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Deploy Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Deploy Instructions
          </CardTitle>
          <CardDescription>
            Run these commands to deploy your infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 border p-4 space-y-2">
            {deployCommands.map((cmd, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-muted-foreground select-none">$</span>
                <code className="text-sm font-mono">{cmd}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={onBackToHome}>
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button variant="outline" onClick={() => setStep("generate")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Generate
          </Button>
        </div>
        <Button variant="outline" onClick={handleStartOver} className="w-full sm:w-auto">
          <RotateCcw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </div>
    </div>
  );
}
