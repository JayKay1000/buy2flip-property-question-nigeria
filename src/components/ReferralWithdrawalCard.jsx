import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { Wallet, Banknote, Clock, AlertCircle } from "lucide-react";
import ReferralWithdrawDialog from "@/components/ReferralWithdrawDialog";
import ReferralPayoutCountdownCard from "@/components/ReferralPayoutCountdownCard";
import { availableToWithdraw } from "@/lib/referralEarnings";

export default function ReferralWithdrawalCard({ profile, referrals, requests, onSubmitted }) {
  const [open, setOpen] = useState(false);

  // Withdrawable balance subtracts rewards already locked in active
  // (requested/processing) referral withdrawal requests.
  const totalAvailable = availableToWithdraw(referrals, requests);

  // Every active (not-yet-resolved) referral withdrawal request gets its own
  // 30-day cooling-off countdown, ordered oldest-first, so a later
  // withdrawal's timer never overwrites the first one's.
  const activeRequests = (requests || [])
    .filter((r) => r.request_type === "referral" && (r.status === "requested" || r.status === "processing"))
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  const hasBank = !!(profile?.bank_name && profile?.account_number && profile?.account_name);

  const handleSubmitted = () => {
    setOpen(false);
    onSubmitted?.();
  };

  return (
    <>
      {/* One 30-day countdown per active referral withdrawal request, oldest first. */}
      {activeRequests.map((req) => (
        <div key={req.id} className="mb-6">
          <ReferralPayoutCountdownCard request={req} profile={profile} />
        </div>
      ))}

      {/* Withdrawal entry point — shown whenever there are rewards not already
          locked in an active request, even while a payout countdown is running. */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-5 h-5 text-gold-dark" />
          <h2 className="font-heading font-semibold text-lg text-foreground">
            {activeRequests.length > 0 ? "Withdraw New Referral Earnings" : "Withdraw Your Referral Earnings"}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          You have{" "}
          <span className="font-numeric font-semibold text-foreground">
            {formatNaira(totalAvailable)}
          </span>{" "}
          in accrued referral rewards available to withdraw.
        </p>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-gold/5 border border-gold/30 mb-4">
          <Clock className="w-4 h-4 text-gold-dark flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/80">
            <span className="font-medium text-foreground">30-day payout hold:</span> You will
            receive your referral earnings in your bank account 30 days after you request a
            withdrawal. When you withdraw, a 30-day countdown begins — the payout is released
            to your bank only after the countdown completes and our team verifies it.
          </p>
        </div>

        {!hasBank && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/30 mb-4">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">
              Add your bank details in Portfolio before requesting a referral payout.
            </p>
          </div>
        )}

        <Button
          onClick={() => setOpen(true)}
          disabled={totalAvailable <= 0 || !hasBank}
          className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-white border-0"
        >
          <Banknote className="w-4 h-4 mr-2" /> Withdraw Referral Earnings
        </Button>
      </Card>

      <ReferralWithdrawDialog
        open={open}
        onOpenChange={setOpen}
        profile={profile}
        referrals={referrals}
        requests={requests}
        onSubmitted={handleSubmitted}
        onRevert={() => {}}
      />
    </>
  );
}