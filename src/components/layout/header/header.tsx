"use client";

import {
  Github,
  ExternalLink,
  Sparkles,
  Package,
  Server,
  Menu,
  X,
  User,
  ArrowRight,
  Home,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "../theme-toggle";
import { landingStyles } from "@/components/landing/shared/landing-styles";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onBackToHome?: () => void;
  showNav?: boolean;
  onGetStarted?: () => void;
}

const NAV_ITEMS: {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  { id: "features", label: "Features", description: "Explore capabilities", icon: Sparkles },
  { id: "templates", label: "Templates", description: "Preset stacks", icon: Package },
  { id: "services", label: "Services", description: "AWS catalog", icon: Server },
  { id: "creator", label: "Creator", description: "Meet the developer", icon: User },
];

export function Header({ onBackToHome, showNav = true, onGetStarted }: HeaderProps) {
  const { theme, resolvedTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

  const isDark = mounted
    ? theme === "system"
      ? resolvedTheme === "dark"
      : theme === "dark"
    : false;

  const logoSrc = mounted && isDark ? "/AWS-Dark.svg" : "/AWS-Light.svg";

  const handleNavClick = (elementId: string) => {
    document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    onGetStarted?.();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
          "border-b backdrop-blur-xl supports-[backdrop-filter]:bg-background/80",
          scrolled
            ? "border-orange-500/20 bg-background/90 shadow-sm shadow-orange-500/5"
            : "border-border/50 bg-background/70"
        )}
      >
        <div className="container mx-auto flex h-14 sm:h-[3.75rem] items-center gap-2 sm:gap-3 px-3 sm:px-4">
          <button
            type="button"
            onClick={onBackToHome}
            className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5 rounded-lg border-0 bg-transparent p-0 cursor-pointer"
          >
            <div
              className={cn(
                landingStyles.iconBox,
                "h-8 w-8 sm:h-9 sm:w-9 p-0 group-hover:border-orange-500/40 transition-colors"
              )}
            >
              <img
                src={logoSrc}
                alt="AWS Logo"
                className="h-4 w-4 sm:h-5 sm:w-5"
                suppressHydrationWarning
              />
            </div>
            <div className="min-w-0 text-left">
              <span className="block truncate text-sm font-bold tracking-tight leading-none group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                AWS Infra Generator
              </span>
              <span className="hidden sm:block text-[10px] text-muted-foreground leading-tight mt-0.5">
                {showNav ? "Infrastructure as Code" : "Wizard mode"}
              </span>
            </div>
          </button>

          {showNav && (
            <nav className="hidden lg:flex flex-1 justify-center min-w-0 px-2">
              <div
                className={cn(
                  landingStyles.segmented,
                  "max-w-full overflow-x-auto",
                  landingStyles.filterRail
                )}
              >
                <div className={cn(landingStyles.filterList, "gap-0.5 p-0.5")}>
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={cn(
                        landingStyles.pill,
                        "border-0 bg-transparent hover:bg-background/70 hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5 text-orange-500" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          )}

          {!showNav && (
            <div className="hidden sm:flex flex-1 items-center">
              <span className={landingStyles.eyebrow}>Building infrastructure</span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1 sm:gap-1.5 shrink-0">
            {showNav && onGetStarted && (
              <Button
                size="sm"
                onClick={handleGetStarted}
                className={cn("hidden md:inline-flex text-xs", landingStyles.ctaPrimary)}
              >
                Get Started
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            )}

            {!showNav && onBackToHome && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToHome}
                className="hidden sm:inline-flex h-8 text-xs border-orange-500/25 hover:bg-orange-500/10"
              >
                <Home className="mr-1 h-3.5 w-3.5" />
                Home
              </Button>
            )}

            <ThemeToggle size="sm" />

            <a
              href="https://github.com/NotHarshhaa/aws-infra-generator"
              target="_blank"
              rel="noopener noreferrer"
              title="View on GitHub"
              className="hidden sm:inline-flex"
            >
              <span className={cn(landingStyles.pill, "h-8 px-2.5 hover:border-orange-500/30 transition-colors")}>
                <Github className="h-3.5 w-3.5" />
              </span>
            </a>

            {showNav && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="lg:hidden h-8 w-8 border-border/70"
                title="Toggle menu"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </header>

      {showNav && mobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="lg:hidden fixed inset-0 top-14 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div
            className={cn(
              landingStyles.panel,
              "lg:hidden fixed top-[3.65rem] left-3 right-3 z-50 overflow-hidden",
              "shadow-lg shadow-orange-500/5 animate-in fade-in slide-in-from-top-2 duration-200"
            )}
          >
            <div className="border-b border-border/60 px-3 py-2.5 flex items-center justify-between">
              <span className="text-xs font-semibold">Navigation</span>
              <span className={landingStyles.eyebrow}>Menu</span>
            </div>

            <div className="p-2 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    landingStyles.card,
                    "w-full flex items-center gap-3 p-3 text-left border-0 hover:border-orange-500/25"
                  )}
                >
                  <div className={landingStyles.iconBox}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-[11px] text-muted-foreground">{item.description}</div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>

            <div className="border-t border-border/60 p-2 space-y-1.5">
              {onGetStarted && (
                <Button
                  size="sm"
                  onClick={handleGetStarted}
                  className={cn("w-full text-xs", landingStyles.ctaPrimary)}
                >
                  Get Started
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              )}

              <a
                href="https://github.com/NotHarshhaa/aws-infra-generator"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <span
                  className={cn(
                    landingStyles.pill,
                    "w-full justify-center py-2 hover:border-orange-500/30 transition-colors"
                  )}
                >
                  <Github className="h-3.5 w-3.5" />
                  View on GitHub
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </span>
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
