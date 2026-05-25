function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((sorted, key) => {
        sorted[key] = sortValue(record[key]);
        return sorted;
      }, {});
  }

  return value;
}

/** Deterministic JSON.stringify for config snapshot comparisons. */
export function stableJsonStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}
