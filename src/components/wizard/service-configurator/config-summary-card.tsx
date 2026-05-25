import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ConfigSummaryCardProps {
  serviceCount: number;
  environment: string;
  region: string;
  hasErrors: boolean;
}

export function ConfigSummaryCard({
  serviceCount,
  environment,
  region,
  hasErrors,
}: ConfigSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-6">
        <CardTitle className="text-sm sm:text-lg">Configuration Summary</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Overview of your infrastructure configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50">
            <div className="text-xl sm:text-2xl font-bold text-primary">{serviceCount}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Services</div>
          </div>
          <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50">
            <div className="text-xl sm:text-2xl font-bold text-primary">{environment}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Environment</div>
          </div>
          <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50">
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {region.split("-")[1]?.toUpperCase() || region}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Region</div>
          </div>
        </div>
        {hasErrors && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs sm:text-sm text-red-700">
              Please fix validation errors before generating infrastructure
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
