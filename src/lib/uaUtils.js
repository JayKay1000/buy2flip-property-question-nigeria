// Lightweight user-agent parsing for login activity display.
// Intentionally simple (no dependency) — good enough for security UI labels.
export function parseUserAgent(ua = (typeof navigator !== "undefined" ? navigator.userAgent : "")) {
  const browser = (() => {
    if (/Edg\//.test(ua)) return "Microsoft Edge";
    if (/OPR\//.test(ua) || /Opera/.test(ua)) return "Opera";
    if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
    if (/Firefox\//.test(ua)) return "Firefox";
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
    return "Browser";
  })();

  const os = (() => {
    if (/Windows NT 10/.test(ua)) return "Windows";
    if (/Windows NT/.test(ua)) return "Windows";
    if (/Mac OS X/.test(ua)) return "macOS";
    if (/Android/.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
    if (/Linux/.test(ua)) return "Linux";
    return "Unknown";
  })();

  const device = /Mobi|Android|iPhone|iPad|iPod/.test(ua) ? "Mobile" : "Desktop";
  const location = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch {
      return "";
    }
  })();

  return { browser, os, device, location };
}