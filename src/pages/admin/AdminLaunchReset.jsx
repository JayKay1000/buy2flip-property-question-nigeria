import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/format";
import { toast } from "@/components/ui/use-toast";
import {
  AlertTriangle, ShieldCheck, Loader2, CheckCircle2, XCircle, Database,
  Users, Network, Banknote, CreditCard, History, Lock,
} from "lucide-react";

const CONFIRM_PHRASE = "RESET BUY2FLIP LAUNCH";

export default function AdminLaunchReset() {
  const [confirmText, setConfirmText] = useState("");
  const [allowRerun, setAllowRerun] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [audits, setAudits] = useState([]);
  const [loadingAudits, setLoadingAudits] = useState(true);

  const loadAudits = async () => {
    try {
      const list = await base44.entities.LaunchResetAudit.list("-created_date");
      setAudits(list);
    } catch {
    } finally {
      setLoadingAudits(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const completedExists = audits.some((a) => a.status === "completed");
  const phraseMatches = confirmText.trim() === CONFIRM_PHRASE;
  const canExecute = phraseMatches && (!completedExists || allowRerun) && !running;

  const execute = async () => {
    setError("");
    setResult(null);
    setRunning(true);
    try {
      const res = await base44.functions.invoke("launchReset", {
        confirm: confirmText,
        force: allowRerun,
      });
      const data = res.data || {};
      if (data.error) {
        setError(data.error);
        toast({ title: "Reset not completed", description: data.error, variant: "destructive" });
      } else {
        setResult(data);
        setConfirmText("");
        setAllowRerun(false);
        toast({
          title: "Launch reset complete",
          description: "All test data has been reset to a clean starting state.",
        });
        loadAudits();
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Failed to execute launch reset.";
      setError(msg);
      toast({ title: "Reset failed", description: msg, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const summaryItems = result?.summary ? [
    { label: "Users Affected", value: result.summary.users_affected, icon: Users, color: "text-brand" },
    { label: "Commitments Voided", value: result.summary.commitments_affected, icon: Database, color: "text-gold-dark" },
    { label: "Referrals Removed", value: result.summary.referrals_affected, icon: Network, color: "text-brand" },
    { label: "Downlines Cleared", value: result.summary.downlines_affected, icon: Users, color: "text-gold-dark" },
    { label: "Payments Removed", value: result.summary.payments_affected, icon: CreditCard, color: "text-brand" },
    { label: "Withdrawals Removed", value: result.summary.withdrawals_affected, icon: Banknote, color: "text-gold-dark" },
  ] : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Buy2Flip Launch Data Reset</h1>
          <p className="text-muted-foreground mt-1">
            One-time pre-launch operation to reset all test commitments, balances, and referral data.
          </p>
        </div>
      </div>

      {completedExists && (
        <Card className="p-5 mb-6 border-brand/40 bg-brand/5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground text-sm">Launch reset already completed</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              A completed launch reset exists on record. The operation is locked to prevent accidental re-execution.
              Enable "Allow re-run" below only if you deliberately need to reset again.
            </p>
          </div>
        </Card>
      )}

      {/* Warning */}
      <Card className="p-6 mb-6 border-destructive/40 bg-destructive/5">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-heading font-semibold text-foreground">WARNING — Irreversible Operation</h2>
            <p className="text-sm text-foreground/90 mt-1">
              This will reset all existing Buy2Flip test commitments, balances, referral relationships and downline data.
              User accounts and profiles will <span className="font-semibold">NOT</span> be deleted.
              This action should only be performed once before the official launch.
            </p>
          </div>
        </div>
        <ul className="text-sm text-foreground/80 space-y-1.5 pl-1 mb-1">
          <li className="flex items-start gap-2"><Lock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" /> User accounts, profiles, emails, phone numbers and verification records are preserved.</li>
          <li className="flex items-start gap-2"><Database className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" /> Test commitments are marked <span className="font-medium">void</span> and excluded from all live calculations.</li>
          <li className="flex items-start gap-2"><Network className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" /> All referral/downline relationships and referral earnings are removed.</li>
          <li className="flex items-start gap-2"><CreditCard className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" /> Test payment evidence and withdrawal requests are removed.</li>
          <li className="flex items-start gap-2"><History className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" /> A full audit record with a backup snapshot is created before data is cleared.</li>
        </ul>
      </Card>

      {/* Execution controls */}
      <Card className="p-6 mb-6">
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-medium">Type the confirmation phrase to proceed</Label>
            <p className="text-xs text-muted-foreground mb-2">
              To confirm, type exactly: <span className="font-numeric font-semibold text-foreground">{CONFIRM_PHRASE}</span>
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              className="h-11 font-medium"
              autoComplete="off"
            />
          </div>

          {completedExists && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-gold/40 bg-gold/5">
              <Switch checked={allowRerun} onCheckedChange={setAllowRerun} id="rerun" />
              <div className="flex-1">
                <Label htmlFor="rerun" className="text-sm font-medium cursor-pointer">Allow re-run (launch already completed)</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Deliberately re-enables the reset. Only an administrator should enable this.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/30 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={execute}
              disabled={!canExecute}
              className="bg-destructive hover:bg-destructive/90 sm:flex-1"
            >
              {running ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resetting test data...</>
              ) : (
                <><AlertTriangle className="w-4 h-4 mr-2" /> Execute Launch Reset</>
              )}
            </Button>
          </div>
          {!phraseMatches && confirmText.length > 0 && (
            <p className="text-xs text-muted-foreground">Phrase does not match. Type it exactly as shown above.</p>
          )}
        </div>
      </Card>

      {/* Result */}
      {result && (
        <Card className="p-6 mb-6 border-brand/30 bg-brand/5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-brand" />
            <h2 className="font-heading font-semibold text-foreground">Reset Completed Successfully</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">{result.message}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            {summaryItems.map((item) => (
              <div key={item.label} className="p-4 rounded-lg bg-background border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
                <p className="font-numeric font-bold text-xl text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
          {result.verification && (
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand" /> Post-Reset Verification
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  {result.verification.active_commitments_remaining === 0
                    ? <CheckCircle2 className="w-4 h-4 text-brand" /> : <XCircle className="w-4 h-4 text-destructive" />}
                  <span className="text-muted-foreground">{result.verification.active_commitments_remaining} active commitments left</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.verification.referrals_remaining === 0
                    ? <CheckCircle2 className="w-4 h-4 text-brand" /> : <XCircle className="w-4 h-4 text-destructive" />}
                  <span className="text-muted-foreground">{result.verification.referrals_remaining} referrals left</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.verification.profiles_with_referrer_remaining === 0
                    ? <CheckCircle2 className="w-4 h-4 text-brand" /> : <XCircle className="w-4 h-4 text-destructive" />}
                  <span className="text-muted-foreground">{result.verification.profiles_with_referrer_remaining} referrer links left</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Audit history */}
      <Card className="p-6">
        <h2 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-brand" /> Reset Audit History
        </h2>
        {loadingAudits ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : audits.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No launch reset has been performed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Admin</th>
                  <th className="pb-3 font-medium">Commitments</th>
                  <th className="pb-3 font-medium">Referrals</th>
                  <th className="pb-3 font-medium">Downlines</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="py-3 text-muted-foreground">{formatDate(a.executed_at || a.created_date)}</td>
                    <td className="py-3 text-foreground">{a.executed_by_name || a.executed_by}</td>
                    <td className="py-3 font-numeric text-foreground">{a.commitments_affected ?? 0}</td>
                    <td className="py-3 font-numeric text-foreground">{a.referrals_affected ?? 0}</td>
                    <td className="py-3 font-numeric text-foreground">{a.downlines_affected ?? 0}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        a.status === "completed" ? "bg-brand/10 text-brand" : "bg-destructive/10 text-destructive"
                      }`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}