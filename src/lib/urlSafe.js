// Validates that a URL only uses a safe scheme (http/https) or a same-origin
// relative path, rejecting dangerous protocols such as javascript: and data:.
export function isSafeUrl(url) {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Same-origin relative path (but not a protocol-relative "//host" URL)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const parsed = new URL(trimmed, window.location.origin);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}