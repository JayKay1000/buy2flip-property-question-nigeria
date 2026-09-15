import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Timer, LogOut } from "lucide-react";

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes total inactivity -> logout
const WARNING_MS = 60 * 1000;         // 1 minute countdown before logout
const TICK_MS = 250;

const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click", "wheel"];

export default function IdleAutoLogout() {
  const lastActivityRef = useRef(Date.now());
  const showWarningRef = useRef(false);
  const logoutInitiatedRef = useRef(false);
  const [showWarning, setShowWarning] = useState(false);
  const [remaining, setRemaining] = useState(WARNING_MS);

  const reset = useCallback(() => {
    lastActivityRef.current = Date.now();
    showWarningRef.current = false;
    setShowWarning(false);
    setRemaining(WARNING_MS);
  }, []);

  const handleLogout = useCallback(() => {
    logoutInitiatedRef.current = true;
    showWarningRef.current = false;
    setShowWarning(false);
    // base44.auth.logout() clears the token; we override its redirect to keep
    // the user on the Buy2Flip landing page (the Base44 endpoint 404s).
    base44.auth.logout();
    window.location.href = window.location.origin + "/";
  }, []);

  // Track user activity; any activity while the warning is open = "continue"
  useEffect(() => {
    const onActivity = () => {
      lastActivityRef.current = Date.now();
      if (showWarningRef.current) {
        showWarningRef.current = false;
        setShowWarning(false);
        setRemaining(WARNING_MS);
      }
    };
    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, onActivity, { passive: true })
    );
    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
    };
  }, []);

  // Countdown / auto-logout ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= IDLE_TIMEOUT_MS) {
        handleLogout();
        return;
      }
      if (elapsed >= IDLE_TIMEOUT_MS - WARNING_MS) {
        if (!showWarningRef.current) {
          showWarningRef.current = true;
          setShowWarning(true);
        }
        setRemaining(Math.max(0, IDLE_TIMEOUT_MS - elapsed));
      }
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [handleLogout]);

  const seconds = Math.ceil(remaining / 1000);
  const onOpenChange = (open) => {
    if (open) return;
    if (logoutInitiatedRef.current) {
      logoutInitiatedRef.current = false;
      return;
    }
    reset();
  };

  return (
    <AlertDialog open={showWarning} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-gold" />
            Are you still there?
          </AlertDialogTitle>
          <AlertDialogDescription>
            For your security, your profile will log out automatically in{" "}
            <span className="font-semibold text-foreground font-numeric">
              {seconds} second{seconds === 1 ? "" : "s"}
            </span>{" "}
            due to inactivity.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2">
          <AlertDialogCancel className="flex-1">Continue session</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Log out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}