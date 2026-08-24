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
          "border-b backdrop-blur-2xl supports-[backdrop-filter]:bg-background/80",
          scrolled
            ? "border-border/80 bg-background/95 shadow-xs"
            : "border-border/40 bg-background/70"
        )}
      >
        <div className="container mx-auto flex h-14 sm:h-16 items-center gap-2 sm:gap-3 px-3 sm:px-4">
          <button
            type="button"
            onClick={onBackToHome}
            className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-full border-0 bg-transparent p-1 -ml-1 cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <div
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500/20 via-orange-500/10 to-amber-500/10 border border-orange-500/20 shadow-xs group-hover:border-orange-500/40 transition-colors"
            >
              <img
                src={logoSrc}
                alt="AWS Logo"
                className="h-4 w-4 sm:h-5 sm:w-5"
                suppressHydrationWarning
              />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <span className="block truncate text-sm sm:text-base font-bold tracking-tight leading-none group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  AWS Infra
                </span>
                <span className="rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider">
                  Studio
                </span>
              </div>
              <span className="hidden sm:block text-[11px] text-muted-foreground leading-tight mt-0.5 font-normal">
                {showNav ? "Cloud IaC Generator" : "Studio workspace"}
              </span>
            </div>
          </button>

          {showNav && (
            <nav className="hidden lg:flex flex-1 justify-center min-w-0 px-4">
              <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/35 backdrop-blur-md p-1 shadow-xs">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-background hover:text-foreground hover:shadow-xs cursor-pointer"
                  >
                    <item.icon className="h-3.5 w-3.5 text-orange-500" />
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>
          )}

          {!showNav && (
            <div className="hidden sm:flex flex-1 items-center pl-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                <Sparkles className="h-3 w-3" />
                Active Studio Session
              </span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
            {showNav && onGetStarted && (
              <Button
                size="sm"
                onClick={handleGetStarted}
                className="hidden md:inline-flex rounded-full px-4 h-8 sm:h-9 text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white shadow-xs hover:shadow-sm gap-1.5 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Launch Studio
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}

            {!showNav && onBackToHome && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToHome}
                className="hidden sm:inline-flex rounded-full h-8 sm:h-9 px-3.5 text-xs border-border/70 hover:bg-muted/60"
              >
                <Home className="mr-1.5 h-3.5 w-3.5" />
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
              <span className="inline-flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-full border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
                <Github className="h-4 w-4" />
              </span>
            </a>

            {showNav && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="lg:hidden h-8 w-8 rounded-full border-border/70"
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
