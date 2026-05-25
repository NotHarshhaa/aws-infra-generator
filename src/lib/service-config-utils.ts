import { getServiceById } from "./aws-services";
import { resolveServicesInOrder } from "./service-dependencies";
import type { ServiceConfig } from "./types";

export function createDefaultServiceConfig(
  serviceId: string
): ServiceConfig[string] | null {
  const service = getServiceById(serviceId);
  if (!service) {
    return null;
  }

  const defaults: ServiceConfig[string]["config"] = {};
  for (const field of service.configFields) {
    defaults[field.name] = field.default;
  }

  return { enabled: true, config: defaults };
}

export function ensureServiceConfigs(
  selectedServices: string[],
  existing: ServiceConfig,
  presetConfigs?: Record<string, Record<string, string | number | boolean>>
): ServiceConfig {
  const next: ServiceConfig = { ...existing };

  for (const serviceId of selectedServices) {
    if (!next[serviceId]) {
      const defaults = createDefaultServiceConfig(serviceId);
      if (defaults) {
        next[serviceId] = defaults;
      }
    }

    if (presetConfigs?.[serviceId]) {
      next[serviceId] = {
        enabled: true,
        config: {
          ...next[serviceId]?.config,
          ...presetConfigs[serviceId],
        },
      };
    }
  }

  return next;
}

export function resolveServicesWithDependencies(serviceIds: string[]): string[] {
  return resolveServicesInOrder(serviceIds);
}
