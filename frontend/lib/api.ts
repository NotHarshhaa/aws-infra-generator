import { GeneratedFile, ValidationResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function generateInfrastructure(payload: {
  services: string[];
  config: Record<string, { enabled: boolean; config: Record<string, unknown> }>;
  environment: string;
  region: string;
  format: string;
  projectName: string;
}): Promise<{ files: GeneratedFile[]; validation: ValidationResult }> {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Generation failed" }));
    throw new Error(error.detail || "Generation failed");
  }

  return res.json();
}

export async function validateInfrastructure(payload: {
  services: string[];
  config: Record<string, { enabled: boolean; config: Record<string, unknown> }>;
}): Promise<ValidationResult> {
  const res = await fetch(`${API_BASE}/api/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Validation failed");
  }

  return res.json();
}

export async function downloadInfrastructure(payload: {
  services: string[];
  config: Record<string, { enabled: boolean; config: Record<string, unknown> }>;
  environment: string;
  region: string;
  format: string;
  projectName: string;
}): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Download failed");
  }

  return res.blob();
}
