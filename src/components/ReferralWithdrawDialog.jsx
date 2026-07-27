import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { Gift, Building2, AlertCircle, Loader2, Users, Network } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export default function ReferralWithdrawDialog({
  open,
  onOpenChange,
  profile,
  referrals,
  onSubmitted,
  onRevert,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isAvailable = (r) => (r.reward_amount || 0) > 0 && !r.withdrawn;
  const directAvailable = referrals
    .filter((r) => r.level === 1 && isAvailable(r))
    .reduce((s, r) => s + (r.reward_amount || 0), 0);
  const indirectAvailable = referrals
    .filter((r) => r.level === 2 && isAvailable(r))
    .reduce((s, r) => s + (r.reward_amount || 0), 0);
  const totalAvailable = directAvailable + indirectAvailable;

  const hasBank = !!(profile?.bank_name && profile?.account_number && profile?.account_name);
  const canRequest = hasBank && totalAvailable > 0;

  const handleSubmit = async () => {
    setError("");
    if (!hasBank) {
      setError("Please add your bank details before requesting a referral earnings withdrawal.");
      return;
    }
    if (totalAvailable <= 0) {
      setError("You have no referral earnings available to withdraw yet.");
      return;
    }
    setSubmitting(true);
    const optimisticRecord = {
      id: `tmp-${Date.now()}`,
      amount: totalAvailable,
      request_type: "referral",
      status: "requested",
      bank_name: profile.bank_name,
      account_number: profile.account_number,
      account_name: profile.account_name,
      created_date: new Date().toISOString(),
      created_by_id: profile.created_by_id,
    };
    try {
      const created = await base44.entities.WithdrawalRequest.create({
        amount: totalAvailable,
        request_type: "referral",
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
            <Gift className="w-5 h-5 text-gold-dark" /> Withdraw Referral Earnings
          </AlertDialogTitle>
          <AlertDialogDescription>
            Request a payout of your accrued referral rewards. Direct (2%) and indirect (0.5%) earnings are computed separately.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 my-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-brand/5 border border-brand/20">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-brand" />
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">1st Line (2%)</p>
              </div>
              <p className="font-numeric font-bold text-lg text-brand">{formatNaira(directAvailable)}</p>
            </div>
            <div className="p-3 rounded-lg bg-gold/5 border border-gold/20">
              <div className="flex items-center gap-1.5 mb-1">
                <Network className="w-3.5 h-3.5 text-gold-dark" />
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">2nd Line (0.5%)</p>
              </div>
              <p className="font-numeric font-bold text-lg text-gold-dark">{formatNaira(indirectAvailable)}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border border-border flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Total Available</p>
            <p className="font-numeric font-bold text-xl text-foreground">{formatNaira(totalAvailable)}</p>
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
            This request will be reviewed and paid by our team after manual verification. Pending rewards (awaiting commitment approval) are not included.
          </p>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !canRequest}
            className="bg-gold hover:bg-gold-dark text-white border-0"
          >
            {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Submitting...</> : <>Request Withdrawal</>}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}