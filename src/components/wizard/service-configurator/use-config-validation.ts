import { useState, useCallback } from "react";
import { getServiceById } from "@/lib/aws-services";
import type { FieldError } from "./types";

export function useConfigValidation(
  selectedServices: string[],
  serviceConfig: Record<string, { config?: Record<string, unknown> }>,
  projectName: string
) {
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});

  const validateField = useCallback(
    (serviceId: string, fieldName: string, value: unknown): string | null => {
      const service = getServiceById(serviceId);
      if (!service) return null;

      const field = service.configFields.find((f) => f.name === fieldName);
      if (!field) return null;

      if (field.required && (value === undefined || value === null || value === "")) {
        return `${field.label} is required`;
      }

      if (field.type === "number" && value !== "") {
        const numValue = parseFloat(String(value));
        if (isNaN(numValue)) {
          return `${field.label} must be a valid number`;
        }
        if (fieldName.includes("port") && (numValue < 1 || numValue > 65535)) {
          return `${field.label} must be between 1 and 65535`;
        }
        if (fieldName.includes("size") && numValue < 0) {
          return `${field.label} must be positive`;
        }
      }

      if (field.type === "text" && typeof value === "string") {
        if (fieldName.includes("name") && value.length > 255) {
          return `${field.label} must be less than 255 characters`;
        }
        if (fieldName.includes("email") && value && !value.includes("@")) {
          return `${field.label} must be a valid email`;
        }
      }

      return null;
    },
    []
  );

  const validateAllFields = useCallback((): boolean => {
    const errors: FieldError = {};
    let hasErrors = false;

    if (!projectName.trim()) {
      errors.project = { projectName: "Project name is required" };
      hasErrors = true;
    } else if (!/^[a-zA-Z0-9-_]+$/.test(projectName)) {
      errors.project = {
        projectName: "Project name can only contain letters, numbers, hyphens, and underscores",
      };
      hasErrors = true;
    }

    selectedServices.forEach((serviceId) => {
      const service = getServiceById(serviceId);
      if (!service) return;

      const config = serviceConfig[serviceId]?.config || {};
      errors[serviceId] = {};

      service.configFields.forEach((field) => {
        const error = validateField(serviceId, field.name, config[field.name]);
        if (error) {
          errors[serviceId][field.name] = error;
          hasErrors = true;
        }
      });
    });

    setFieldErrors(errors);
    return !hasErrors;
  }, [selectedServices, serviceConfig, validateField, projectName]);

  const clearFieldError = useCallback((serviceId: string, fieldName: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [fieldName]: undefined,
      },
    }));
  }, []);

  const setProjectNameError = useCallback((error: string | undefined) => {
    setFieldErrors((prev) => ({
      ...prev,
      project: {
        ...prev.project,
        projectName: error,
      },
    }));
  }, []);

  const hasValidationErrors = Object.keys(fieldErrors).some((serviceId) =>
    Object.values(fieldErrors[serviceId]).some((error) => error)
  );

  return {
    fieldErrors,
    setFieldErrors,
    validateField,
    validateAllFields,
    clearFieldError,
    setProjectNameError,
    hasValidationErrors,
  };
}
