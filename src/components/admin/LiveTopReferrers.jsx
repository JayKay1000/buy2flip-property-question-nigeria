import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { formatNaira } from "@/lib/format";
import { Loader2, Trophy } from "lucide-react";

export default function LiveTopReferrers() {
  const [referrals, setReferrals] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [refs, parts] = await Promise.all([
          base44.entities.Referral.list(),
          base44.entities.ParticipantProfile.list(),
        ]);
        setReferrals(refs);
        setProfiles(parts);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const top10 = useMemo(() => {
    const codeToProfile = Object.create(null);
    profiles.forEach((p) => {
      if (p.referral_code) codeToProfile[p.referral_code] = p;
    });

    const agg = Object.create(null);
    referrals.forEach((r) => {
      const code = r.referrer_code;
      if (!code) return;
      if (!agg[code]) {
        agg[code] = {
          referral_code: code,
          total_referrals: 0,
          total_earnings: 0,
          paid_count: 0,
        };
      }
      agg[code].total_referrals += 1;
      agg[code].total_earnings += r.reward_amount || 0;
      if (r.status === "paid") agg[code].paid_count += 1;
    });

    return Object.values(agg)
      .sort((a, b) => b.total_earnings - a.total_earnings || b.total_referrals - a.total_referrals)
      .slice(0, 10)
      .map((a, i) => ({
        rank: i + 1,
        ...a,
        name: codeToProfile[a.referral_code]?.full_name || "Unknown",
      }));
  }, [referrals, profiles]);

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-gold" />
        <h2 className="font-heading font-semibold text-foreground">Current Top 10 Referrers</h2>
        <span className="ml-auto text-xs text-muted-foreground">Live · updated in real time</span>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : top10.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No referral activity yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="pb-3 pr-3 font-medium w-10">#</th>
                <th className="pb-3 pr-3 font-medium">Participant</th>
                <th className="pb-3 pr-3 font-medium">Referral Code</th>
                <th className="pb-3 pr-3 font-medium text-right">Referrals</th>
                <th className="pb-3 pr-3 font-medium text-right">Paid Out</th>
                <th className="pb-3 font-medium text-right">Total Earnings</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((entry) => {
                const medal = entry.rank === 1 ? "bg-gold text-white" : entry.rank === 2 ? "bg-muted-foreground text-white" : entry.rank === 3 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground";
                return (
                  <tr key={entry.referral_code} className="border-b border-border last:border-0">
                    <td className="py-3 pr-3">
                      <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center font-numeric font-bold text-xs ${medal}`}>{entry.rank}</span>
                    </td>
                    <td className="py-3 pr-3 font-medium text-foreground">{entry.name}</td>
                    <td className="py-3 pr-3 font-numeric text-muted-foreground">{entry.referral_code}</td>
                    <td className="py-3 pr-3 text-right font-numeric text-foreground">{entry.total_referrals}</td>
                    <td className="py-3 pr-3 text-right font-numeric text-muted-foreground">{entry.paid_count}</td>
                    <td className="py-3 text-right font-numeric font-semibold text-gold-dark">{formatNaira(entry.total_earnings)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}