import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNaira, formatDate } from "@/lib/format";
import {
  Users, CreditCard, TrendingUp, Banknote, Clock, ArrowRight,
  UserPlus, AlertCircle, Gift,
} from "lucide-react";
import ParticipantReferralNetwork from "@/components/admin/ParticipantReferralNetwork";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [parts, comms, wd, pays, refs] = await Promise.all([
        base44.entities.ParticipantProfile.list("-created_date"),
        base44.entities.Commitment.list(),
        base44.entities.WithdrawalRequest.list(),
        base44.entities.Payment.list(),
        base44.entities.Referral.list("-created_date"),
      ]);
      setParticipants(parts);
      setCommitments(comms);
      setWithdrawals(wd);
      setPayments(pays);
      setReferrals(refs);
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
  const totalCommitted = activeCommitments.reduce((s, c) => s + (c.amount || 0), 0);
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "requested");
  const pendingPayoutTotal = pendingWithdrawals.reduce((s, w) => s + (w.amount || 0), 0);
  const welcomePending = pendingWithdrawals.filter((w) => w.request_type === "welcome_package").length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const recentSignups = participants.slice(0, 8);

  const stats = [
    { label: "Total Committed", value: formatNaira(totalCommitted), icon: CreditCard, color: "text-brand", bg: "bg-brand/10" },
    { label: "Active Commitments", value: activeCommitments.length, icon: TrendingUp, color: "text-gold-dark", bg: "bg-gold/10" },
    { label: "Pending Withdrawals", value: pendingWithdrawals.length, icon: Banknote, color: "text-brand", bg: "bg-brand/10" },
    { label: "Pending Payout Value", value: formatNaira(pendingPayoutTotal), icon: Clock, color: "text-gold-dark", bg: "bg-gold/10" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor commitments, pending payouts, and recent signups at a glance.</p>
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

      {/* Verification quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card className="p-5 border-gold/40 bg-gold/5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gold-dark flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">{pendingPayments} payment(s) awaiting verification</p>
              <p className="text-xs text-muted-foreground mt-0.5">Verify commitment payments to activate portfolios.</p>
            </div>
          </div>
          <Link to="/admin-verification">
            <Button variant="outline" size="sm">Verify <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </Card>
        <Card className="p-5 border-brand/40 bg-brand/5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-brand flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">{welcomePending} welcome package payout(s) requested</p>
              <p className="text-xs text-muted-foreground mt-0.5">Approve 1% welcome package withdrawals.</p>
            </div>
          </div>
          <Link to="/admin-verification">
            <Button variant="outline" size="sm">Review <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending withdrawals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-foreground">Pending Withdrawal Requests</h2>
            <Link to="/admin/withdrawals">
              <Button variant="ghost" size="sm">All <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
          {pendingWithdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No pending withdrawal requests.</p>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.slice(0, 5).map((w) => (
                <div key={w.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatNaira(w.amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(w.created_date)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    w.request_type === "welcome_package" ? "bg-gold/10 text-gold-dark" : "bg-brand/10 text-brand"
                  }`}>
                    {w.request_type === "welcome_package" ? "Welcome Package" : "Maturity"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent signups */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-brand" /> Recent User Signups
            </h2>
            <Link to="/admin/participants">
              <Button variant="ghost" size="sm">All <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
          {recentSignups.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No participants yet.</p>
          ) : (
            <div className="space-y-3">
              {recentSignups.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.full_name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(p.created_date)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    p.status === "active" ? "bg-brand/10 text-brand" :
                    p.status === "suspended" ? "bg-destructive/10 text-destructive" :
                    "bg-gold/10 text-gold-dark"
                  }`}>{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Participant referral network with CSV export */}
      <ParticipantReferralNetwork participants={participants} referrals={referrals} />
    </div>
  );
}