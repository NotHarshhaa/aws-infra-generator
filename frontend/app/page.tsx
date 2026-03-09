"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { StepIndicator } from "@/components/step-indicator";
import { ServiceSelector } from "@/components/service-selector";
import { ServiceConfigurator } from "@/components/service-configurator";
import { InfraGenerator } from "@/components/infra-generator";
import { InfraExport } from "@/components/infra-export";
import { useInfraStore } from "@/lib/store";
import { WizardStep } from "@/lib/types";
import {
  Cloud,
  Zap,
  ShieldCheck,
  Package,
  ArrowRight,
  Server,
  Database,
  Network,
  HardDrive,
  GitFork,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function LandingHero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="text-center space-y-6 py-12">
        <Badge variant="secondary" className="text-sm px-4 py-1">
          Platform Engineering Tool
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Design AWS Infrastructure
          <br />
          <span className="text-primary">Generate IaC Templates</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Select AWS services, configure parameters, and instantly generate
          production-ready Terraform or CloudFormation templates. No manual
          coding required.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button size="lg" onClick={onGetStarted} className="text-base px-8 h-12">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <a
            href="https://github.com/NotHarshhaa/aws-infra-generator"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="text-base px-8 h-12">
              View on GitHub
            </Button>
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Cloud,
            title: "Service Selection",
            desc: "Choose from VPC, EC2, S3, RDS, ALB, IAM and more AWS services",
          },
          {
            icon: Zap,
            title: "Auto Dependencies",
            desc: "Service dependencies are automatically resolved and included",
          },
          {
            icon: ShieldCheck,
            title: "Validation",
            desc: "Infrastructure is validated for conflicts and missing resources",
          },
          {
            icon: Package,
            title: "Export & Deploy",
            desc: "Download Terraform or CloudFormation templates as a ZIP archive",
          },
        ].map((feature) => (
          <Card key={feature.title} className="text-center">
            <CardContent className="pt-6 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Supported Services */}
      <section className="text-center space-y-6">
        <h2 className="text-2xl font-bold">Supported AWS Services</h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            { icon: Network, name: "VPC" },
            { icon: Server, name: "EC2" },
            { icon: HardDrive, name: "S3" },
            { icon: Database, name: "RDS" },
            { icon: GitFork, name: "ALB" },
            { icon: ShieldCheck, name: "IAM" },
          ].map((svc) => (
            <div
              key={svc.name}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
            >
              <svc.icon className="h-4 w-4 text-primary" />
              {svc.name}
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Select Services",
              desc: "Choose the AWS services you need. Dependencies are auto-resolved.",
            },
            {
              step: "2",
              title: "Configure & Generate",
              desc: "Set regions, instance types, and other parameters. Generate IaC templates.",
            },
            {
              step: "3",
              title: "Export & Deploy",
              desc: "Download as ZIP, copy files, and deploy with terraform apply or CloudFormation.",
            },
          ].map((item) => (
            <Card key={item.step}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Environments */}
      <section className="text-center space-y-6">
        <h2 className="text-2xl font-bold">Multi-Environment Support</h2>
        <p className="text-muted-foreground">
          Generate infrastructure for any stage of your deployment pipeline
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="text-sm px-4 py-2">
            Development
          </Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="text-sm px-4 py-2">
            Staging
          </Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge className="text-sm px-4 py-2">Production</Badge>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground border-t pt-8">
        <p>
          Built with Next.js, Tailwind CSS, and FastAPI &bull;{" "}
          <a
            href="https://github.com/NotHarshhaa/aws-infra-generator"
            className="underline underline-offset-4 hover:text-foreground"
          >
            GitHub
          </a>{" "}
          &bull; MIT License
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  const { currentStep, setStep, selectedServices, generatedFiles } =
    useInfraStore();
  const [showWizard, setShowWizard] = useState(false);

  const completedSteps = useMemo(() => {
    const steps: WizardStep[] = [];
    if (selectedServices.length > 0) steps.push("services");
    if (currentStep === "generate" || currentStep === "export")
      steps.push("configure");
    if (generatedFiles.length > 0) steps.push("generate");
    if (currentStep === "export") steps.push("export");
    return steps;
  }, [selectedServices, currentStep, generatedFiles]);

  const handleGetStarted = () => {
    setShowWizard(true);
    setStep("services");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 pb-12">
        {!showWizard ? (
          <LandingHero onGetStarted={handleGetStarted} />
        ) : (
          <>
            <StepIndicator
              currentStep={currentStep}
              onStepClick={setStep}
              completedSteps={completedSteps}
            />
            <div className="max-w-5xl mx-auto">
              {currentStep === "services" && <ServiceSelector />}
              {currentStep === "configure" && <ServiceConfigurator />}
              {currentStep === "generate" && <InfraGenerator />}
              {currentStep === "export" && <InfraExport />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

