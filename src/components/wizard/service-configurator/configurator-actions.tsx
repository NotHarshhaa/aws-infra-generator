import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardActionBar } from "@/components/wizard/shared";

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
    <WizardActionBar>
      <div className="flex gap-2 flex-1 sm:flex-none">
        <Button variant="outline" size="sm" onClick={onBackToHome} className="h-8 flex-1 sm:h-9 text-xs">
          <Home className="mr-1 h-3 w-3" />
          Home
        </Button>
        <Button variant="outline" size="sm" onClick={onBackToServices} className="h-8 flex-1 sm:h-9 text-xs">
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back
        </Button>
      </div>
      <Button
        onClick={onGenerate}
        size="sm"
        disabled={isGenerating}
        className="h-8 w-full sm:w-auto sm:h-9 text-xs bg-orange-500 hover:bg-orange-600 text-white"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5" />
            Generating...
          </>
        ) : (
          <>
            Generate
            <ArrowRight className="ml-1.5 h-3 w-3" />
          </>
        )}
      </Button>
    </WizardActionBar>
  );
}
