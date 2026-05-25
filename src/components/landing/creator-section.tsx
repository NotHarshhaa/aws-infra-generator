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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function CreatorSection() {
  return (
    <section id="creator" className="space-y-4 sm:space-y-6 px-3 py-6 sm:py-12">
      <div className="text-center space-y-3 sm:space-y-4">
        <Badge variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-1">
          Creator
        </Badge>
        <h2 className="text-xl sm:text-3xl font-bold">Meet the Creator</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          Built by a passionate engineer focused on cloud automation and platform engineering
        </p>
      </div>

      <Card className="max-w-4xl mx-auto border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-4 sm:p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src="https://github.com/NotHarshhaa.png"
                  alt="H A R S H H A A"
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg border-2 border-primary/20"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                  <Code className="w-2 h-2 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2 sm:space-y-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg sm:text-2xl font-bold tracking-tight">
                    H A R S H H A A
                  </h3>
                  <Verified className="w-3 h-3 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
                  Development Platform & Automation Enthusiast
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-2">
                <Badge variant="outline" className="text-xs">
                  <CloudCog className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
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
  );
}
