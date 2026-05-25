"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  size?: "sm" | "md";
}

export function ThemeToggle({ size = "md" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const isDark = theme === "system" ? resolvedTheme === "dark" : theme === "dark";

  const getTooltipText = () => {
    if (theme === "system") {
      return `System theme (${resolvedTheme}) - Click to toggle`;
    }
    if (theme === "dark") {
      return "Switch to system theme";
    }
    return "Switch to dark mode";
  };

  const buttonClass =
    size === "sm"
      ? "h-8 w-8 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-accent/50"
      : "h-9 w-9 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-accent/50";

  const iconClass =
    size === "sm"
      ? "h-4 w-4"
      : "h-4 w-4 rotate-0 scale-100 transition-all duration-200";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={buttonClass}
      title={mounted ? getTooltipText() : "Toggle theme"}
      suppressHydrationWarning
    >
      {!mounted ? (
        <Sun className={`${iconClass} opacity-0`} aria-hidden />
      ) : theme === "system" ? (
        <div className="relative">
          <Sun className={iconClass} />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      ) : isDark ? (
        <Sun className={iconClass} />
      ) : (
        <Moon className={iconClass} />
      )}
    </Button>
  );
}
