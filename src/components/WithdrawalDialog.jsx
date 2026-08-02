import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { isWelcomePackageEligible, getWelcomePackageRate, formatWelcomePackageRate } from "@/lib/plans";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Building2, Banknote, AlertCircle, CheckCircle2 } from "lucide-react";

export default function WithdrawalDialog({ open, onOpenChange, commitment, profile, onSubmitted, onRevert }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const hasBankDetails = profile?.bank_name && profile?.account_number && profile?.account_name;
  const amount = commitment ? (commitment.total_expected_value || commitment.amount) : 0;

  const isEarlyWithdrawal = (() => {
    if (!commitment?.maturity_date) return false;
    // A commitment is considered matured once its maturity date is reached,
    // inclusive of the entire local calendar day of maturity.
    const maturity = new Date(commitment.maturity_date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return maturity > today;
  })();

  const principal = commitment?.amount || 0;
  const expectedReturn = commitment?.expected_return != null ? commitment.expected_return : Math.max(0, (commitment?.total_expected_value || 0) - principal);
  const hasWelcomePackage = isWelcomePackageEligible(commitment?.plan_name);
  const welcomePackage = hasWelcomePackage ? principal * getWelcomePackageRate(commitment?.plan_name) : 0;
  const earlyPayout = principal - welcomePackage;
  // At maturity the participant receives their full commitment (principal, with the
  // 1% welcome package preserved) plus the entire expected return — no penalties.
  const maturedPayout = commitment?.total_expected_value || (principal + expectedReturn);

  const submitWithdrawal = async () => {
    setError("");
    if (!hasBankDetails) {
      setError("Please add your bank details before requesting a withdrawal.");
      return;
    }
    // Optimistic: reflect the request instantly; close only on success, revert on error
    const optimisticRecord = {
      id: `temp-${Date.now()}`,
      commitment_id: commitment.id,
      amount,
      status: "requested",
      bank_name: profile.bank_name,
      account_number: profile.account_number,
      account_name: profile.account_name,
      created_date: new Date().toISOString(),
    };
    onSubmitted(optimisticRecord);
    setSubmitting(true);
    try {
      await base44.entities.WithdrawalRequest.create({
        commitment_id: commitment.id,
        amount,
        status: "requested",
        bank_name: profile.bank_name,
        account_number: profile.account_number,
        account_name: profile.account_name,
      });
      onOpenChange(false);
    } catch (err) {
      onRevert(optimisticRecord);
      setError(err?.message || "Failed to submit withdrawal request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) { setShowWarning(false); setAcknowledged(false); setError(""); } onOpenChange(v); }}>
      <AlertDialogContent className="max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <AlertDialogHeader className="shrink-0">
          <AlertDialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-brand" /> Withdraw Commitment
          </AlertDialogTitle>
          <AlertDialogDescription>
            Submit a withdrawal request for your {commitment?.plan_name} Plan. Our team will review and process your payment to the bank account on file.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0 -mx-1 px-1">
          <div className="p-4 rounded-lg bg-brand/5 border border-brand/15">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Withdrawal Amount</p>
            <p className="font-numeric font-bold text-xl text-brand">{formatNaira(amount)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isEarlyWithdrawal ? "Requested (subject to early-withdrawal penalty)" : hasWelcomePackage ? `Full commitment + ROI (${formatWelcomePackageRate(commitment?.plan_name)} welcome package preserved)` : "Full commitment + ROI"}
            </p>
          </div>

          {!isEarlyWithdrawal && (
            <div className="p-4 rounded-lg bg-brand/5 border border-brand/20 space-y-2">
              <p className="text-sm font-semibold text-brand flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Maturity Reached — Full Payout
              </p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Original Commitment</span><span className="font-numeric font-medium">{formatNaira(principal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Expected Return (ROI)</span><span className="font-numeric font-medium text-brand">+ {formatNaira(expectedReturn)}</span></div>
                {hasWelcomePackage && (
                <div className="flex justify-between"><span className="text-muted-foreground">{formatWelcomePackageRate(commitment?.plan_name)} Welcome Package</span><span className="font-numeric font-medium text-brand">Preserved</span></div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-brand/15"><span className="font-medium text-foreground">Total Payable</span><span className="font-numeric font-bold text-brand">{formatNaira(maturedPayout)}</span></div>
              </div>
              <p className="text-[11px] text-muted-foreground">{hasWelcomePackage ? `Your commitment has matured. You will receive your full principal, your full expected return, and your ${formatWelcomePackageRate(commitment?.plan_name)} welcome package — no penalties apply.` : "Your commitment has matured. You will receive your full principal and your full expected return — no penalties apply."}</p>
            </div>
          )}

          <div className="p-4 rounded-lg border border-border">
            <p className="text-xs font-medium text-foreground mb-3 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-brand" /> Payment Destination
            </p>
            {hasBankDetails ? (
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span className="font-medium text-foreground">{profile.bank_name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Account No.</span><span className="font-numeric font-medium text-foreground">{profile.account_number}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Account Name</span><span className="font-medium text-foreground">{profile.account_name}</span></div>
              </div>
            ) : (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> No bank details on file. Add them in the Bank Details section.
              </p>
            )}
          </div>

          {showWarning && (
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/30 space-y-3">
              <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Early Withdrawal Penalty
              </p>
              <p className="text-sm text-foreground/90">
                Withdrawing before your maturity date ({commitment?.maturity_date ? new Date(commitment.maturity_date).toLocaleDateString() : "—"}) means you will:
              </p>
              <ul className="text-sm text-foreground/90 space-y-1 pl-1">
                <li>• Forfeit your entire Expected Return of <span className="font-numeric font-medium">{formatNaira(expectedReturn)}</span>.</li>
                {hasWelcomePackage && (
                <li>• Have the {formatWelcomePackageRate(commitment?.plan_name)} welcome package (<span className="font-numeric font-medium">{formatNaira(welcomePackage)}</span>) deducted from your initial commitment.</li>
                )}
              </ul>
              <div className="flex justify-between items-center pt-2 border-t border-destructive/20">
                <span className="text-xs text-muted-foreground">Estimated payout</span>
                <span className="font-numeric font-bold text-destructive">{formatNaira(earlyPayout)}</span>
              </div>
              <label className="flex items-start gap-2 text-sm text-foreground/90 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5"
                />
                I understand and accept that I will forfeit my ROI{hasWelcomePackage ? ` and the ${formatWelcomePackageRate(commitment?.plan_name)} welcome package` : ""} by withdrawing early.
              </label>
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <AlertDialogFooter className="shrink-0">
          {showWarning ? (
            <>
              <AlertDialogCancel onClick={() => { setShowWarning(false); setAcknowledged(false); }}>Back</AlertDialogCancel>
              <Button onClick={submitWithdrawal} disabled={submitting || !acknowledged} className="bg-destructive hover:bg-destructive/90">
                {submitting ? "Submitting..." : "I Understand, Withdraw Now"}
              </Button>
            </>
          ) : (
            <>
              <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
              <Button
                onClick={() => isEarlyWithdrawal ? setShowWarning(true) : submitWithdrawal()}
                disabled={submitting || !hasBankDetails}
                className="bg-brand hover:bg-brand-dark"
              >
                {submitting ? "Submitting..." : "Confirm Withdrawal"}
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}