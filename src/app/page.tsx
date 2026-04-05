"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/header";
import { StepIndicator } from "@/components/step-indicator";
import { ServiceSelector } from "@/components/service-selector";
import { ServiceConfigurator } from "@/components/service-configurator";
import { InfraGenerator } from "@/components/infra-generator";
import { InfraExport } from "@/components/infra-export";
import { PresetTemplates } from "@/components/preset-templates";
import { ScrollToTop } from "@/components/scroll-to-top";
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
  Globe,
  MessageSquare,
  Bell,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


function LandingHero({ onGetStarted }: { onGetStarted: () => void }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setDark(isDark);
    };

    checkTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-12 sm:space-y-16 py-6 sm:py-8">
      {/* Hero */}
      <section className="text-center space-y-4 sm:space-y-6 py-8 sm:py-12 px-3 overflow-x-hidden">
        <div className="mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-500 shadow-lg dark:shadow-orange-500/20 mx-auto">
            <img 
              src={dark ? "/AWS-Dark.svg" : "/AWS-Light.svg"} 
              alt="AWS Logo" 
              className="h-14 sm:h-16 md:h-18 w-auto"
            />
          </div>
        </div>
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
          <Button size="lg" onClick={onGetStarted} className="text-base px-8 h-12 w-full sm:w-auto" id="get-started">
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
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-3" id="features">
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

      
      {/* How It Works */}
      <section className="space-y-8 px-3 py-8 sm:py-12">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            Process
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            Generate production-ready AWS infrastructure in three simple steps
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                step: "1",
                title: "Select Services",
                desc: "Choose the AWS services you need from our comprehensive catalog. Dependencies are automatically resolved and included.",
                icon: Server,
                features: ["20+ AWS Services", "Visual Selection", "Auto Dependencies"],
              },
              {
                step: "2", 
                title: "Configure & Generate",
                desc: "Set regions, instance types, and other parameters with our intuitive interface. Generate clean, production-ready IaC templates.",
                icon: Code,
                features: ["Best Practices", "Security Configs", "Multiple Formats"],
              },
              {
                step: "3",
                title: "Export & Deploy", 
                desc: "Download as ZIP, copy files, and deploy with terraform apply or CloudFormation. Get your infrastructure running in minutes.",
                icon: Package,
                features: ["Terraform & CloudFormation", "Ready to Deploy", "Documentation"],
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connection Line */}
                {index < 2 && (
                  <div className="hidden lg:block absolute top-8 left-full w-8 h-0.5 bg-border -translate-y-1/2"></div>
                )}
                
                <Card className="relative overflow-hidden border hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 space-y-3">
                    {/* Step Number */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                        {item.step}
                      </div>
                      <div className="flex-shrink-0">
                        <item.icon className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-1">
                      {item.features.map((feature, fidx) => (
                        <div key={fidx} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent rounded-full border">
              <Zap className="h-5 w-5" />
              <span className="text-base font-semibold">Ready in Minutes, Not Hours</span>
            </div>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
              Skip the manual IaC writing and avoid common configuration mistakes. Our templates follow AWS best practices and include proper security configurations.
            </p>
          </div>
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
      </div>
  );
}

export default function Home() {
  const { currentStep, setStep, selectedServices, generatedFiles, reset, selectedTemplate } =
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

  const handleTemplateSelect = () => {
    setShowWizard(true);
    setStep("configure");
  };

  useEffect(() => {
    const handleOpenWizard = () => {
      setShowWizard(true);
      setStep("services");
    };

    window.addEventListener('open-wizard', handleOpenWizard);
    return () => window.removeEventListener('open-wizard', handleOpenWizard);
  }, []);

  const handleBackToHome = () => {
    setShowWizard(false);
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header onBackToHome={handleBackToHome} />
      <main className="flex-1 container mx-auto px-3 sm:px-4 pb-8 sm:pb-12 overflow-x-hidden">
        {!showWizard ? (
          <>
            <LandingHero onGetStarted={handleGetStarted} />
            {/* Preset Templates */}
            <section className="space-y-6 px-3" id="templates">
              <PresetTemplates onTemplateSelect={handleTemplateSelect} />
            </section>
            {/* Supported Services Section */}
            <section className="space-y-8 px-3 py-8 sm:py-12 overflow-x-hidden" id="services">
              <div className="text-center space-y-4">
                <Badge variant="secondary" className="text-sm px-4 py-1">
                  Services
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold">Supported AWS Services</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
                  Generate infrastructure for 20+ AWS services with comprehensive configuration options and best practices
                </p>
              </div>

              <div className="max-w-7xl mx-auto">
                {/* Services Overview Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                  {[
                    { icon: Server, name: "EC2", category: "compute", count: 4 },
                    { icon: Zap, name: "Lambda", category: "compute", count: 8 },
                    { icon: Package, name: "ECS", category: "compute", count: 6 },
                    { icon: Package, name: "EKS", category: "compute", count: 5 },
                    { icon: HardDrive, name: "S3", category: "storage", count: 4 },
                    { icon: HardDrive, name: "EFS", category: "storage", count: 6 },
                    { icon: Database, name: "RDS", category: "database", count: 7 },
                    { icon: Database, name: "DynamoDB", category: "database", count: 6 },
                    { icon: Database, name: "ElastiCache", category: "database", count: 6 },
                    { icon: Network, name: "VPC", category: "networking", count: 5 },
                    { icon: GitFork, name: "ALB", category: "networking", count: 4 },
                    { icon: Globe, name: "API Gateway", category: "networking", count: 7 },
                    { icon: Cloud, name: "CloudFront", category: "networking", count: 4 },
                    { icon: Globe, name: "Route 53", category: "networking", count: 6 },
                    { icon: ShieldCheck, name: "IAM", category: "security", count: 4 },
                    { icon: MessageSquare, name: "SQS", category: "messaging", count: 7 },
                    { icon: Bell, name: "SNS", category: "messaging", count: 6 },
                    { icon: Activity, name: "CloudWatch", category: "management", count: 4 },
                  ].map((service, idx) => (
                    <div key={idx} className="group relative">
                      <div className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md hover:border-primary/30">
                        <div className="flex-shrink-0">
                          <service.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{service.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{service.category}</div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Categories */}
                <div className="space-y-10">
                  {/* Compute Services */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-bold">Compute Services</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">4 Services</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { icon: Server, name: "EC2", desc: "Scalable virtual servers", features: ["Multiple instance types", "Auto Scaling", "Load Balancing"] },
                        { icon: Zap, name: "Lambda", desc: "Serverless computing", features: ["Multiple runtimes", "Event-driven", "Pay per use"] },
                        { icon: Package, name: "ECS", desc: "Container orchestration", features: ["Docker support", "Fargate", "Task definitions"] },
                        { icon: Package, name: "EKS", desc: "Managed Kubernetes", features: ["Managed control plane", "Auto-updates", "Integration"] },
                      ].map((service, idx) => (
                        <Card key={idx} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <service.icon className="h-10 w-10 text-primary flex-shrink-0" />
                              <div>
                                <div className="font-bold text-lg">{service.name}</div>
                                <div className="text-sm text-muted-foreground">{service.desc}</div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              {service.features.map((feature, fidx) => (
                                <div key={fidx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Storage Services */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-bold">Storage Services</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">2 Services</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { icon: HardDrive, name: "S3", desc: "Object storage service", features: ["Versioning", "Encryption", "Lifecycle policies"] },
                        { icon: HardDrive, name: "EFS", desc: "File system for EC2", features: ["Shared storage", "High availability", "Performance modes"] },
                      ].map((service, idx) => (
                        <Card key={idx} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <service.icon className="h-10 w-10 text-primary flex-shrink-0" />
                              <div>
                                <div className="font-bold text-lg">{service.name}</div>
                                <div className="text-sm text-muted-foreground">{service.desc}</div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              {service.features.map((feature, fidx) => (
                                <div key={fidx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Database Services */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-bold">Database Services</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">3 Services</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { icon: Database, name: "RDS", desc: "Managed relational databases", features: ["Multiple engines", "Backups", "High availability"] },
                        { icon: Database, name: "DynamoDB", desc: "NoSQL database service", features: ["Auto-scaling", "Global tables", "Streams"] },
                        { icon: Database, name: "ElastiCache", desc: "In-memory caching", features: ["Redis/Memcached", "Clustering", "High performance"] },
                      ].map((service, idx) => (
                        <Card key={idx} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <service.icon className="h-10 w-10 text-primary flex-shrink-0" />
                              <div>
                                <div className="font-bold text-lg">{service.name}</div>
                                <div className="text-sm text-muted-foreground">{service.desc}</div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              {service.features.map((feature, fidx) => (
                                <div key={fidx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Networking Services */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <Network className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-bold">Networking Services</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">5 Services</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { icon: Network, name: "VPC", desc: "Virtual Private Cloud", features: ["Isolated networks", "Subnets", "Route tables"] },
                        { icon: GitFork, name: "ALB", desc: "Application Load Balancer", features: ["Health checks", "SSL termination", "Path routing"] },
                        { icon: Globe, name: "API Gateway", desc: "API management", features: ["REST/HTTP APIs", "CORS support", "Throttling"] },
                        { icon: Cloud, name: "CloudFront", desc: "Content delivery network", features: ["CDN", "Edge locations", "Security"] },
                        { icon: Globe, name: "Route 53", desc: "DNS service", features: ["Domain registration", "Health checks", "Routing policies"] },
                      ].map((service, idx) => (
                        <Card key={idx} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <service.icon className="h-10 w-10 text-primary flex-shrink-0" />
                              <div>
                                <div className="font-bold text-lg">{service.name}</div>
                                <div className="text-sm text-muted-foreground">{service.desc}</div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              {service.features.map((feature, fidx) => (
                                <div key={fidx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Security & Other Services */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Security Services */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-bold">Security</h3>
                        </div>
                        <Badge variant="outline" className="text-xs">1 Service</Badge>
                      </div>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="h-10 w-10 text-primary flex-shrink-0" />
                            <div>
                              <div className="font-bold text-lg">IAM</div>
                              <div className="text-sm text-muted-foreground">Access management service</div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {["Roles & policies", "Fine-grained access", "Multi-factor auth"].map((feature, fidx) => (
                              <div key={fidx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Messaging Services */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-bold">Messaging</h3>
                        </div>
                        <Badge variant="outline" className="text-xs">2 Services</Badge>
                      </div>
                      <div className="space-y-3">
                        {[
                          { icon: MessageSquare, name: "SQS", desc: "Message queue service", features: ["Standard/FIFO", "Dead letter queues"] },
                          { icon: Bell, name: "SNS", desc: "Pub/sub messaging", features: ["Topics", "Multi-protocol", "Fan-out"] },
                        ].map((service, idx) => (
                          <Card key={idx} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-center gap-3">
                                <service.icon className="h-8 w-8 text-primary flex-shrink-0" />
                                <div>
                                  <div className="font-bold">{service.name}</div>
                                  <div className="text-xs text-muted-foreground">{service.desc}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {service.features.map((feature, fidx) => (
                                  <Badge key={fidx} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Management Services */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold">Management & Monitoring</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">1 Service</Badge>
                    </div>
                    <Card className="hover:shadow-lg transition-shadow max-w-md">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <Activity className="h-10 w-10 text-primary flex-shrink-0" />
                          <div>
                            <div className="font-bold text-lg">CloudWatch</div>
                            <div className="text-sm text-muted-foreground">Monitoring and observability</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {["Metrics", "Logs", "Alarms", "Dashboards"].map((feature, fidx) => (
                            <div key={fidx} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Service Count Summary */}
                <div className="mt-12 text-center">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="text-base font-semibold text-primary">20+ AWS Services Across 7 Categories</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Production-ready templates with best practices, security configurations, and comprehensive documentation
                  </p>
                </div>
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
          </>
        ) : (
          <>
            <StepIndicator
              currentStep={currentStep}
              onStepClick={setStep}
              completedSteps={completedSteps}
            />
            <div className="max-w-7xl mx-auto px-1 sm:px-0">
              {currentStep === "services" && <ServiceSelector onBackToHome={handleBackToHome} />}
              {currentStep === "configure" && <ServiceConfigurator onBackToHome={handleBackToHome} />}
              {currentStep === "generate" && <InfraGenerator onBackToHome={handleBackToHome} />}
              {currentStep === "export" && <InfraExport onBackToHome={handleBackToHome} />}
            </div>
          </>
        )}
      </main>
      <ScrollToTop />
    </div>
  );
}

