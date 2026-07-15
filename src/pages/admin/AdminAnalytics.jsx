import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { formatNaira } from "@/lib/format";
import {
  TrendingUp, Banknote, Users, BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  format, parseISO, startOfMonth, endOfMonth,
  eachMonthOfInterval, isAfter, isBefore, isWithinInterval,
} from "date-fns";

const toMonthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const compactNaira = (v) => {
  if (v >= 1e9) return `₦${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `₦${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `₦${(v / 1e3).toFixed(0)}K`;
  return `₦${v}`;
};

function buildMonthlySeries(commitments, participants) {
  const dates = [];
  commitments.forEach((c) => {
    if (c.start_date) dates.push(parseISO(c.start_date));
    if (c.maturity_date) dates.push(parseISO(c.maturity_date));
    if (c.created_date) dates.push(new Date(c.created_date));
  });
  participants.forEach((p) => {
    if (p.created_date) dates.push(new Date(p.created_date));
  });
  if (!dates.length) return [];

  const min = startOfMonth(new Date(Math.min(...dates.map((d) => d.getTime()))));
  const maxBound = Math.max(...dates.map((d) => d.getTime()), Date.now());
  const max = endOfMonth(new Date(maxBound));
  const months = eachMonthOfInterval({ start: min, end: max });

  return months.map((m) => {
    const mStart = startOfMonth(m);
    const mEnd = endOfMonth(m);
    let activeCount = 0;
    let expectedPayout = 0;

    commitments.forEach((c) => {
      if (c.status === "cancelled" || c.status === "pending_payment") return;
      const s = c.start_date ? parseISO(c.start_date) : (c.created_date ? new Date(c.created_date) : null);
      const e = c.maturity_date ? parseISO(c.maturity_date) : null;
      if (!s) return;
      const started = !isAfter(s, mEnd);
      const stillActive = !e || !isBefore(e, mStart);
      if (started && stillActive) activeCount += 1;
      if (e && isWithinInterval(e, { start: mStart, end: mEnd })) {
        expectedPayout += c.expected_return || 0;
      }
    });

    const newSignups = participants.filter(
      (p) => p.created_date && isWithinInterval(new Date(p.created_date), { start: mStart, end: mEnd })
    ).length;

    return {
      key: toMonthKey(m),
      label: format(m, "MMM ''yy"),
      active: activeCount,
      payouts: expectedPayout,
      signups: newSignups,
    };
  });
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [commitments, setCommitments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [parts, comms] = await Promise.all([
        base44.entities.ParticipantProfile.list(),
        base44.entities.Commitment.list(),
      ]);
      setParticipants(parts);
      setCommitments(comms);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const series = useMemo(
    () => buildMonthlySeries(commitments, participants),
    [commitments, participants]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  const activeCommitments = commitments.filter((c) => c.status === "active");
  const totalExpectedPayouts = activeCommitments.reduce((s, c) => s + (c.expected_return || 0), 0);
  const now = new Date();
  const newSignupsThisMonth = participants.filter(
    (p) => p.created_date && isWithinInterval(new Date(p.created_date), { start: startOfMonth(now), end: endOfMonth(now) })
  ).length;

  const stats = [
    {
      label: "Total Active Commitments",
      value: activeCommitments.length,
      sub: formatNaira(activeCommitments.reduce((s, c) => s + (c.amount || 0), 0)),
      icon: TrendingUp,
      color: "text-brand",
      bg: "bg-brand/10",
    },
    {
      label: "Expected Payouts",
      value: formatNaira(totalExpectedPayouts),
      sub: `${activeCommitments.length} active plans`,
      icon: Banknote,
      color: "text-gold-dark",
      bg: "bg-gold/10",
    },
    {
      label: "New Signups (This Month)",
      value: newSignupsThisMonth,
      sub: `${participants.length} total participants`,
      icon: Users,
      color: "text-brand",
      bg: "bg-brand/10",
    },
  ];

  const hasData = series.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand" /> Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Track active commitments, expected payouts, and participant growth over time.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="font-numeric font-bold text-lg text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </Card>
        ))}
      </div>

      {!hasData ? (
        <Card className="p-12 text-center">
          <BarChart3 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-heading font-semibold text-foreground mb-1">No analytics data yet</h3>
          <p className="text-sm text-muted-foreground">
            Once commitments and participants are recorded, charts will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Active commitments over time */}
          <Card className="p-6 xl:col-span-2">
            <h2 className="font-heading font-semibold text-foreground mb-1">Active Commitments Over Time</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Number of commitments active during each month (excludes cancelled and pending payment).
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--brand))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  formatter={(v) => [v, "Active"]}
                  labelFormatter={(l) => `Month: ${l}`}
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="hsl(var(--brand))"
                  strokeWidth={2}
                  fill="url(#activeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Expected payouts by maturity month */}
          <Card className="p-6">
            <h2 className="font-heading font-semibold text-foreground mb-1">Expected Payouts by Maturity</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Expected returns due to mature each month.
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} tickFormatter={compactNaira} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  formatter={(v) => [formatNaira(v), "Expected Payout"]}
                  labelFormatter={(l) => `Month: ${l}`}
                />
                <Bar dataKey="payouts" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* New participant signups */}
          <Card className="p-6">
            <h2 className="font-heading font-semibold text-foreground mb-1">New Participant Signups</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Participant registrations per month.
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  formatter={(v) => [v, "New Signups"]}
                  labelFormatter={(l) => `Month: ${l}`}
                />
                <Bar dataKey="signups" fill="hsl(var(--brand))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}