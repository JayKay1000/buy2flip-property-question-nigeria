import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNaira, formatDate } from "@/lib/format";
import {
  Users, CreditCard, TrendingUp, CheckCircle2, Clock, AlertCircle,
  ArrowRight, Award, Banknote, Download, Loader2
} from "lucide-react";
import {
  downloadCsv, participantColumns, commitmentColumns,
} from "@/lib/exportCsv";
import { liveCommitments } from "@/lib/commitmentStatus";

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const [parts, comms] = await Promise.all([
        base44.entities.ParticipantProfile.list(),
        base44.entities.Commitment.list(),
      ]);
      const stamp = new Date().toISOString().split("T")[0];
      downloadCsv(`participants-${stamp}.csv`, participantColumns, parts);
      setTimeout(() => downloadCsv(`commitments-${stamp}.csv`, commitmentColumns, comms), 400);
    } catch {
    } finally {
      setExporting(false);
    }
  };

  const loadData = async () => {
    try {
      const [parts, comms, pays, wd] = await Promise.all([
        base44.entities.ParticipantProfile.list(),
        base44.entities.Commitment.list(),
        base44.entities.Payment.list(),
        base44.entities.WithdrawalRequest.list(),
      ]);
      setParticipants(parts);
      setCommitments(comms);
      setPayments(pays);
      setWithdrawals(wd);
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
  const completedCommitments = commitments.filter((c) => c.status === "completed");
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "requested");
  const totalCommitted = activeCommitments.reduce((s, c) => s + (c.amount || 0), 0);
  const projectedReturns = activeCommitments.reduce((s, c) => s + (c.expected_return || 0), 0);

  const stats = [
    { label: "Total Participants", value: participants.length, icon: Users, color: "text-brand", bg: "bg-brand/10" },
    { label: "Active Plans", value: activeCommitments.length, icon: TrendingUp, color: "text-gold-dark", bg: "bg-gold/10" },
    { label: "Completed Plans", value: completedCommitments.length, icon: Award, color: "text-brand", bg: "bg-brand/10" },
    { label: "Pending Confirmations", value: pendingPayments.length, icon: Clock, color: "text-gold-dark", bg: "bg-gold/10" },
    { label: "Withdrawal Requests", value: pendingWithdrawals.length, icon: Banknote, color: "text-brand", bg: "bg-brand/10" },
    { label: "Total Committed", value: formatNaira(totalCommitted), icon: CreditCard, color: "text-brand", bg: "bg-brand/10" },
    { label: "Projected Returns", value: formatNaira(projectedReturns), icon: TrendingUp, color: "text-gold-dark", bg: "bg-gold/10" },
  ];

  const recentCommitments = liveCommitments(commitments).slice(0, 8);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Admin Overview</h1>
            <p className="text-muted-foreground mt-1">Platform-wide statistics and recent activity.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Exporting...</> : <><Download className="w-4 h-4 mr-1.5" /> Export Records (CSV)</>}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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

      {/* Quick actions */}
      {pendingPayments.length > 0 && (
        <Card className="p-5 mb-4 border-gold/40 bg-gold/5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gold-dark flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">{pendingPayments.length} payment(s) awaiting verification</p>
              <p className="text-xs text-muted-foreground mt-0.5">Review and approve pending payment evidence.</p>
            </div>
          </div>
          <Link to="/admin/payments">
            <Button variant="outline" size="sm">Review Now <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </Card>
      )}

      {pendingWithdrawals.length > 0 && (
        <Card className="p-5 mb-8 border-brand/40 bg-brand/5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <Banknote className="w-5 h-5 text-brand flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">{pendingWithdrawals.length} withdrawal request(s) awaiting processing</p>
              <p className="text-xs text-muted-foreground mt-0.5">Review participant bank details and process payments.</p>
            </div>
          </div>
          <Link to="/admin/withdrawals">
            <Button variant="outline" size="sm">Process Now <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </Card>
      )}

      {/* Recent commitments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-foreground">Recent Commitments</h2>
          <Link to="/admin/commitments">
            <Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </div>
        {recentCommitments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No commitments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentCommitments.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-foreground">{c.plan_name}</td>
                    <td className="py-3 font-numeric text-foreground">{formatNaira(c.amount)}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.status === "active" ? "bg-brand/10 text-brand" :
                        c.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        c.status === "pending_payment" ? "bg-gold/10 text-gold-dark" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {c.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{formatDate(c.created_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}