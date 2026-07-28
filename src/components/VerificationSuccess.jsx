import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";

const SUCCESS_IMAGE =
  "https://media.base44.com/images/public/6a4d7c087d41148d5f9d3c8c/602f5ec6f_EngineerFemiSmiling.png";

const BRAND_COLORS = ["#0F5C3F", "#C9A227", "#0B3D2E", "#E0BE45"];

export default function VerificationSuccess({ onContinue, autoRedirectMs = 3000 }) {
  const [progress, setProgress] = useState(0);
  const soundRef = useRef(null);
  const [soundEnabled] = useState(false);

  // Respect user / OS reduced-motion settings (accessibility + mobile battery).
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fireBrandConfetti = () => {
    try {
      const opts = { colors: BRAND_COLORS, disableForReducedMotion: true };
      confetti({ particleCount: 50, spread: 55, origin: { x: 0.2, y: 0.7 }, ...opts });
      setTimeout(() => confetti({ particleCount: 50, spread: 55, origin: { x: 0.8, y: 0.7 }, ...opts }), 120);
      setTimeout(() => confetti({ particleCount: 70, spread: 100, origin: { x: 0.5, y: 0.5 }, ...opts }), 240);
      setTimeout(() => confetti({ particleCount: 40, spread: 120, origin: { x: 0.5, y: 0.6 }, ...opts }), 500);
    } catch {}
  };

  // Subtle ongoing confetti (skipped entirely for reduced-motion users)
  useEffect(() => {
    if (prefersReducedMotion) return;
    fireBrandConfetti();
    const interval = setInterval(() => {
      try {
        confetti({
          particleCount: 18,
          spread: 70,
          startVelocity: 25,
          gravity: 0.6,
          scalar: 0.8,
          ticks: 120,
          origin: { x: Math.random(), y: 0.15 },
          colors: BRAND_COLORS,
          disableForReducedMotion: true,
        });
      } catch {}
    }, 700);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Optional success sound (muted by default)
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      soundRef.current = ctx;
    } catch {}
  }, []);

  useEffect(() => {
    if (soundEnabled && soundRef.current) {
      try {
        const ctx = soundRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch {}
    }
  }, [soundEnabled]);

  // Auto-redirect countdown
  useEffect(() => {
    const steps = 40;
    const stepMs = autoRedirectMs / steps;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += stepMs;
      setProgress(Math.min(100, (elapsed / autoRedirectMs) * 100));
      if (elapsed >= autoRedirectMs) {
        clearInterval(timer);
        onContinue?.();
      }
    }, stepMs);
    return () => clearInterval(timer);
  }, [autoRedirectMs, onContinue]);

  const handleContinue = () => {
    onContinue?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-x-hidden overflow-y-auto safe-top-bottom">
      {/* Soft gradient backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#0F5C3F]/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#C9A227]/5 blur-3xl" />
      </div>

      {/* Scrollable, vertically-centered stage that never clips on short screens */}
      <div className="relative z-10 min-h-full flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md mx-auto px-6 flex flex-col items-center text-center"
        >
          {/* Premium image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-6"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0F5C3F]/10 to-[#C9A227]/10 blur-2xl scale-110" />
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-full overflow-hidden ring-4 ring-white shadow-2xl">
              <Image
                src={SUCCESS_IMAGE}
                alt="Property Question Nigeria representative giving a thumbs up"
                className="w-full h-full"
                fittingType="fill"
                focalPointX={0.5}
                focalPointY={0.4}
                loading="eager"
              />
            </div>
            {/* Thumbs-up pulse ring */}
            {!prefersReducedMotion && (
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-[#0F5C3F]/30"
              />
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="font-heading text-2xl sm:text-3xl font-bold text-charcoal"
          >
            Verification Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-3 text-sm sm:text-base text-slate-600 max-w-xs"
          >
            Your account has been verified successfully.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="mt-1.5 text-sm sm:text-base font-semibold text-[#0F5C3F]"
          >
            Welcome to Property Question Nigeria Limited.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-8 w-full"
          >
            <Button
              onClick={handleContinue}
              className="w-full h-12 text-sm font-semibold rounded-lg shadow-lg transition-transform active:scale-95"
              style={{ backgroundColor: "#0F5C3F", color: "#ffffff" }}
            >
              Continue to Dashboard
            </Button>
            {/* Auto-redirect progress bar */}
            <div className="mt-3 h-1 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100 ease-linear"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #0F5C3F 0%, #C9A227 100%)",
                }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Redirecting automatically…
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}