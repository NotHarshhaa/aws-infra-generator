"use client";

import { Github, Moon, Sun, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setDark(isDark);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    checkTheme();
    handleScroll();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled 
        ? "border-b bg-background/95 backdrop-blur-lg shadow-sm supports-[backdrop-filter]:bg-background/80" 
        : "bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
    }`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <Link href="/" className="group flex items-center gap-3 hover:opacity-90 transition-all duration-200">
          <div className="relative">
            <img 
              src={dark ? "/AWS-Dark.svg" : "/AWS-Light.svg"} 
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
        </Link>

        {/* Navigation and Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-1 mr-4">
            <Button variant="ghost" size="sm" className="text-xs h-8 px-3">
              <Sparkles className="w-3 h-3 mr-1" />
              Features
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-8 px-3">
              Services
            </Button>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-border mx-2"></div>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-accent/50"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div className="relative">
              {dark ? (
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

          {/* CTA Button */}
          <Button 
            size="sm" 
            className="hidden md:flex h-9 px-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 hover:scale-105 shadow-sm"
            onClick={() => {
              const element = document.getElementById('get-started');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Get Started
            <Sparkles className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </header>
  );
}
