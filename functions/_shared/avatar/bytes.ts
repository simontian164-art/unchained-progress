// Small, dependency-free helpers that behave the same in Deno (Edge Functions) and Node (tests).

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000; // keep String.fromCharCode's argument list small
  for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  return btoa(bin);
}

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Identify JPEG/PNG from the bytes themselves; never trust a header or file name. */
export function sniffImage(bytes: Uint8Array): "image/jpeg" | "image/png" | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  return null;
}

/**
 * Make a provider message safe to log: strip data URIs, long base64 runs, URL query strings (signed
 * tokens) and cap the length. Logs must never carry image data or credentials.
 */
export function safeDetail(input: unknown, max = 200): string {
  let s = typeof input === "string" ? input : input instanceof Error ? input.message : JSON.stringify(input ?? "");
  s = s
    .replace(/data:[^\s"',]{0,40};base64,[A-Za-z0-9+/=]+/g, "[data-uri]")
    .replace(/[A-Za-z0-9+/=]{120,}/g, "[blob]")
    .replace(/(https?:\/\/[^\s"'?]+)\?[^\s"']*/g, "$1?[redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]");
  return s.length > max ? s.slice(0, max) + "…" : s;
}
