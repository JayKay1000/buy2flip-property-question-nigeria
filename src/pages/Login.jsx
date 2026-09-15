import React, { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import PasswordInput from "@/components/PasswordInput";
import { postAuthRedirect } from "@/lib/authReturnTo";
import {
  getLoginRateLimit,
  recordFailedLogin,
  clearLoginRateLimit,
  formatRemainingTime,
} from "@/lib/authRateLimit";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isAuthenticated, authChecked } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockMs, setLockMs] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  const refreshLockState = useCallback((em = email) => {
    const state = getLoginRateLimit(em);
    setLockMs(state?.locked ? state.remainingMs : 0);
    setRemainingAttempts(state && !state.locked ? state.remainingAttempts : null);
  }, [email]);

  // Tick down the lockout countdown so the UI stays accurate.
  useEffect(() => {
    if (lockMs <= 0) return;
    const t = setInterval(() => {
      setLockMs((prev) => {
        const next = prev - 1000;
        return next <= 0 ? 0 : next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [lockMs > 0]);

  // Re-evaluate the lock state whenever the email changes.
  useEffect(() => {
    refreshLockState(email);
  }, [email, refreshLockState]);

  // Keep already-authenticated users in their session even if they hit the
  // browser back button and land on /login.
  if (authChecked && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const state = getLoginRateLimit(email);
    if (state?.locked) {
      setLockMs(state.remainingMs);
      setError(`Too many failed attempts. Try again in ${formatRemainingTime(state.remainingMs)}.`);
      return;
    }

    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      clearLoginRateLimit(email);
      postAuthRedirect("/dashboard");
    } catch (err) {
      const result = recordFailedLogin(email);
      if (result?.locked) {
        setLockMs(result.remainingMs);
        setRemainingAttempts(null);
        setError(`Too many failed attempts. Your account is locked for ${formatRemainingTime(result.remainingMs)}.`);
      } else {
        setRemainingAttempts(result?.remainingAttempts ?? null);
        const left = result?.remainingAttempts;
        setError(
          left != null && left <= 2
            ? `Invalid email or password. ${left} attempt${left === 1 ? "" : "s"} remaining before temporary lockout.`
            : err.message || "Invalid email or password"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/?returnTo=" + encodeURIComponent("/dashboard"));
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Access your commitment portfolio"
      footer={
        <>Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link>
        </>
      }
    >
      <Button variant="outline" className="w-full h-12 text-sm font-medium mb-6" onClick={handleGoogle}>
        <GoogleIcon className="w-5 h-5 mr-2" />Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
            leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
            required
          />
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading || lockMs > 0}>
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Logging in...</>
          ) : lockMs > 0 ? (
            <><Lock className="w-4 h-4 mr-2" />Locked — {formatRemainingTime(lockMs)}</>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}