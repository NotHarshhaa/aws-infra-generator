"use client";

import { Github, Moon, Sun, ExternalLink, Sparkles, Package, Server, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface HeaderProps {
  onBackToHome?: () => void;
}

export function Header({ onBackToHome }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  // Show system icon when theme is system and resolved theme is being determined
  const isDark = mounted ? (theme === "system" ? resolvedTheme === "dark" : theme === "dark") : false;
  
  // Prevent hydration mismatch by not rendering dynamic tooltips during SSR
  const getTooltipText = () => {
    if (!mounted) return "Toggle theme";
    
    if (theme === "system") {
      return `System theme (${resolvedTheme}) - Click to toggle`;
    } else if (theme === "dark") {
      return "Switch to system theme";
    } else {
      return "Switch to dark mode";
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = (elementId: string) => {
    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "border-b bg-background/90 backdrop-blur-xl shadow-lg supports-[backdrop-filter]:bg-background/85" 
          : "bg-background/70 backdrop-blur-lg supports-[backdrop-filter]:bg-background/50"
      }`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo and Title */}
          <button 
            onClick={onBackToHome}
            className="group flex items-center gap-3 hover:opacity-90 transition-all duration-200 bg-transparent border-none cursor-pointer"
          >
            <div className="relative">
              <img 
                src={isDark ? "/AWS-Dark.svg" : "/AWS-Light.svg"} 
                alt="AWS Logo" 
                className="h-7 w-7 transition-transform duration-200 group-hover:scale-110"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse opacity-75"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-tight group-hover:text-primary transition-colors duration-200">
                AWS Infra Generator
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                Infrastructure as Code
              </span>
            </div>
          </button>

          {/* Desktop Navigation and Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Quick Actions */}
            <div className="flex items-center gap-1 mr-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 px-3"
                onClick={() => handleNavClick('features')}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Features
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 px-3"
                onClick={() => handleNavClick('templates')}
              >
                <Package className="w-3 h-3 mr-1" />
                Templates
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 px-3"
                onClick={() => handleNavClick('services')}
              >
                <Server className="w-3 h-3 mr-1" />
                Services
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 px-3"
                onClick={() => handleNavClick('creator')}
              >
                <User className="w-3 h-3 mr-1" />
                Creator
              </Button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border mx-2"></div>

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-accent/50"
              title={getTooltipText()}
            >
              <div className="relative">
                {theme === "system" ? (
                  <div className="relative">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-200" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                ) : isDark ? (
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-200" />
                ) : (
                  <Moon className="h-4 w-4 rotate-0 scale-100 transition-all duration-200" />
                )}
              </div>
            </Button>

            {/* GitHub Link */}
            <a
              href="https://github.com/NotHarshhaa/aws-infra-generator"
              target="_blank"
              rel="noopener noreferrer"
              title="View on GitHub"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-accent/50 group"
              >
                <Github className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                <ExternalLink className="absolute -top-1 -right-1 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="h-8 w-8 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-accent/50"
              title={getTooltipText()}
            >
              {theme === "system" ? (
                <div className="relative">
                  <Sun className="h-4 w-4" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              ) : isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="h-8 w-8 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-accent/50"
              title="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-4 right-4 z-40 bg-gradient-to-b from-background via-background/95 to-background/90 backdrop-blur-xl rounded-2xl border border-border shadow-2xl shadow-black/20 dark:shadow-black/40 dark:border-border/80">
          <div className="container mx-auto px-4 py-6 space-y-3">
            {/* Navigation Links */}
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 px-4 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-[1.02] group"
                onClick={() => handleNavClick('features')}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">Features</div>
                    <div className="text-xs text-muted-foreground">Explore capabilities</div>
                  </div>
                </div>
              </Button>

              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 px-4 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-[1.02] group"
                onClick={() => handleNavClick('templates')}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">Templates</div>
                    <div className="text-xs text-muted-foreground">Preset configurations</div>
                  </div>
                </div>
              </Button>

              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 px-4 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-[1.02] group"
                onClick={() => handleNavClick('services')}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Server className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">Services</div>
                    <div className="text-xs text-muted-foreground">AWS infrastructure</div>
                  </div>
                </div>
              </Button>

              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 px-4 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-[1.02] group"
                onClick={() => handleNavClick('creator')}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">Creator</div>
                    <div className="text-xs text-muted-foreground">Meet the developer</div>
                  </div>
                </div>
              </Button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-4"></div>

            {/* External Links */}
            <div className="space-y-1">
              <a
                href="https://github.com/NotHarshhaa/aws-infra-generator"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block"
              >
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 px-4 rounded-xl transition-all duration-200 hover:bg-accent/50 hover:scale-[1.02] group"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/50 group-hover:bg-accent transition-colors">
                      <Github className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">GitHub Repository</div>
                      <div className="text-xs text-muted-foreground">View source code</div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Button>
              </a>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-border/50 dark:border-border/30">
              <div className="text-center text-xs text-muted-foreground">
                AWS Infrastructure Generator
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
