"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Network,
  Server,
  Database,
  HardDrive,
  Zap,
  Shield,
  Globe,
  GitFork,
  Cloud,
  Package,
  MessageSquare,
  Activity,
  ArrowRight,
  Maximize2,
  Minimize2,
  Download,
  Layers,
  Info,
  Workflow,
  Lock,
  Key,
  FileCheck,
  Users,
  Hammer,
  GitBranch,
  Rocket,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useInfraStore } from "@/lib/store";
import { getServiceById } from "@/lib/aws-services";

interface DiagramNode {
  id: string;
  name: string;
  icon: any;
  category: string;
  x: number;
  y: number;
  dependencies: string[];
  layer: number;
}

interface DiagramConnection {
  from: string;
  to: string;
  type: "dependency" | "data-flow";
}

export function InfraDiagram() {
  const { selectedServices, serviceConfig } = useInfraStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getServiceIcon = (serviceId: string) => {
    const iconMap: Record<string, any> = {
      vpc: Network,
      ec2: Server,
      rds: Database,
      dynamodb: Database,
      elasticache: Database,
      s3: HardDrive,
      efs: HardDrive,
      lambda: Zap,
      ecs: Package,
      eks: Package,
      alb: GitFork,
      "api-gateway": Globe,
      cloudfront: Cloud,
      route53: Globe,
      iam: Shield,
      sqs: MessageSquare,
      sns: MessageSquare,
      cloudwatch: Activity,
      "step-functions": Workflow,
      eventbridge: Zap,
      kinesis: Activity,
      "secrets-manager": Lock,
      kms: Key,
      "aws-config": FileCheck,
      "aws-backup": Shield,
      cognito: Users,
      codebuild: Hammer,
      codepipeline: GitBranch,
      codedeploy: Rocket,
      "cloudformation-stacksets": Layers,
    };
    return iconMap[serviceId] || Server;
  };

  const { nodes, connections } = useMemo(() => {
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];

    if (selectedServices.length === 0) {
      return { nodes, connections };
    }

    // Build dependency graph and calculate layers (hierarchical layout)
    const serviceMap = new Map<string, { service: any; deps: string[]; layer: number }>();
    
    selectedServices.forEach((serviceId) => {
      const service = getServiceById(serviceId);
      if (service) {
        serviceMap.set(serviceId, {
          service,
          deps: service.dependencies.filter(dep => selectedServices.includes(dep)),
          layer: 0,
        });
      }
    });

    // Calculate layers using topological sort
    const calculateLayers = () => {
      let changed = true;
      let iterations = 0;
      const maxIterations = 10;

      while (changed && iterations < maxIterations) {
        changed = false;
        iterations++;

        serviceMap.forEach((data, serviceId) => {
          if (data.deps.length > 0) {
            const maxDepLayer = Math.max(
              ...data.deps.map(depId => serviceMap.get(depId)?.layer ?? 0)
            );
            if (data.layer <= maxDepLayer) {
              data.layer = maxDepLayer + 1;
              changed = true;
            }
          }
        });
      }
    };

    calculateLayers();

    // Group services by layer
    const layerMap = new Map<number, string[]>();
    serviceMap.forEach((data, serviceId) => {
      const layer = data.layer;
      if (!layerMap.has(layer)) {
        layerMap.set(layer, []);
      }
      layerMap.get(layer)!.push(serviceId);
    });

    // Calculate positions with improved spacing
    const layerHeight = 180;
    const nodeSpacing = 200;
    const startY = 100;

    layerMap.forEach((serviceIds, layer) => {
      const layerWidth = serviceIds.length * nodeSpacing;
      const startX = -layerWidth / 2 + nodeSpacing / 2;

      serviceIds.forEach((serviceId, index) => {
        const data = serviceMap.get(serviceId);
        if (data) {
          nodes.push({
            id: serviceId,
            name: data.service.name,
            icon: getServiceIcon(serviceId),
            category: data.service.category,
            x: startX + index * nodeSpacing + 400,
            y: startY + layer * layerHeight,
            dependencies: data.service.dependencies,
            layer: layer,
          });

          // Create connections
          data.deps.forEach((depId) => {
            connections.push({
              from: serviceId,
              to: depId,
              type: "dependency",
            });
          });
        }
      });
    });

    return { nodes, connections };
  }, [selectedServices]);

  const downloadDiagram = () => {
    const svg = document.getElementById("infra-diagram-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "infrastructure-diagram.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (selectedServices.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <Network className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Select services to visualize your infrastructure
          </p>
        </CardContent>
      </Card>
    );
  }

  const viewBoxWidth = Math.max(...nodes.map((n) => n.x)) + 200;
  const viewBoxHeight = Math.max(...nodes.map((n) => n.y)) + 150;

  return (
    <Card className={isFullscreen ? "fixed inset-4 z-50" : ""}>
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Network className="h-4 w-4 sm:h-5 sm:w-5" />
              Infrastructure Diagram
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Visual AWS architecture
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadDiagram}
              className="gap-1 sm:gap-2 h-8 text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Export SVG</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 px-2 sm:px-3"
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg bg-gradient-to-br from-background to-muted/20 p-2 sm:p-4 overflow-auto">
          <svg
            id="infra-diagram-svg"
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="w-full"
            style={{ minHeight: isFullscreen ? "calc(100vh - 200px)" : "500px" }}
          >
            <defs>
              {/* Arrow markers */}
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3, 0 6"
                  fill="#6366f1"
                />
              </marker>
              
              {/* Gradients for nodes */}
              <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
              </linearGradient>
              
              <linearGradient id="hoverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
              </linearGradient>
              
              {/* Enhanced shadow */}
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                <feOffset dx="0" dy="3" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.25" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              
              {/* Glow effect for hover */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Background grid pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Layer indicators */}
            <g className="layers">
              {Array.from(new Set(nodes.map(n => n.layer))).sort((a, b) => a - b).map((layer) => {
                const layerY = 100 + layer * 180;
                return (
                  <g key={layer}>
                    <line
                      x1="50"
                      y1={layerY - 60}
                      x2={viewBoxWidth - 50}
                      y2={layerY - 60}
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                      opacity="0.3"
                    />
                    <text
                      x="20"
                      y={layerY}
                      className="text-xs fill-current text-muted-foreground"
                      opacity="0.5"
                    >
                      Layer {layer}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Draw connections with improved styling */}
            <g className="connections">
              {connections.map((conn, idx) => {
                const fromNode = nodes.find((n) => n.id === conn.from);
                const toNode = nodes.find((n) => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const x1 = fromNode.x;
                const y1 = fromNode.y + 35;
                const x2 = toNode.x;
                const y2 = toNode.y - 35;

                // Smooth bezier curve
                const controlY1 = y1 + (y2 - y1) * 0.5;
                const controlY2 = y2 - (y2 - y1) * 0.5;

                return (
                  <g key={idx}>
                    {/* Connection line with gradient effect */}
                    <path
                      d={`M ${x1} ${y1} C ${x1} ${controlY1}, ${x2} ${controlY2}, ${x2} ${y2}`}
                      stroke="#6366f1"
                      strokeWidth="2.5"
                      fill="none"
                      opacity="0.4"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}
            </g>

            {/* Draw nodes with enhanced design */}
            <g className="nodes">
              {nodes.map((node) => {
                const Icon = node.icon;
                const isHovered = hoveredNode === node.id;
                const isDependency = hoveredNode
                  ? nodes.find((n) => n.id === hoveredNode)?.dependencies.includes(node.id)
                  : false;
                const isDependentOn = hoveredNode
                  ? node.dependencies.includes(hoveredNode)
                  : false;

                // Category-based colors
                const categoryColors: Record<string, { bg: string; border: string; icon: string }> = {
                  compute: { bg: "#dbeafe", border: "#3b82f6", icon: "#2563eb" },
                  storage: { bg: "#fef3c7", border: "#f59e0b", icon: "#d97706" },
                  database: { bg: "#dcfce7", border: "#10b981", icon: "#059669" },
                  networking: { bg: "#e0e7ff", border: "#6366f1", icon: "#4f46e5" },
                  security: { bg: "#fce7f3", border: "#ec4899", icon: "#db2777" },
                  messaging: { bg: "#fae8ff", border: "#a855f7", icon: "#9333ea" },
                  management: { bg: "#fed7aa", border: "#f97316", icon: "#ea580c" },
                };

                const colors = categoryColors[node.category] || { bg: "#f3f4f6", border: "#9ca3af", icon: "#6b7280" };

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer transition-all"
                    style={{
                      opacity: hoveredNode && !isHovered && !isDependency && !isDependentOn ? 0.3 : 1,
                    }}
                  >
                    {/* Node card background with gradient */}
                    <rect
                      x="-60"
                      y="-40"
                      width="120"
                      height="80"
                      rx="12"
                      fill={
                        isHovered
                          ? "url(#hoverGradient)"
                          : isDependency
                          ? "rgba(59, 130, 246, 0.15)"
                          : isDependentOn
                          ? "rgba(34, 197, 94, 0.15)"
                          : colors.bg
                      }
                      stroke={
                        isHovered
                          ? colors.border
                          : isDependency
                          ? "rgb(59, 130, 246)"
                          : isDependentOn
                          ? "rgb(34, 197, 94)"
                          : colors.border
                      }
                      strokeWidth={isHovered ? "3" : "2"}
                      filter={isHovered ? "url(#glow)" : "url(#shadow)"}
                    />

                    {/* Icon background circle */}
                    <circle
                      cy="-10"
                      r="16"
                      fill={colors.icon}
                      opacity="0.15"
                    />
                    
                    {/* Icon indicator (simplified representation) */}
                    <circle
                      cy="-10"
                      r="8"
                      fill={colors.icon}
                      opacity="0.8"
                    />
                    <circle
                      cy="-10"
                      r="4"
                      fill="white"
                      opacity="0.9"
                    />

                    {/* Service name */}
                    <text
                      y="18"
                      textAnchor="middle"
                      className="text-xs font-bold fill-current"
                      fill={colors.icon}
                    >
                      {node.name}
                    </text>

                    {/* Category badge */}
                    <text
                      y="32"
                      textAnchor="middle"
                      className="text-[9px] fill-current"
                      fill={colors.border}
                      opacity="0.7"
                    >
                      {node.category}
                    </text>

                    {/* Layer indicator */}
                    {isHovered && (
                      <text
                        y="-28"
                        textAnchor="middle"
                        className="text-[8px] fill-current"
                        fill={colors.border}
                        opacity="0.6"
                      >
                        L{node.layer}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Service</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-6 sm:w-8 h-0.5 bg-muted-foreground/30" />
            <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3 text-muted-foreground/30" />
            <span className="text-muted-foreground">Dependency</span>
          </div>
          {hoveredNode && (
            <>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded border-2 border-blue-500" />
                <span className="text-muted-foreground hidden sm:inline">Required by</span>
                <span className="text-muted-foreground sm:hidden">Required</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded border-2 border-green-500" />
                <span className="text-muted-foreground hidden sm:inline">Depends on</span>
                <span className="text-muted-foreground sm:hidden">Depends</span>
              </div>
            </>
          )}
        </div>

        {/* Service count summary */}
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
          {Object.entries(
            nodes.reduce((acc, node) => {
              acc[node.category] = (acc[node.category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([category, count]) => (
            <Badge key={category} variant="outline" className="text-[10px] sm:text-xs">
              {category}: {count}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
