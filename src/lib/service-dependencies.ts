import { AWS_SERVICES } from "./aws-services";
import { stableJsonStringify } from "./stable-json";

export function getDirectDependencies(serviceId: string): string[] {
  const service = AWS_SERVICES.find((s) => s.id === serviceId);
  return service?.dependencies ?? [];
}

export function getServiceDependencies(serviceId: string): string[] {
  const allDeps = new Set<string>();

  const resolveDeps = (sid: string) => {
    for (const dep of getDirectDependencies(sid)) {
      if (!allDeps.has(dep)) {
        allDeps.add(dep);
        resolveDeps(dep);
      }
    }
  };

  resolveDeps(serviceId);
  return Array.from(allDeps);
}

export function resolveServicesInOrder(services: string[]): string[] {
  const resolved = new Set<string>();

  for (const serviceId of services) {
    for (const dep of getServiceDependencies(serviceId)) {
      resolved.add(dep);
    }
    resolved.add(serviceId);
  }

  const canonicalOrder = AWS_SERVICES.map((service) => service.id);
  const ordered = canonicalOrder.filter((id) => resolved.has(id));

  for (const id of resolved) {
    if (!ordered.includes(id)) {
      ordered.push(id);
    }
  }

  return ordered;
}

export function buildServiceDependencyMap(): Record<string, string[]> {
  return Object.fromEntries(AWS_SERVICES.map((service) => [service.id, service.dependencies]));
}

export type ConfigSnapshotInput = {
  selectedServices: string[];
  serviceConfig: Record<string, unknown>;
  projectName: string;
  environment: string;
  region: string;
  outputFormat: string;
};

export function computeConfigSnapshot(input: ConfigSnapshotInput): string {
  return stableJsonStringify({
    selectedServices: [...input.selectedServices].sort(),
    serviceConfig: input.serviceConfig,
    projectName: input.projectName.trim().toLowerCase(),
    environment: input.environment,
    region: input.region,
    outputFormat: input.outputFormat,
  });
}
