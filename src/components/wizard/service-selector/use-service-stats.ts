import { useCallback, useMemo } from "react";
import { getServiceById } from "@/lib/aws-services";
import type { ServiceStats } from "./types";

export function useServiceStats(selectedServices: string[]) {
  const calculateStats = useCallback((): ServiceStats => {
    const allDependencies = new Set<string>();
    selectedServices.forEach((serviceId) => {
      const service = getServiceById(serviceId);
      if (service) {
        service.dependencies.forEach((dep) => allDependencies.add(dep));
      }
    });

    const totalServices = selectedServices.length + allDependencies.size;
    const complexity =
      totalServices <= 3 ? "Low" : totalServices <= 6 ? "Medium" : "High";
    const cost =
      totalServices <= 2 ? "Low" : totalServices <= 5 ? "Medium" : "High";

    return {
      totalServices,
      selectedServices: selectedServices.length,
      requiredDependencies: allDependencies.size,
      estimatedComplexity: complexity,
      estimatedCost: cost,
    };
  }, [selectedServices]);

  return useMemo(() => calculateStats(), [calculateStats]);
}
