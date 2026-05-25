import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfiguratorActionsProps {
  isGenerating: boolean;
  onBackToHome: () => void;
  onBackToServices: () => void;
  onGenerate: () => void;
}

export function ConfiguratorActions({
  isGenerating,
  onBackToHome,
  onBackToServices,
  onGenerate,
}: ConfiguratorActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex gap-2 sm:flex-row sm:gap-2">
        <Button variant="outline" size="sm" onClick={onBackToHome} className="flex-1 h-8 sm:h-9">
          <Home className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Home</span>
        </Button>
        <Button variant="outline" onClick={onBackToServices} className="flex-1 h-8 sm:h-9">
          <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Back to Services</span>
          <span className="sm:hidden">Services</span>
        </Button>
      </div>
      <Button
        onClick={onGenerate}
        size="sm"
        className="w-full sm:w-auto h-8 sm:h-9"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2" />
            Generating...
          </>
        ) : (
          <>
            Generate
            <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
