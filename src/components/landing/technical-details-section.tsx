import { FileCode2, CheckCircle2 } from "lucide-react";
import { LandingSection } from "./shared/landing-section";
import { landingStyles } from "./shared/landing-styles";
import { cn } from "@/lib/utils";

const TERRAFORM_OUTPUTS = [
  "main.tf — provider and core resources",
  "variables.tf — input parameters",
  "outputs.tf — resource references",
  "Service-specific .tf files",
];

const CLOUDFORMATION_OUTPUTS = [
  "template.json — complete infrastructure",
  "Parameters — configurable inputs",
  "Resources — all AWS components",
  "Outputs — stack references",
];

export function TechnicalDetailsSection() {
  return (
    <LandingSection
      eyebrow="Output"
      title="What you get"
      description="Clean, readable IaC artifacts ready for review, CI, and deployment."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-5xl mx-auto">
        {[
          { title: "Terraform output", items: TERRAFORM_OUTPUTS },
          { title: "CloudFormation output", items: CLOUDFORMATION_OUTPUTS },
        ].map((block) => (
          <div key={block.title} className={landingStyles.card}>
            <div className="flex items-center gap-2 mb-3">
              <div className={landingStyles.iconBox}>
                <FileCode2 className="h-4 w-4" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold">{block.title}</h3>
            </div>
            <ul className="space-y-2">
              {block.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[11px] sm:text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-orange-500" />
                  <span className="font-mono text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={cn(landingStyles.codeBlock, "mt-4 max-w-5xl mx-auto p-3 sm:p-4")}>
        <code className="text-[10px] sm:text-xs leading-relaxed">
          <span className="text-orange-400">$ </span>
          terraform init && terraform plan
          <br />
          <span className="text-green-400/90">✓ Plan: 12 to add, 0 to change, 0 to destroy</span>
        </code>
      </div>
    </LandingSection>
  );
}
