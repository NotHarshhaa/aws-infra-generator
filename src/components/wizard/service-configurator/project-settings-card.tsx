import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AWS_REGIONS } from "@/lib/aws-services";
import { WizardPanel } from "@/components/wizard/shared";

interface ProjectSettingsCardProps {
  projectName: string;
  region: string;
  environment: "development" | "staging" | "production";
  outputFormat: "terraform" | "cloudformation";
  projectNameError?: string;
  onProjectNameChange: (name: string) => void;
  onRegionChange: (region: string) => void;
  onEnvironmentChange: (env: "development" | "staging" | "production") => void;
  onOutputFormatChange: (format: "terraform" | "cloudformation") => void;
}

export function ProjectSettingsCard({
  projectName,
  region,
  environment,
  outputFormat,
  projectNameError,
  onProjectNameChange,
  onRegionChange,
  onEnvironmentChange,
  onOutputFormatChange,
}: ProjectSettingsCardProps) {
  return (
    <WizardPanel title="Project Settings" description="Global config for your stack">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div className="space-y-1">
          <Label htmlFor="projectName" className="text-[11px] sm:text-xs">
            Project Name
          </Label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder="my-infra"
            className={`h-8 text-xs sm:text-sm bg-muted/30 ${projectNameError ? "border-red-500" : ""}`}
          />
          {projectNameError && <p className="text-[10px] text-red-500">{projectNameError}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="region" className="text-[11px] sm:text-xs">
            AWS Region
          </Label>
          <Select value={region} onValueChange={(v) => v && onRegionChange(v)}>
            <SelectTrigger id="region" className="h-8 text-xs sm:text-sm bg-muted/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AWS_REGIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="environment" className="text-[11px] sm:text-xs">
            Environment
          </Label>
          <Select
            value={environment}
            onValueChange={(v) =>
              v && onEnvironmentChange(v as "development" | "staging" | "production")
            }
          >
            <SelectTrigger id="environment" className="h-8 text-xs sm:text-sm bg-muted/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="format" className="text-[11px] sm:text-xs">
            Output Format
          </Label>
          <Select
            value={outputFormat}
            onValueChange={(v) =>
              v && onOutputFormatChange(v as "terraform" | "cloudformation")
            }
          >
            <SelectTrigger id="format" className="h-8 text-xs sm:text-sm bg-muted/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="terraform">Terraform</SelectItem>
              <SelectItem value="cloudformation">CloudFormation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </WizardPanel>
  );
}
