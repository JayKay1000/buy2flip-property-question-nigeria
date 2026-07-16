import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Building2, Banknote, AlertCircle } from "lucide-react";

export default function WithdrawalDialog({ open, onOpenChange, commitment, profile, onSubmitted, onRevert }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const hasBankDetails = profile?.bank_name && profile?.account_number && profile?.account_name;
  const amount = commitment ? (commitment.total_expected_value || commitment.amount) : 0;

  const handleWithdraw = async () => {
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-brand" /> Withdraw Commitment
          </AlertDialogTitle>
          <AlertDialogDescription>
            Submit a withdrawal request for your {commitment?.plan_name} Plan. Our team will review and process your payment to the bank account on file.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div className="p-4 rounded-lg bg-brand/5 border border-brand/15">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Withdrawal Amount</p>
            <p className="font-numeric font-bold text-xl text-brand">{formatNaira(amount)}</p>
            <p className="text-xs text-muted-foreground mt-1">Principal + Expected Returns</p>
          </div>

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

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <Button onClick={handleWithdraw} disabled={submitting || !hasBankDetails} className="bg-brand hover:bg-brand-dark">
            {submitting ? "Submitting..." : "Confirm Withdrawal"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}