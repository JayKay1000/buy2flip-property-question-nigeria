import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatNaira } from "@/lib/format";
import { getWelcomePackageRate, formatWelcomePackageRate } from "@/lib/plans";
import { Gift, Building2, AlertCircle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export default function WelcomePackageWithdrawDialog({
  open,
  onOpenChange,
  commitment,
  profile,
  onSubmitted,
  onRevert,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const principal = commitment?.amount || 0;
  const welcomeAmount = Math.round(principal * getWelcomePackageRate(commitment?.plan_name));
  const hasBank = !!(profile?.bank_name && profile?.account_number && profile?.account_name);

  const handleSubmit = async () => {
    setError("");
    if (!hasBank) {
      setError("Please add your bank details before requesting your welcome package withdrawal.");
      return;
    }
    setSubmitting(true);
    const optimisticRecord = {
      id: `tmp-${Date.now()}`,
      commitment_id: commitment.id,
      amount: welcomeAmount,
      request_type: "welcome_package",
      status: "requested",
      bank_name: profile.bank_name,
      account_number: profile.account_number,
      account_name: profile.account_name,
      created_date: new Date().toISOString(),
      created_by_id: profile.created_by_id,
    };
    try {
      const created = await base44.entities.WithdrawalRequest.create({
        commitment_id: commitment.id,
        amount: welcomeAmount,
        request_type: "welcome_package",
        status: "requested",
        bank_name: profile.bank_name,
        account_number: profile.account_number,
        account_name: profile.account_name,
      });
      onSubmitted({ ...optimisticRecord, ...created, id: created.id });
      onOpenChange(false);
    } catch (err) {
      onRevert(optimisticRecord);
      setError(err?.message || "Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-gold-dark" /> Withdraw {formatWelcomePackageRate(commitment?.plan_name)} Welcome Package
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your commitment has been verified. You can now withdraw your {formatWelcomePackageRate(commitment?.plan_name)} welcome package immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 my-2">
          <div className="p-4 rounded-lg bg-gold/5 border border-gold/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Welcome Package ({formatWelcomePackageRate(commitment?.plan_name)})</p>
            <p className="font-numeric font-bold text-xl text-gold-dark">{formatNaira(welcomeAmount)}</p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20">
            <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-brand" /> Payment Destination
            </p>
            {hasBank ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span className="font-medium text-foreground">{profile.bank_name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Account No.</span><span className="font-numeric font-medium text-foreground">{profile.account_number}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Account Name</span><span className="font-medium text-foreground">{profile.account_name}</span></div>
              </div>
            ) : (
              <p className="text-xs text-destructive flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> No bank details on file. Add your bank details to continue.</p>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            This request will be reviewed and paid by our team after manual verification. Your full commitment and ROI remain payable at maturity.
          </p>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !hasBank}
            className="bg-gold hover:bg-gold-dark text-white border-0"
          >
            {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Submitting...</> : <>Request Withdrawal</>}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}