import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PasswordInput from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Shield, KeyRound, Smartphone, Clock, Monitor, Loader2, CheckCircle2, MapPin } from "lucide-react";
import moment from "moment";
import { parseUserAgent } from "@/lib/uaUtils";

export default function SecuritySettings() {
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [twoFactor, setTwoFactor] = useState(false);
  const [saving2fa, setSaving2fa] = useState(false);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        setMe(user);
        setTwoFactor(!!user?.two_factor_enabled);
      } catch {}
      try {
        const items = await base44.entities.LoginActivity.filter({}, "-created_date", 10);
        setActivity(items || []);
      } catch {}
      setLoadingActivity(false);
    })();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    if (!pw.current) {
      setPwError("Enter your current password.");
      return;
    }
    if (pw.next.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    if (!me) {
      setPwError("Unable to verify your account. Please reload the page.");
      return;
    }
    setPwLoading(true);
    try {
      await base44.auth.changePassword({
        userId: me.id,
        currentPassword: pw.current,
        newPassword: pw.next,
      });
      setPw({ current: "", next: "", confirm: "" });
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    } catch (err) {
      const status = err?.status;
      if (status === 401) setPwError("Your current password is incorrect.");
      else if (status === 422) setPwError("New password does not meet the requirements.");
      else setPwError(err?.message || "Failed to change password. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleToggle2fa = async (checked) => {
    setTwoFactor(checked);
    setSaving2fa(true);
    try {
      await base44.auth.updateMe({ two_factor_enabled: checked });
      toast({
        title: checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
        description: checked
          ? "Extra verification will be requested at sign-in."
          : "Two-factor authentication is now turned off.",
      });
    } catch (err) {
      setTwoFactor(!checked);
      toast({
        title: "Could not update setting",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving2fa(false);
    }
  };

  const currentSession = parseUserAgent();
  const now = Date.now();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-brand" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Account Security</h1>
          <p className="text-sm text-muted-foreground">Manage your password, authentication, and recent activity.</p>
        </div>
      </div>

      {/* Change Password */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-brand" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>Use a strong, unique password you don't reuse elsewhere.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-pw">Current password</Label>
              <PasswordInput
                id="current-pw"
                autoComplete="current-password"
                value={pw.current}
                onChange={(e) => setPw({ ...pw, current: e.target.value })}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-pw">New password</Label>
                <PasswordInput
                  id="new-pw"
                  autoComplete="new-password"
                  value={pw.next}
                  onChange={(e) => setPw({ ...pw, next: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-pw">Confirm new password</Label>
                <PasswordInput
                  id="confirm-pw"
                  autoComplete="new-password"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                />
              </div>
            </div>

            {pwError && (
              <p className="text-sm text-destructive font-medium">{pwError}</p>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={pwLoading}>
                {pwLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating…
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-brand" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security. When enabled, a verification code is requested at sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="font-medium text-sm">Authenticator protection</p>
                <p className="text-xs text-muted-foreground">
                  {twoFactor ? "Enabled on your account" : "Currently disabled"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {twoFactor && (
                <Badge className="bg-brand/10 text-brand border-0 hover:bg-brand/10">Active</Badge>
              )}
              <Switch
                checked={twoFactor}
                onCheckedChange={handleToggle2fa}
                disabled={saving2fa}
              />
            </div>
          </div>
          {saving2fa && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving…
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Login Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand" />
            <CardTitle>Recent Login Activity</CardTitle>
          </div>
          <CardDescription>Recent access to your account across devices.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Current session */}
          <div className="flex items-center gap-3 rounded-xl bg-brand/5 border border-brand/10 p-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">
                  {currentSession.browser} • {currentSession.os}
                </p>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 hover:bg-emerald-100">Active now</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentSession.device} session
                {currentSession.location ? ` • ${currentSession.location}` : ""}
              </p>
            </div>
          </div>

          {/* Recorded activity */}
          {loadingActivity ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : activity.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No additional activity recorded yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((item) => {
                const isActive = now - new Date(item.created_date).getTime() < 5 * 60 * 1000;
                return (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.browser || "Browser"} • {item.os || "Device"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                        <span>{item.device}</span>
                        {item.location && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="inline-flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" /> {item.location}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 hover:bg-emerald-100">Active</Badge>
                      ) : (
                        <p className="text-xs text-muted-foreground">{moment(item.created_date).fromNow()}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                        {moment(item.created_date).format("DD MMM, h:mm A")}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}