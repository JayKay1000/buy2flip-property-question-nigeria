import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNaira, formatDate } from "@/lib/format";
import { REFERRAL_REWARDS } from "@/lib/plans";
import {
  Users, Copy, Check, Share2, Gift, TrendingUp, Clock,
  CheckCircle2, Link2, ChevronRight
} from "lucide-react";

export default function Referrals() {
  const [profile, setProfile] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState("");

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
        const refs = await base44.entities.Referral.filter({ referrer_code: p.referral_code });
        setReferrals(refs);
      }
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

  const referralCode = profile?.referral_code || "—";
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const directReferrals = referrals.filter((r) => r.level === 1);
  const indirectReferrals = referrals.filter((r) => r.level === 2);
  const paidRewards = referrals.filter((r) => r.status === "paid");
  const pendingRewards = referrals.filter((r) => r.status === "pending");
  const totalEarnings = paidRewards.reduce((sum, r) => sum + (r.reward_amount || 0), 0);

  const stats = [
    { label: "Total Referrals", value: referrals.length, icon: Users, color: "text-brand", bg: "bg-brand/10" },
    { label: "Pending Rewards", value: pendingRewards.length, icon: Clock, color: "text-gold-dark", bg: "bg-gold/10" },
    { label: "Paid Rewards", value: paidRewards.length, icon: CheckCircle2, color: "text-brand", bg: "bg-brand/10" },
    { label: "Total Earnings", value: formatNaira(totalEarnings), icon: TrendingUp, color: "text-gold-dark", bg: "bg-gold/10" },
  ];

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`Join me on Land Banking! Use my referral code: ${referralCode}. Register here: ${referralLink}`)}`,
    copy: referralLink,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Referrals</h1>
        <p className="text-muted-foreground mt-1">Invite others and earn rewards on their commitments.</p>
      </div>

      {/* Referral code + link card */}
      <Card className="p-6 mb-8 bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-gold" />
          <h2 className="font-heading font-semibold text-lg">Your Referral Code</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Referral Code</p>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
              <span className="font-numeric font-bold text-xl tracking-wide flex-1">{referralCode}</span>
              <button
                onClick={() => copyToClipboard(referralCode, "code")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copiedField === "code" ? <Check className="w-4 h-4 text-gold" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Referral Link</p>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
              <span className="text-sm truncate flex-1 text-white/80">{referralLink}</span>
              <button
                onClick={() => copyToClipboard(referralLink, "link")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copiedField === "link" ? <Check className="w-4 h-4 text-gold" /> : <Link2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
            <Button className="bg-gold hover:bg-gold-dark text-white border-0">
              <Share2 className="w-4 h-4 mr-2" /> Share on WhatsApp
            </Button>
          </a>
          <Button variant="outline" className="glass border-white/20 text-white hover:bg-white/10" onClick={() => copyToClipboard(referralLink, "link2")}>
            {copiedField === "link2" ? <><Check className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy Link</>}
          </Button>
        </div>
      </Card>

      {/* Reward info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">Direct Referrals</h3>
              <p className="text-xs text-muted-foreground">First Line</p>
            </div>
          </div>
          <p className="text-2xl font-numeric font-bold text-brand">{(REFERRAL_REWARDS.direct * 100).toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Reward on each commitment</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-gold-dark" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">Indirect Referrals</h3>
              <p className="text-xs text-muted-foreground">Second Line</p>
            </div>
          </div>
          <p className="text-2xl font-numeric font-bold text-gold-dark">{(REFERRAL_REWARDS.indirect * 100).toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Reward on each commitment</p>
        </Card>
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
          </Card>
        ))}
      </div>

      {/* Referral tree */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Direct referrals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-foreground">Direct Referrals</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-brand/10 text-brand font-medium">{(REFERRAL_REWARDS.direct * 100).toFixed(1)}%</span>
          </div>
          {directReferrals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No direct referrals yet. Share your code to get started.</p>
          ) : (
            <div className="space-y-3">
              {directReferrals.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.referred_name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.created_date)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === "paid" ? "bg-brand/10 text-brand" : "bg-gold/10 text-gold-dark"}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Indirect referrals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-foreground">Indirect Referrals</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold-dark font-medium">{(REFERRAL_REWARDS.indirect * 100).toFixed(1)}%</span>
          </div>
          {indirectReferrals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No indirect referrals yet.</p>
          ) : (
            <div className="space-y-3">
              {indirectReferrals.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-gold-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.referred_name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.created_date)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === "paid" ? "bg-brand/10 text-brand" : "bg-gold/10 text-gold-dark"}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}