import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { parseUserAgent } from "@/lib/uaUtils";

// Records one login-activity entry per user per browser session, so the
// Security page can show genuine recent access without fabricating data.
export default function LoginActivityTracker() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!me) return;
        const key = `pqlb_login_logged_${me.id}`;
        if (sessionStorage.getItem(key)) return;
        const { browser, os, device, location } = parseUserAgent();
        await base44.entities.LoginActivity.create({
          device: `${device} • ${os}`,
          browser,
          os,
          location,
        });
        if (!cancelled) sessionStorage.setItem(key, "1");
      } catch {
        // Non-critical: never block the app on activity logging.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}