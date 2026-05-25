import {
  Code,
  CloudCog,
  GitFork,
  Package,
  Server,
  Cloud,
  Zap,
  ShieldCheck,
  Github,
  ExternalLink,
  Verified,
} from "lucide-react";
import { LandingSection } from "./shared/landing-section";
import { landingStyles } from "./shared/landing-styles";
import { cn } from "@/lib/utils";

const CREATOR_TAGS = [
  { icon: CloudCog, label: "Cloud Engineer" },
  { icon: GitFork, label: "DevOps" },
  { icon: Package, label: "MLOps" },
  { icon: Server, label: "Platform Engineering" },
];

const CREATOR_FOCUS = [
  { icon: Cloud, label: "AWS Solutions" },
  { icon: Code, label: "Infrastructure as Code" },
  { icon: Zap, label: "Automation" },
  { icon: ShieldCheck, label: "Platform Engineering" },
];

export function CreatorSection() {
  return (
    <LandingSection
      id="creator"
      eyebrow="Creator"
      title="Meet the creator"
      description="Built by an engineer focused on cloud automation and developer experience."
    >
      <div className={cn(landingStyles.panelAccent, "max-w-4xl mx-auto overflow-hidden")}>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <img
                src="https://github.com/NotHarshhaa.png"
                alt="H A R S H H A A"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-orange-500/20 shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-md bg-orange-500 text-white border-2 border-background">
                <Code className="h-3 w-3" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">H A R S H H A A</h3>
                <Verified className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Development Platform & Automation Enthusiast
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {CREATOR_TAGS.map(({ icon: Icon, label }) => (
                  <span key={label} className={landingStyles.pill}>
                    <Icon className="h-3 w-3 text-orange-500" />
                    {label}
                  </span>
                ))}
              </div>

              <a
                href="https://github.com/NotHarshhaa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex pt-1"
              >
                <span className={cn(landingStyles.pillActive, "px-3 py-1.5")}>
                  <Github className="h-3.5 w-3.5" />
                  Follow on GitHub
                  <ExternalLink className="h-3 w-3 opacity-80" />
                </span>
              </a>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-orange-500/15 space-y-3">
            <p className="text-[11px] sm:text-sm text-muted-foreground leading-relaxed text-center sm:text-left">
              Passionate about scalable infrastructure and automation tools that simplify complex
              cloud management for engineering teams.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {CREATOR_FOCUS.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                  <Icon className="h-3 w-3 text-orange-500" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
