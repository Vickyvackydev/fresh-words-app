/**
 * Utility to safely parse JSON or delimited strings without throwing SyntaxError
 */
export function safeJsonParse<T = any>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val !== "string") return val as unknown as T;
  const trimmed = val.trim();
  if (!trimmed) return fallback;
  try {
    return JSON.parse(trimmed);
  } catch {
    return fallback;
  }
}

export function parseActionPoints(actionPointsRaw: any): string[] {
  if (!actionPointsRaw) return [];
  if (Array.isArray(actionPointsRaw)) {
    return actionPointsRaw.map((a) => String(a).trim()).filter(Boolean);
  }
  if (typeof actionPointsRaw === "string") {
    const trimmed = actionPointsRaw.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((a) => String(a).trim()).filter(Boolean);
        }
        return [String(parsed).trim()];
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  }
  return [];
}
