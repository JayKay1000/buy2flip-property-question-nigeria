import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatNaira, formatDate } from "@/lib/format";
import { Users, Loader2, Gift } from "lucide-react";

export default function UserReferralsList({ referralCode }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!referralCode) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const list = await base44.entities.Referral.list("-created_date");
        setReferrals(list);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();

    // Real-time: refresh whenever any referral record changes.
    const unsubscribe = base44.entities.Referral.subscribe(() => load());
    return () => {
      unsubscribe?.();
    };
  }, [referralCode]);

  if (!referralCode) {
    return <p className="text-sm text-muted-foreground">No referral code on file.</p>;
  }

  if (loading) {
    return <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  const level1 = referrals.filter((r) => r.referrer_code === referralCode && r.level === 1);
  const level2 = referrals.filter((r) => r.referrer_code === referralCode && r.level === 2);
  const level1Earnings = level1.reduce((s, r) => s + (r.reward_amount || 0), 0);
  const level2Earnings = level2.reduce((s, r) => s + (r.reward_amount || 0), 0);

  const renderRow = (r) => (
    <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{r.referred_name || r.referred_email || "Participant"}</p>
        <p className="text-xs text-muted-foreground">{formatDate(r.created_date)}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-numeric font-medium text-foreground">{formatNaira(r.reward_amount || 0)}</p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.withdrawn ? "bg-brand/10 text-brand" : "bg-gold/10 text-gold-dark"}`}>
          {r.withdrawn ? "paid" : "pending"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 1st-line referrals */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-brand" /> 1-Line Referrals
          </h4>
          <span className="text-xs text-muted-foreground">{level1.length} · {formatNaira(level1Earnings)}</span>
        </div>
        {level1.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 text-center">No direct referrals yet.</p>
        ) : (
          <div className="border border-border rounded-lg px-3">
            {level1.map(renderRow)}
          </div>
        )}
      </div>

      {/* 2nd-line referrals */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2">
            <Gift className="w-4 h-4 text-gold-dark" /> 2-Line Referrals
          </h4>
          <span className="text-xs text-muted-foreground">{level2.length} · {formatNaira(level2Earnings)}</span>
        </div>
        {level2.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 text-center">No indirect referrals yet.</p>
        ) : (
          <div className="border border-border rounded-lg px-3">
            {level2.map(renderRow)}
          </div>
        )}
      </div>
    </div>
  );
}