import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNaira, formatDate } from "@/lib/format";
import { REFERRAL_REWARDS } from "@/lib/plans";
import {
  Users, TrendingUp, Clock, ArrowLeft, Gift,
  Network, ChevronRight, Wallet, Search, Banknote,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import ReferralWithdrawDialog from "@/components/ReferralWithdrawDialog";
import { availableToWithdraw, alreadyRequestedAmount } from "@/lib/referralEarnings";

export default function ReferralAnalytics() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.ParticipantProfile.filter({ created_by_id: me.id });
      const p = profiles[0] || null;
      setProfile(p);
      if (p?.referral_code) {
        const refs = await base44.entities.Referral.filter({ referrer_code: p.referral_code }, "-created_date");
        setReferrals(refs);
      }
      try {
        const reqs = await base44.entities.WithdrawalRequest.filter({ created_by_id: me.id }, "-created_date");
        setRequests(reqs.filter((r) => r.request_type === "referral"));
      } catch { /* requests unavailable */ }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  const direct = referrals.filter((r) => r.level === 1);
  const indirect = referrals.filter((r) => r.level === 2);
  // "Accrued" = reward computed & not yet withdrawn (available to claim).
  // "Awaiting" = referral recorded but the referred commitment isn't verified yet.
  const isAccrued = (r) => (r.reward_amount || 0) > 0 && !r.withdrawn;
  const isAwaiting = (r) => (r.reward_amount || 0) === 0 && !r.withdrawn;
  const directEarnings = direct.filter(isAccrued).reduce((s, r) => s + (r.reward_amount || 0), 0);
  const indirectEarnings = indirect.filter(isAccrued).reduce((s, r) => s + (r.reward_amount || 0), 0);
  const directPending = direct.filter(isAwaiting).reduce((s, r) => s + (r.reward_amount || 0), 0);
  const indirectPending = indirect.filter(isAwaiting).reduce((s, r) => s + (r.reward_amount || 0), 0);
  const totalEarnings = directEarnings + indirectEarnings;

  const isAvailable = isAccrued;
  const directAvailable = directEarnings;
  const indirectAvailable = indirectEarnings;
  // Withdrawable = accrued minus amounts already locked in active referral
  // withdrawal requests, so a participant cannot re-request what they have
  // already withdrawn. Recurring: each new request subtracts from the running
  // balance, and new rewards that accrue after a request become withdrawable.
  const alreadyRequested = alreadyRequestedAmount(requests);
  const totalAvailable = availableToWithdraw(referrals, requests);

  const searchQuery = search.trim().toLowerCase();
  const matchesSearch = (r) => !searchQuery || (r.referred_name || "").toLowerCase().includes(searchQuery);
  const directShown = direct.filter(matchesSearch);
  const indirectShown = indirect.filter(matchesSearch);

  const handleWithdrawSubmitted = () => {
    toast({ title: "Withdrawal requested", description: "Your referral earnings withdrawal is pending admin approval." });
    loadData();
  };

  const stats = [
    { label: "Direct Referrals", value: direct.length, sub: "1st level", icon: Users, color: "text-brand", bg: "bg-brand/10" },
    { label: "Indirect Referrals", value: indirect.length, sub: "2nd level", icon: Network, color: "text-gold-dark", bg: "bg-gold/10" },
    { label: "Total Earnings", value: formatNaira(totalEarnings), sub: "earned to date", icon: TrendingUp, color: "text-brand", bg: "bg-brand/10" },
    { label: "Pending Rewards", value: formatNaira(directPending + indirectPending), sub: "awaiting commitment approval", icon: Clock, color: "text-gold-dark", bg: "bg-gold/10" },
  ];

  const chartData = [
    { name: "Direct (2%)", paid: directEarnings, pending: directPending },
    { name: "Indirect (0.5%)", paid: indirectEarnings, pending: indirectPending },
  ];

  const renderBranch = (list, accent) =>
    list.length === 0 ? (
      <p className="text-sm text-muted-foreground py-6 text-center">No referrals in this line yet.</p>
    ) : (
      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <div className={`w-9 h-9 rounded-full ${accent} flex items-center justify-center flex-shrink-0`}>
              <Users className="w-4 h-4 text-current" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{r.referred_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(r.created_date)} · {formatNaira(r.commitment_amount || 0)} committed
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-numeric font-medium text-foreground">{formatNaira(r.reward_amount || 0)}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.withdrawn ? "bg-brand/10 text-brand" : "bg-gold/10 text-gold-dark"}`}>
                {r.withdrawn ? "paid" : "pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link to="/referrals" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Referrals
        </Link>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Referral Analytics</h1>
        <p className="text-muted-foreground mt-1">A detailed breakdown of your downline and earnings across both referral levels.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your downline by name..."
          className="pl-9 h-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="font-numeric font-bold text-lg text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stat.sub}</p>
          </Card>
        ))}
      </div>

      {/* Entitlement + withdraw */}
      <Card className="p-6 mb-8 bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2"><Wallet className="w-5 h-5 text-gold" /> Your Referral Entitlement</h2>
            <p className="text-sm text-white/70 mt-1">Amounts you are entitled to withdraw, computed by level.</p>
          </div>
          <Button onClick={() => setWithdrawOpen(true)} disabled={totalAvailable <= 0} className="bg-gold hover:bg-gold-dark text-white border-0 w-full sm:w-auto">
            <Banknote className="w-4 h-4 mr-2" /> Withdraw Referral Earnings
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-white/60 text-xs">1st Line Available (2%)</p>
            <p className="font-numeric font-bold text-lg mt-1">{formatNaira(directAvailable)}</p>
          </div>
          <div className="bg-gold/20 rounded-xl p-4 border border-gold/30">
            <p className="text-gold-light text-xs">2nd Line Available (0.5%)</p>
            <p className="font-numeric font-bold text-lg mt-1">{formatNaira(indirectAvailable)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-white/60 text-xs">Available to Withdraw Now</p>
            <p className="font-numeric font-bold text-lg mt-1">{formatNaira(totalAvailable)}</p>
          </div>
        </div>
        {alreadyRequested > 0 && (
          <div className="mt-3 flex items-center justify-between bg-gold/15 border border-gold/30 rounded-xl px-4 py-3">
            <p className="text-xs text-white/80">Already requested (pending payout)</p>
            <p className="font-numeric font-semibold text-sm text-gold-light">− {formatNaira(alreadyRequested)}</p>
          </div>
        )}
        {totalAvailable <= 0 && (
          <p className="text-xs text-white/60 mt-3">No withdrawable referral earnings yet. Your accrued rewards are either already covered by an active withdrawal request or awaiting commitment verification.</p>
        )}
      </Card>

      {/* Earnings chart */}
      <Card className="p-6 mb-8">
        <h2 className="font-heading font-semibold text-foreground mb-4">Earnings by Level</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={64} />
              <Tooltip
                formatter={(v) => formatNaira(v)}
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Bar dataKey="paid" name="Earned" fill="hsl(var(--brand))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pending" name="Awaiting Approval" fill="hsl(var(--gold))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand" /> Earned</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gold" /> Awaiting Approval</span>
        </div>
      </Card>

      {/* Downline trees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand" />
              <h2 className="font-heading font-semibold text-foreground">1st Level Downline</h2>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-brand/10 text-brand font-medium">
              {(REFERRAL_REWARDS.direct * 100).toFixed(1)}% · {formatNaira(directEarnings)} earned
            </span>
          </div>
          {renderBranch(directShown, "bg-brand/10 text-brand")}
          {direct.length > 0 && (
            <Link to="/referrals" className="mt-4 flex items-center justify-center gap-1 text-sm text-brand font-medium hover:underline">
              Manage referral code <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-gold-dark" />
              <h2 className="font-heading font-semibold text-foreground">2nd Level Downline</h2>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold-dark font-medium">
              {(REFERRAL_REWARDS.indirect * 100).toFixed(1)}% · {formatNaira(indirectEarnings)} earned
            </span>
          </div>
          {renderBranch(indirectShown, "bg-gold/10 text-gold-dark")}
        </Card>
      </div>

      {/* CTA */}
      <Card className="p-6 mt-8 bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-5 h-5 text-gold" />
          <h2 className="font-heading font-semibold text-lg">Grow your downline</h2>
        </div>
        <p className="text-sm text-white/70 mb-4">
          Share your referral code to earn 2% on direct commitments and 0.5% on your second line.
        </p>
        <Link to="/referrals">
          <Button className="bg-gold hover:bg-gold-dark text-white border-0">
            <Users className="w-4 h-4 mr-2" /> Get my referral code
          </Button>
        </Link>
      </Card>

      <ReferralWithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        profile={profile}
        referrals={referrals}
        requests={requests}
        onSubmitted={handleWithdrawSubmitted}
        onRevert={() => {}}
      />
    </div>
  );
}