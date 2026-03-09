"use client";

import { useState } from "react";
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
import Link from "next/link";
import { useInfraStore } from "@/lib/store";
import { generateInfrastructure, validateInfrastructure } from "@/lib/api";
import { getServiceById } from "@/lib/aws-services";

interface InfraGeneratorProps {
  onBackToHome: () => void;
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

  const handleValidate = async () => {
    setError(null);
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
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 300);

    try {
      const result = await generateInfrastructure({
        services: selectedServices,
        config: serviceConfig,
        environment,
        region,
        format: outputFormat,
        projectName,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setGeneratedFiles(result.files);
      setValidationResult(result.validation);

      if (result.files.length > 0) {
        setActiveFileTab(result.files[0].name);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(
        err instanceof Error ? err.message : "Generation failed"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Generate Infrastructure</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Validate and generate your infrastructure templates.
        </p>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Infrastructure Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Project</p>
              <p className="font-semibold">{projectName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Region</p>
              <p className="font-semibold">{region}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Environment</p>
              <Badge variant="secondary">{environment}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Format</p>
              <Badge>{outputFormat}</Badge>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Selected Services</p>
            <div className="flex flex-wrap gap-2">
              {selectedServices.map((sid) => {
                const service = getServiceById(sid);
                return (
                  <Badge key={sid} variant="outline">
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.valid ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              Validation Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {validationResult.errors.map((err, i) => (
              <Alert key={i} variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>{err.service}</AlertTitle>
                <AlertDescription>{err.message}</AlertDescription>
              </Alert>
            ))}
            {validationResult.warnings.map((warn, i) => (
              <Alert key={i}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{warn.service}</AlertTitle>
                <AlertDescription>{warn.message}</AlertDescription>
              </Alert>
            ))}
            {validationResult.valid &&
              validationResult.errors.length === 0 && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle>All checks passed</AlertTitle>
                  <AlertDescription>
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
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Progress */}
      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm font-medium">
                  Generating infrastructure templates...
                </p>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Files */}
      {generatedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode2 className="h-5 w-5" />
              Generated Files
            </CardTitle>
            <CardDescription>
              {generatedFiles.length} file
              {generatedFiles.length !== 1 ? "s" : ""} generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeFileTab}
              onValueChange={setActiveFileTab}
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
                  <ScrollArea className="h-[400px] w-full rounded-md border">
                    <pre className="p-4 text-sm">
                      <code>{file.content}</code>
                    </pre>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBackToHome}>
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button variant="outline" onClick={() => setStep("configure")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Configure
          </Button>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={isGenerating}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Validate
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="lg"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileCode2 className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
          {generatedFiles.length > 0 && (
            <Button onClick={() => setStep("export")} size="lg">
              Export
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
