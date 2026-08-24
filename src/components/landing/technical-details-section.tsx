import { FileCode2, CheckCircle2, GitBranch, Terminal, Shield, Layers } from "lucide-react";
import { LandingSection } from "./shared/landing-section";
import { landingStyles } from "./shared/landing-styles";
import { cn } from "@/lib/utils";

const TERRAFORM_OUTPUTS = [
  "main.tf — provider & core resources",
  "variables.tf & outputs.tf — parameters",
  "Service-specific modular .tf configs",
  "Full remote state backend support",
];

const CLOUDFORMATION_OUTPUTS = [
  "template.json — complete infrastructure",
  "Parameters & Mappings configurations",
  "Resources with intrinsic Fn dependencies",
  "Outputs with export stack values",
];

const CDK_OUTPUTS = [
  "stack.ts — typed L2/L3 CDK constructs",
  "app.ts & cdk.json — CDK entrypoint",
  "package.json — pinned aws-cdk-lib deps",
  "Zero boilerplate TypeScript synthesis",
];

const CICD_TOOLING_OUTPUTS = [
  ".github/workflows/deploy.yml (OIDC Auth)",
  ".gitlab-ci.yml & buildspec.yml pipelines",
  "Makefile (init, plan, apply, destroy)",
  "deploy.sh interactive deployment script",
];

export function TechnicalDetailsSection() {
  return (
    <LandingSection
      eyebrow="Deliverables"
      title="Production-Grade Outputs & Artifacts"
      description="Everything your platform engineering and DevOps teams need to audit, test, and deploy seamlessly."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {[
          { title: "Terraform HCL", icon: FileCode2, items: TERRAFORM_OUTPUTS },
          { title: "AWS CloudFormation", icon: Layers, items: CLOUDFORMATION_OUTPUTS },
          { title: "AWS CDK TypeScript", icon: Terminal, items: CDK_OUTPUTS },
          { title: "CI/CD & Scripts", icon: GitBranch, items: CICD_TOOLING_OUTPUTS },
        ].map((block) => (
          <div key={block.title} className="rounded-3xl border border-border/80 bg-card/85 p-5 shadow-xs transition-all hover:border-orange-500/40">
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <block.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground tracking-tight">{block.title}</h3>
            </div>
            <ul className="space-y-2">
              {block.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-orange-500" />
                  <span className="font-mono text-muted-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={cn(landingStyles.codeBlock, "mt-4 max-w-6xl mx-auto p-4 rounded-3xl")}>
        <code className="text-xs leading-relaxed font-mono">
          <span className="text-orange-400">$ </span>
          make plan && make apply
          <br />
          <span className="text-emerald-400">✓ Security Audit Passed (SOC 2, HIPAA, PCI-DSS compliant)</span>
          <br />
          <span className="text-emerald-400">✓ Graviton optimization applied (-20% compute cost savings)</span>
        </code>
      </div>
    </LandingSection>
  );
}
