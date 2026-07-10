import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNaira, formatDate, daysBetween } from "@/lib/format";
import { REFERRAL_REWARDS } from "@/lib/plans";
import {
  Wallet, TrendingUp, Calendar, Users, Bell, Download, LifeBuoy,
  ArrowRight, CheckCircle2, Clock, AlertCircle, Building2, Phone, Mail,
  Plus, Award
} from "lucide-react";
import PullToRefresh from "@/components/PullToRefresh";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.ParticipantProfile.filter({ created_by_id: me.id });
      const p = profiles[0] || null;
      setProfile(p);
      const comms = await base44.entities.Commitment.filter({ created_by_id: me.id }, "-created_date");
      setCommitments(comms);
      const anns = await base44.entities.Announcement.filter({ active: true }, "-created_date", 5);
      setAnnouncements(anns);
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

  const activeCommitments = commitments.filter((c) => c.status === "active");
  const pendingCommitments = commitments.filter((c) => c.status === "pending_payment");
  const currentCommitment = activeCommitments[0];
  const referralEarnings = referrals.filter((r) => r.status === "paid").reduce((sum, r) => sum + (r.reward_amount || 0), 0);
  const pendingRewards = referrals.filter((r) => r.status === "pending").length;
  const portfolioValue = activeCommitments.reduce((sum, c) => sum + (c.total_expected_value || 0), 0);
  const totalCommitted = activeCommitments.reduce((sum, c) => sum + (c.amount || 0), 0);

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const stats = [
    {
      label: "Current Plan",
      value: currentCommitment?.plan_name || "None",
      sub: currentCommitment ? `${(currentCommitment.plan_return_rate * 100).toFixed(0)}% expected return` : "No active plan",
      icon: TrendingUp,
      color: "text-brand",
      bg: "bg-brand/10",
    },
    {
      label: "Commitment Amount",
      value: formatNaira(currentCommitment?.amount || totalCommitted),
      sub: currentCommitment ? `Active since ${formatDate(currentCommitment.start_date)}` : "No active commitments",
      icon: Wallet,
      color: "text-gold-dark",
      bg: "bg-gold/10",
    },
    {
      label: "Expected Return",
      value: formatNaira(currentCommitment?.expected_return || 0),
      sub: currentCommitment ? `Total: ${formatNaira(currentCommitment.total_expected_value)}` : "—",
      icon: Award,
      color: "text-brand",
      bg: "bg-brand/10",
    },
    {
      label: "Maturity Date",
      value: currentCommitment ? formatDate(currentCommitment.maturity_date) : "—",
      sub: currentCommitment ? `${daysBetween(new Date(), currentCommitment.maturity_date)} days remaining` : "—",
      icon: Calendar,
      color: "text-gold-dark",
      bg: "bg-gold/10",
    },
    {
      label: "Referral Earnings",
      value: formatNaira(referralEarnings),
      sub: `${referrals.length} referrals · ${pendingRewards} pending`,
      icon: Users,
      color: "text-brand",
      bg: "bg-brand/10",
    },
    {
      label: "Payment Status",
      value: pendingCommitments.length > 0 ? "Action Needed" : "Verified",
      sub: pendingCommitments.length > 0 ? `${pendingCommitments.length} pending payment(s)` : "All payments confirmed",
      icon: pendingCommitments.length > 0 ? AlertCircle : CheckCircle2,
      color: pendingCommitments.length > 0 ? "text-destructive" : "text-brand",
      bg: pendingCommitments.length > 0 ? "bg-destructive/10" : "bg-brand/10",
    },
  ];

  return (
    <PullToRefresh onRefresh={loadData}>
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Welcome Back, {firstName} 👋</h1>
        </div>
        <Link to="/plans">
          <Button className="bg-brand hover:bg-brand-dark">
            <Plus className="w-4 h-4 mr-2" /> New Commitment
          </Button>
        </Link>
      </div>

      {/* Profile completion banner */}
      {profile && !profile.bank_name && (
        <Card className="mb-6 p-5 border-gold/40 bg-gold/5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-gold-dark flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">Complete your banking details</p>
              <p className="text-xs text-muted-foreground mt-0.5">Add your bank information for future disbursements.</p>
            </div>
          </div>
          <Link to="/portfolio"><Button variant="outline" size="sm">Update Now</Button></Link>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="font-numeric font-bold text-xl text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - announcements + recent activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcements */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand" />
                <h2 className="font-heading font-semibold text-foreground">Latest Announcements</h2>
              </div>
            </div>
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No announcements yet.</p>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ann.category === "alert" ? "bg-destructive" : ann.category === "update" ? "bg-gold" : "bg-brand"}`} />
                    <div>
                      <p className="font-medium text-sm text-foreground">{ann.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ann.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Activities */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-foreground">Recent Activities</h2>
              <Link to="/portfolio"><Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
            </div>
            {commitments.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No activities yet. Start your first commitment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {commitments.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 py-2">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.status === "active" ? "bg-brand/10" : c.status === "completed" ? "bg-gold/10" : "bg-muted"}`}>
                      {c.status === "active" ? <CheckCircle2 className="w-4 h-4 text-brand" /> : c.status === "completed" ? <Award className="w-4 h-4 text-gold-dark" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{c.plan_name} Plan — {formatNaira(c.amount)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{c.status.replace(/_/g, " ")}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(c.created_date)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column - relationship officer + support + certificate */}
        <div className="space-y-6">
          {/* Relationship Officer */}
          <Card className="p-6">
            <h2 className="font-heading font-semibold text-foreground mb-4">Your Relationship Officer</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-brand" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{profile?.relationship_officer || "Assigned Officer"}</p>
                <p className="text-xs text-muted-foreground">Property Question Nigeria Ltd</p>
              </div>
            </div>
            <div className="space-y-2">
              <a href="tel:+2349033393000" className="flex items-center gap-2 text-sm text-foreground hover:text-brand transition-colors">
                <Phone className="w-4 h-4 text-muted-foreground" /> +234 903 339 3000
              </a>
              <a href="mailto:info@propertyquestion.net" className="flex items-center gap-2 text-sm text-foreground hover:text-brand transition-colors">
                <Mail className="w-4 h-4 text-muted-foreground" /> info@propertyquestion.net
              </a>
            </div>
          </Card>

          {/* Support Chat */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <LifeBuoy className="w-5 h-5 text-brand" />
              <h2 className="font-heading font-semibold text-foreground">Need Help?</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Our support team is here to assist you with any questions.</p>
            <Link to="/support">
              <Button variant="outline" className="w-full">Open Support Centre</Button>
            </Link>
          </Card>

          {/* Download Certificate */}
          {currentCommitment && (
            <Card className="p-6 bg-gradient-to-br from-brand to-brand-dark text-white">
              <Award className="w-8 h-8 text-gold mb-3" />
              <h2 className="font-heading font-semibold text-lg mb-2">Commitment Certificate</h2>
              <p className="text-sm text-white/70 mb-4">Download your official commitment certificate.</p>
              <Link to="/portfolio">
                <Button className="w-full bg-gold hover:bg-gold-dark text-white border-0">
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
}