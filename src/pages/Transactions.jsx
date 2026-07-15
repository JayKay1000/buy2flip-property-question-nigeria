import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { formatNaira, formatDateTime } from "@/lib/format";
import {
  ArrowDownCircle, ArrowUpCircle, RefreshCw, CreditCard, Banknote,
  TrendingUp, Clock, CheckCircle2, XCircle, FileText, Receipt
} from "lucide-react";

const paymentStatusConfig = {
  confirmed: { label: "Confirmed", color: "bg-brand/10 text-brand", icon: CheckCircle2 },
  pending: { label: "Pending", color: "bg-gold/10 text-gold-dark", icon: Clock },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const withdrawalStatusConfig = {
  paid: { label: "Paid", color: "bg-brand/10 text-brand", icon: CheckCircle2 },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700", icon: RefreshCw },
  requested: { label: "Requested", color: "bg-gold/10 text-gold-dark", icon: Clock },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const commitmentStatusConfig = {
  active: { label: "Activated", color: "bg-brand/10 text-brand", icon: TrendingUp },
  pending_payment: { label: "Commitment Created", color: "bg-gold/10 text-gold-dark", icon: FileText },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

export default function Transactions() {
  const [payments, setPayments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      const [pays, wds, comms] = await Promise.all([
        base44.entities.Payment.filter({ created_by_id: me.id }, "-created_date"),
        base44.entities.WithdrawalRequest.filter({ created_by_id: me.id }, "-created_date"),
        base44.entities.Commitment.filter({ created_by_id: me.id }, "-created_date"),
      ]);
      setPayments(pays);
      setWithdrawals(wds);
      setCommitments(comms);
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

  // Build a unified timeline of transaction events
  const events = [
    ...payments.map((p) => ({
      id: p.id,
      type: "payment",
      date: p.created_date,
      title: "Payment Submitted",
      amount: p.amount,
      status: p.status,
      detail: p.confirmed_at ? `Confirmed ${formatDateTime(p.confirmed_at)}` : (p.rejection_reason || "Awaiting verification"),
    })),
    ...withdrawals.map((w) => ({
      id: w.id,
      type: "withdrawal",
      date: w.created_date,
      title: "Withdrawal Request",
      amount: w.amount,
      status: w.status,
      detail: w.bank_name ? `${w.bank_name} ••${(w.account_number || "").slice(-4)}` : "Bank details pending",
    })),
    ...commitments.map((c) => ({
      id: c.id,
      type: "commitment",
      date: c.created_date,
      title: `${c.plan_name} Plan Commitment`,
      amount: c.amount,
      status: c.status,
      detail: `${c.plan_duration_months || "—"} months • ${formatNaira(c.total_expected_value || 0)} expected at maturity`,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);

  const typeConfig = {
    payment: { icon: CreditCard, accent: "text-brand", bg: "bg-brand/10" },
    withdrawal: { icon: Banknote, accent: "text-gold-dark", bg: "bg-gold/10" },
    commitment: { icon: TrendingUp, accent: "text-brand", bg: "bg-brand/10" },
  };

  const filters = [
    { value: "all", label: "All" },
    { value: "payment", label: "Payments" },
    { value: "withdrawal", label: "Withdrawals" },
    { value: "commitment", label: "Commitments" },
  ];

  const totalPaidIn = payments.filter((p) => p.status === "confirmed").reduce((s, p) => s + (p.amount || 0), 0);
  const totalWithdrawn = withdrawals.filter((w) => w.status === "paid").reduce((s, w) => s + (w.amount || 0), 0);

  const stats = [
    { label: "Total Paid In", value: formatNaira(totalPaidIn), icon: ArrowDownCircle, color: "text-brand", bg: "bg-brand/10" },
    { label: "Total Withdrawn", value: formatNaira(totalWithdrawn), icon: ArrowUpCircle, color: "text-gold-dark", bg: "bg-gold/10" },
    { label: "Transactions", value: events.length, icon: Receipt, color: "text-brand", bg: "bg-brand/10" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Transaction History</h1>
        <p className="text-muted-foreground mt-1">A complete record of your payments, withdrawals, and commitment status changes.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value
                ? "bg-brand text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <Card className="p-6">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No transactions to display.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-5">
              {filtered.map((e) => {
                const cfg = typeConfig[e.type];
                const StatusIcon = e.type === "payment"
                  ? paymentStatusConfig[e.status]?.icon
                  : e.type === "withdrawal"
                  ? withdrawalStatusConfig[e.status]?.icon
                  : commitmentStatusConfig[e.status]?.icon;
                const statusLabel = e.type === "payment"
                  ? paymentStatusConfig[e.status]?.label
                  : e.type === "withdrawal"
                  ? withdrawalStatusConfig[e.status]?.label
                  : commitmentStatusConfig[e.status]?.label;
                const statusColor = e.type === "payment"
                  ? paymentStatusConfig[e.status]?.color
                  : e.type === "withdrawal"
                  ? withdrawalStatusConfig[e.status]?.color
                  : commitmentStatusConfig[e.status]?.color;
                return (
                  <div key={`${e.type}-${e.id}`} className="relative flex gap-4 pl-0">
                    <div className={`relative z-10 w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <cfg.icon className={`w-5 h-5 ${cfg.accent}`} />
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm">{e.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{e.detail}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">{formatDateTime(e.date)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-numeric font-semibold text-sm text-foreground">
                            {e.type === "withdrawal" ? "-" : ""}{formatNaira(e.amount || 0)}
                          </p>
                          {statusLabel && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${statusColor}`}>
                              {StatusIcon && <StatusIcon className="w-3 h-3" />}
                              {statusLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}