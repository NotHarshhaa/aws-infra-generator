"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useInfraStore } from "@/lib/store";

interface GenerationStaleBannerProps {
  className?: string;
}

export function GenerationStaleBanner({ className }: GenerationStaleBannerProps) {
  const { isGenerationStale, setStep } = useInfraStore();

  if (!isGenerationStale) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-sm">Configuration changed</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
        <span>
          Your settings changed after the last generation. Re-generate infrastructure before exporting.
        </span>
        <Button
          size="sm"
          variant="outline"
          className="h-8 shrink-0 border-destructive/40 bg-background/80 hover:bg-background"
          onClick={() => setStep("generate")}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Re-generate
        </Button>
      </AlertDescription>
    </Alert>
  );
}
