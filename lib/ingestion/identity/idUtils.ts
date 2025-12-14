// lib/ingestion/identity/idUtils.ts
// Deterministic ID utilities (no Node crypto).

export function toIdSafeSegment(input: string, maxLen: number): string {
  const lowered = input.toLowerCase().trim();
  const replaced = lowered.replace(/[^a-z0-9]+/g, "-");
  const collapsed = replaced.replace(/-+/g, "-");
  const trimmed = collapsed.replace(/^-+|-+$/g, "");
  const truncated = trimmed.slice(0, Math.max(maxLen, 1));
  return truncated.length > 0 ? truncated : "x";
}

export function stableKey(parts: string[]): string {
  return parts.join("::");
}

export function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
    hash >>>= 0; // force unsigned 32-bit
  }
  return hash.toString(16).padStart(8, "0");
}
