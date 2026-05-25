/** Matches Terraform variable validation in variables.tf */
export const PROJECT_NAME_PATTERN = /^[a-z0-9-]{3,16}$/;

export const PROJECT_NAME_RULE =
  "3–16 characters, lowercase letters, numbers, and hyphens only";

export function validateProjectName(name: string): string | null {
  const trimmed = name.trim();

  if (!trimmed) {
    return "Project name is required";
  }

  if (!PROJECT_NAME_PATTERN.test(trimmed)) {
    return `Project name must be ${PROJECT_NAME_RULE}`;
  }

  return null;
}

/** Best-effort normalization for user input before validation. */
export function normalizeProjectName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 16);
}
