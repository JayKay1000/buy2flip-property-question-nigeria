import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNaira, formatDateTime, formatDate } from "@/lib/format";
import {
  Banknote, Clock, CheckCircle2, X, Building2, Loader2, RefreshCw, ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

const statusConfig = {
  requested: { label: "Requested", color: "bg-gold/10 text-gold-dark border-gold/30", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Loader2 },
  paid: { label: "Paid", color: "bg-brand/10 text-brand border-brand/30", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/30", icon: X },
};

const steps = ["requested", "processing", "paid"];

export default function WithdrawalStatus() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [wd, comms] = await Promise.all([
        base44.entities.WithdrawalRequest.list("-created_date"),
        base44.entities.Commitment.list(),
      ]);
      setWithdrawals(wd);
      setCommitments(comms);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime updates
  useEffect(() => {
    const unsubscribe = base44.entities.WithdrawalRequest.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const findCommitment = (id) => commitments.find((c) => c.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  const pending = withdrawals.filter((w) => w.status === "requested" || w.status === "processing");
  const resolved = withdrawals.filter((w) => w.status === "paid" || w.status === "rejected");

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Withdrawal Status</h1>
          <p className="text-muted-foreground mt-1">Track your withdrawal requests in real time — from approval to disbursement.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {withdrawals.length === 0 ? (
        <Card className="p-10 text-center">
          <Banknote className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-foreground mb-1">No withdrawal requests yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            When you request a withdrawal from a commitment, you'll see its status and disbursement progress here.
          </p>
          <Link to="/portfolio">
            <Button className="bg-brand hover:bg-brand-dark">Go to Portfolio</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Pending requests with progress tracker */}
          {pending.length > 0 && (
            <section>
              <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold-dark" /> In Progress
                <span className="text-sm font-normal text-muted-foreground">({pending.length})</span>
              </h2>
              <div className="space-y-4">
                {pending.map((w) => (
                  <PendingRequestCard key={w.id} withdrawal={w} commitment={findCommitment(w.commitment_id)} />
                ))}
              </div>
            </section>
          )}

          {/* Resolved requests */}
          {resolved.length > 0 && (
            <section>
              <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand" /> History
                <span className="text-sm font-normal text-muted-foreground">({resolved.length})</span>
              </h2>
              <div className="space-y-3">
                {resolved.map((w) => (
                  <ResolvedCard key={w.id} withdrawal={w} commitment={findCommitment(w.commitment_id)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <div className="mt-8">
        <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-dark font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>
      </div>
    </div>
  );
}

function PendingRequestCard({ withdrawal, commitment }) {
  const cfg = statusConfig[withdrawal.status] || statusConfig.requested;
  const currentStepIndex = steps.indexOf(withdrawal.status);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <p className="font-heading font-semibold text-foreground text-lg">
            {commitment?.plan_name ? `${commitment.plan_name} Plan` : "Withdrawal Request"}
          </p>
          <p className="text-sm text-muted-foreground">Requested on {formatDateTime(withdrawal.created_date)}</p>
        </div>
        <p className="font-numeric font-bold text-xl text-brand">{formatNaira(withdrawal.amount)}</p>
      </div>

      {/* Progress tracker */}
      <div className="mb-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-border -z-0" />
          <div
            className="absolute top-4 left-0 h-0.5 bg-brand transition-all duration-500 -z-0"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step, idx) => {
            const StatusIcon = statusConfig[step].icon;
            const isComplete = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step} className="flex flex-col items-center gap-2 relative z-10 bg-card px-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    isComplete
                      ? "bg-brand border-brand text-white"
                      : isCurrent
                      ? "bg-brand/10 border-brand text-brand"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {isCurrent && withdrawal.status === "processing" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <StatusIcon className="w-4 h-4" />
                  )}
                </div>
                <span className={`text-xs font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                  {statusConfig[step].label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status + bank details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-3 rounded-lg border border-border bg-muted/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Current Status</p>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.color}`}>
            {cfg.label}
          </span>
          <p className="text-xs text-muted-foreground mt-2">
            {withdrawal.status === "requested"
              ? "Your request has been received and is awaiting admin review."
              : "Your request has been approved and payment is being processed."}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-muted/20">
          <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-brand" /> Disbursement Account
          </p>
          <div className="space-y-0.5 text-sm">
            <p className="text-foreground">{withdrawal.bank_name}</p>
            <p className="text-muted-foreground font-numeric text-xs">{withdrawal.account_number}</p>
            <p className="text-muted-foreground text-xs">{withdrawal.account_name}</p>
          </div>
        </div>
      </div>

      {withdrawal.admin_notes && (
        <div className="mt-4 p-3 rounded-lg border border-gold/30 bg-gold/5">
          <p className="text-xs font-medium text-gold-dark uppercase tracking-wider mb-1">Admin Disbursement Note</p>
          <p className="text-sm text-foreground">{withdrawal.admin_notes}</p>
        </div>
      )}
    </Card>
  );
}

function ResolvedCard({ withdrawal, commitment }) {
  const cfg = statusConfig[withdrawal.status] || statusConfig.paid;
  const StatusIcon = cfg.icon;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">
              {commitment?.plan_name ? `${commitment.plan_name} Plan` : "Withdrawal Request"}
            </p>
            <p className="text-xs text-muted-foreground">
              {withdrawal.status === "paid"
                ? `Disbursed on ${formatDate(withdrawal.processed_at)}`
                : `Declined on ${formatDate(withdrawal.processed_at)}`}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-numeric font-semibold text-foreground">{formatNaira(withdrawal.amount)}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>
      {withdrawal.admin_notes && (
        <div className="mt-3 p-3 rounded-lg border border-border bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {withdrawal.status === "rejected" ? "Reason" : "Disbursement Note"}
          </p>
          <p className="text-sm text-foreground">{withdrawal.admin_notes}</p>
        </div>
      )}
    </Card>
  );
}