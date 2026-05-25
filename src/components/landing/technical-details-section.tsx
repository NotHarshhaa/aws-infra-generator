import { FileCode2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TERRAFORM_OUTPUTS = [
  "main.tf - Provider and core resources",
  "variables.tf - Input parameters",
  "outputs.tf - Resource references",
  "Service-specific .tf files",
];

const CLOUDFORMATION_OUTPUTS = [
  "template.json - Complete infrastructure",
  "Parameters - Configurable inputs",
  "Resources - All AWS components",
  "Outputs - Stack references",
];

export function TechnicalDetailsSection() {
  return (
    <section className="space-y-4 sm:space-y-6 px-3">
      <h2 className="text-xl sm:text-2xl font-bold text-center">What You Get</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode2 className="h-5 w-5" />
              Terraform Output
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {TERRAFORM_OUTPUTS.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode2 className="h-5 w-5" />
              CloudFormation Output
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {CLOUDFORMATION_OUTPUTS.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
