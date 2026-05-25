import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader className="pb-2 sm:pb-6">
        <CardTitle className="text-sm sm:text-lg">Project Settings</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          General settings for your infrastructure project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="projectName" className="text-xs sm:text-sm">
              Project Name
            </Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              placeholder="my-infra"
              className={`h-8 sm:h-10 text-sm ${projectNameError ? "border-red-500" : ""}`}
            />
            {projectNameError && (
              <p className="text-xs text-red-500">{projectNameError}</p>
            )}
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="region" className="text-xs sm:text-sm">
              AWS Region
            </Label>
            <Select value={region} onValueChange={(v) => v && onRegionChange(v)}>
              <SelectTrigger id="region" className="h-8 sm:h-10 text-sm">
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
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="environment" className="text-xs sm:text-sm">
              Environment
            </Label>
            <Select
              value={environment}
              onValueChange={(v) =>
                v && onEnvironmentChange(v as "development" | "staging" | "production")
              }
            >
              <SelectTrigger id="environment" className="h-8 sm:h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="format" className="text-xs sm:text-sm">
              Output Format
            </Label>
            <Select
              value={outputFormat}
              onValueChange={(v) =>
                v && onOutputFormatChange(v as "terraform" | "cloudformation")
              }
            >
              <SelectTrigger id="format" className="h-8 sm:h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="terraform">Terraform</SelectItem>
                <SelectItem value="cloudformation">CloudFormation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
