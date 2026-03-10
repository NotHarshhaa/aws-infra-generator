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
  CheckCircle2,
  FileCode2,
  Github,
  ExternalLink,
  Code,
  CloudCog,
  Verified,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function LandingHero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="space-y-12 sm:space-y-16 py-6 sm:py-8">
      {/* Hero */}
      <section className="text-center space-y-4 sm:space-y-6 py-8 sm:py-12 px-3">
        <Badge variant="secondary" className="text-sm px-4 py-1">
          Platform Engineering Tool
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Design AWS Infrastructure
          <br />
          <span className="text-primary">Generate IaC Templates</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
          Select AWS services, configure parameters, and instantly generate
          production-ready Terraform or CloudFormation templates. No manual
          coding required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
          <Button size="lg" onClick={onGetStarted} className="text-base px-8 h-12 w-full sm:w-auto">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <a
            href="https://github.com/NotHarshhaa/aws-infra-generator"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="text-base px-8 h-12 w-full sm:w-auto">
              View on GitHub
            </Button>
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-3">
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
            <CardContent className="pt-4 sm:pt-6 space-y-2 sm:space-y-3">
              <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Supported Services */}
      <section className="text-center space-y-6 px-3">
        <h2 className="text-2xl font-bold">Supported AWS Services</h2>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
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
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium"
            >
              <svc.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              {svc.name}
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="space-y-6 px-3">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
              <CardContent className="pt-4 sm:pt-6 space-y-2 sm:space-y-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm sm:text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-sm sm:text-lg">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
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

      {/* Use Cases */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Perfect For</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Server,
              title: "DevOps Engineers",
              desc: "Quickly prototype and deploy infrastructure without manual IaC writing",
            },
            {
              icon: ShieldCheck,
              title: "Platform Teams",
              desc: "Build internal tools and standardized infrastructure patterns",
            },
            {
              icon: Database,
              title: "Developers",
              desc: "Learn cloud architecture and generate proper infrastructure for applications",
            },
            {
              icon: Zap,
              title: "Startups",
              desc: "Rapidly set up production-ready infrastructure without DevOps expertise",
            },
            {
              icon: Package,
              title: "Consultants",
              desc: "Generate consistent infrastructure templates for client projects",
            },
            {
              icon: Network,
              title: "Educators",
              desc: "Teach cloud concepts with practical, hands-on infrastructure examples",
            },
          ].map((useCase, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-4 sm:pt-6 space-y-2 sm:space-y-3">
                <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <useCase.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold">{useCase.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{useCase.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="space-y-4 sm:space-y-6 px-3">
        <h2 className="text-xl sm:text-2xl font-bold text-center">Why Choose AWS Infra Generator?</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              Save Time & Reduce Errors
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Eliminate manual IaC writing and avoid common configuration mistakes. Our templates follow AWS best practices and include proper security configurations.
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              Learn Cloud Architecture
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Understand how AWS services connect and depend on each other. Visualize relationships and learn proper infrastructure patterns.
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              Consistent Standards
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Generate standardized infrastructure across teams and projects. Ensure naming conventions, tagging, and security policies are consistent.
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              Multi-Format Support
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Choose between Terraform and CloudFormation based on your team's preferences. Export clean, readable, and production-ready code.
            </p>
          </div>
        </div>
      </section>

      {/* Technical Details */}
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
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">main.tf - Provider and core resources</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">variables.tf - Input parameters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">outputs.tf - Resource references</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Service-specific .tf files</span>
                </div>
              </div>
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
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">template.json - Complete infrastructure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Parameters - Configurable inputs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Resources - All AWS components</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Outputs - Stack references</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Creator Section */}
      <section className="space-y-6 px-3 py-8 sm:py-12">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            Creator
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold">Meet the Creator</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built by a passionate engineer focused on cloud automation and platform engineering
          </p>
        </div>

        <Card className="max-w-4xl mx-auto border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src="https://github.com/NotHarshhaa.png"
                    alt="H A R S H H A A"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg border-2 border-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                    <Code className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                      H A R S H H A A
                    </h3>
                    <Verified className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Development Platform & Automation Enthusiast
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Badge variant="outline" className="text-xs">
                    <CloudCog className="w-3 h-3 mr-1" />
                    Cloud Engineer
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <GitFork className="w-3 h-3 mr-1" />
                    DevOps
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Package className="w-3 h-3 mr-1" />
                    MLops
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Server className="w-3 h-3 mr-1" />
                    Platform Engineering
                  </Badge>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                  <a
                    href="https://github.com/NotHarshhaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>Follow on GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed text-center">
                Passionate about building scalable infrastructure solutions and automation tools. 
                Specializing in cloud architecture, DevOps practices, and platform engineering with 
                a focus on creating developer-friendly tools that simplify complex infrastructure management.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  <span>AWS Solutions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  <span>Infrastructure as Code</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Automation</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Platform Engineering</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
  const { currentStep, setStep, selectedServices, generatedFiles, reset } =
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

  const handleBackToHome = () => {
    setShowWizard(false);
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
        {!showWizard ? (
          <LandingHero onGetStarted={handleGetStarted} />
        ) : (
          <>
            <StepIndicator
              currentStep={currentStep}
              onStepClick={setStep}
              completedSteps={completedSteps}
            />
            <div className="max-w-5xl mx-auto px-1 sm:px-0">
              {currentStep === "services" && <ServiceSelector onBackToHome={handleBackToHome} />}
              {currentStep === "configure" && <ServiceConfigurator onBackToHome={handleBackToHome} />}
              {currentStep === "generate" && <InfraGenerator onBackToHome={handleBackToHome} />}
              {currentStep === "export" && <InfraExport onBackToHome={handleBackToHome} />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

