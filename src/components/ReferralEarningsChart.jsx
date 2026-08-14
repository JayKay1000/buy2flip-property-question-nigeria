import React, { useMemo } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { formatNaira } from "@/lib/format";
import { TrendingUp } from "lucide-react";

// Compact cumulative-earnings trend for the referral dashboard.
// Earned = cumulative gross rewards across referrals (by referral date);
// Withdrawn = cumulative admin-processed referral payouts (by request date).
const dayKey = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const dayLabel = (key) => {
  const [y, m, d] = key.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs space-y-1">
      <p className="font-medium text-foreground">{payload[0]?.payload?.label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-numeric font-medium text-foreground">{formatNaira(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

export default function ReferralEarningsChart({ referrals = [], requests = [] }) {
  const data = useMemo(() => {
    const points = {};
    const ensure = (key) => {
      if (!points[key]) points[key] = { key, earned: 0, withdrawn: 0 };
      return points[key];
    };
    (referrals || []).forEach((r) => {
      const key = dayKey(r.created_date);
      if (!key) return;
      ensure(key).earned += r.reward_amount || 0;
    });
    (requests || [])
      .filter((r) => r.request_type === "referral")
      .forEach((r) => {
        const key = dayKey(r.created_date);
        if (!key) return;
        ensure(key).withdrawn += r.amount || 0;
      });

    const sorted = Object.values(points).sort((a, b) => a.key.localeCompare(b.key));
    let runE = 0, runW = 0;
    return sorted.map((p) => {
      runE += p.earned;
      runW += p.withdrawn;
      return { key: p.key, label: dayLabel(p.key), earned: runE, withdrawn: runW };
    });
  }, [referrals, requests]);

  const hasData = data.length > 0;

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-5 h-5 text-brand" />
        <h2 className="font-heading font-semibold text-foreground">Earnings Trend</h2>
        <span className="ml-auto text-xs text-muted-foreground">Cumulative over time</span>
      </div>
      {!hasData ? (
        <div className="py-10 text-center">
          <TrendingUp className="w-9 h-9 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Your earnings trend will appear here once you start earning referral rewards.</p>
        </div>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradEarned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradWithdrawn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                minTickGap={20}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="earned"
                stroke="hsl(var(--brand))"
                strokeWidth={2}
                fill="url(#gradEarned)"
                name="Earned"
              />
              <Area
                type="monotone"
                dataKey="withdrawn"
                stroke="hsl(var(--gold))"
                strokeWidth={2}
                fill="url(#gradWithdrawn)"
                name="Withdrawn"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {hasData && (
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand" />
            <span className="text-muted-foreground">Earned</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gold" />
            <span className="text-muted-foreground">Withdrawn</span>
          </span>
        </div>
      )}
    </Card>
  );
}