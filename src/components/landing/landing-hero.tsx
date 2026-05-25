"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LandingHeroProps {
  onGetStarted: () => void;
}

export function LandingHero({ onGetStarted }: LandingHeroProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-8 sm:space-y-16 py-4 sm:py-8">
      <section className="text-center space-y-3 sm:space-y-6 py-6 sm:py-12 px-3 overflow-x-hidden">
        <div className="mb-3 sm:mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-500 shadow-lg dark:shadow-orange-500/20 mx-auto">
            <img
              src={dark ? "/AWS-Dark.svg" : "/AWS-Light.svg"}
              alt="AWS Logo"
              className="h-12 sm:h-16 md:h-18 w-auto"
              suppressHydrationWarning
            />
          </div>
        </div>
        <Badge variant="secondary" className="text-xs px-3 py-1">
          Platform Engineering Tool
        </Badge>
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Design AWS Infrastructure
          <br />
          <span className="text-primary">Generate IaC Templates</span>
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
          Select AWS services, configure parameters, and instantly generate
          production-ready Terraform or CloudFormation templates. No manual
          coding required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 pt-3 sm:pt-4">
          <Button
            size="lg"
            onClick={onGetStarted}
            className="text-sm sm:text-base px-6 sm:px-8 h-10 sm:h-12 w-full sm:w-auto"
            id="get-started"
          >
            Get Started
            <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <a
            href="https://github.com/NotHarshhaa/aws-infra-generator"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="lg"
              className="text-sm sm:text-base px-6 sm:px-8 h-10 sm:h-12 w-full sm:w-auto"
            >
              View on GitHub
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
