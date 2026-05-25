import { Github, Heart } from "lucide-react";
import { landingStyles } from "./shared/landing-styles";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "Services", href: "#services" },
  { label: "Creator", href: "#creator" },
];

export function LandingFooter() {
  return (
    <footer className={cn(landingStyles.panel, "mt-4 overflow-hidden")}>
      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">AWS Infra Generator</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
              Open-source infrastructure as code generator
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[11px] sm:text-xs text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://github.com/NotHarshhaa/aws-infra-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
          </nav>
        </div>

        <div className="mt-4 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-muted-foreground">
          <p>Built with Next.js, Tailwind CSS, and FastAPI</p>
          <p className="inline-flex items-center gap-1">
            MIT License · Made with <Heart className="h-3 w-3 text-orange-500" /> for DevOps
          </p>
        </div>
      </div>
    </footer>
  );
}
