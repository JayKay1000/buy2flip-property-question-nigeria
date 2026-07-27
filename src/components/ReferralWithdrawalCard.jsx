import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNaira, formatDateTime } from "@/lib/format";
import { Wallet, Banknote, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import ReferralWithdrawDialog from "@/components/ReferralWithdrawDialog";

const HOLDING_DAYS = 30;
const HOLDING_MS = HOLDING_DAYS * 24 * 60 * 60 * 1000;

function useCountdown(targetMs) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!targetMs || targetMs <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [targetMs]);
  const remaining = Math.max(0, (targetMs || 0) - now);
  return {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining % 86400000) / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
    seconds: Math.floor((remaining % 60000) / 1000),
    done: remaining <= 0,
  };
}

export default function ReferralWithdrawalCard({ profile, referrals, requests, onSubmitted }) {
  const [open, setOpen] = useState(false);

  const isAvailable = (r) => (r.reward_amount || 0) > 0 && !r.withdrawn;
  const totalAvailable = referrals
    .filter(isAvailable)
    .reduce((s, r) => s + (r.reward_amount || 0), 0);

  const sorted = [...(requests || [])].sort(
    (a, b) => new Date(b.created_date) - new Date(a.created_date)
  );
  const activeRequest = sorted.find(
    (r) => r.status === "requested" || r.status === "processing"
  );
  const hasBank = !!(profile?.bank_name && profile?.account_number && profile?.account_name);

  const eligibleAt = activeRequest
    ? new Date(activeRequest.created_date).getTime() + HOLDING_MS
    : null;
  const { days, hours, minutes, seconds, done } = useCountdown(eligibleAt);

  const handleSubmitted = () => {
    setOpen(false);
    onSubmitted?.();
  };

  // Active countdown — payout is held for 30 days from the withdrawal request.
  if (activeRequest) {
    return (
      <Card className="p-5 sm:p-6 bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-gold" />
          <h2 className="font-heading font-semibold text-lg">Referral Payout Countdown</h2>
        </div>
        <p className="text-sm text-white/80 mb-4">
          Your withdrawal request of{" "}
          <span className="font-numeric font-semibold text-gold-light">
            {formatNaira(activeRequest.amount)}
          </span>{" "}
          is on a 30-day cooling-off period. The payout to your bank account is released
          only after the countdown completes and our team verifies it.
        </p>

        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
          {[
            { v: days, l: "Days" },
            { v: hours, l: "Hours" },
            { v: minutes, l: "Mins" },
            { v: seconds, l: "Secs" },
          ].map((u) => (
            <div key={u.l} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="font-numeric font-bold text-2xl sm:text-3xl text-white tabular-nums">
                {String(u.v).padStart(2, "0")}
              </p>
              <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider mt-1">
                {u.l}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-white/10 border border-white/15">
          {done ? (
            <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
          ) : (
            <Clock className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
          )}
          <p className="text-xs text-white/80">
            {done
              ? "Cooling-off period complete. Your payout is now eligible for disbursement and will be processed by our team shortly."
              : `Eligible for payout on ${formatDateTime(eligibleAt)}. Funds will be sent to ${
                  profile?.bank_name || "your bank"
                } ••${(profile?.account_number || "").slice(-4)} after verification.`}
          </p>
        </div>
      </Card>
    );
  }

  // Withdrawal entry point — placed close to the downline lists.
  return (
    <>
      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-5 h-5 text-gold-dark" />
          <h2 className="font-heading font-semibold text-lg text-foreground">
            Withdraw Your Referral Earnings
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
            <span className="font-medium text-foreground">30-day payout hold:</span> Referral
            earnings are held for a 30-day cooling-off period before disbursement. When you
            request a withdrawal, a 30-day countdown begins — your payout is released to your
            bank account only after the countdown completes and our team verifies it.
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
        onSubmitted={handleSubmitted}
        onRevert={() => {}}
      />
    </>
  );
}