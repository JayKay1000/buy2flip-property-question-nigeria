import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira, formatDate } from "@/lib/format";
import { isSafeUrl } from "@/lib/urlSafe";
import {
  CreditCard, Clock, CheckCircle2, X, ExternalLink, AlertCircle,
  Gift, Building2, ShieldCheck, Loader2,
} from "lucide-react";

export default function AdminVerification() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("payments");
  const [payments, setPayments] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectKind, setRejectKind] = useState("payment");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pays, comms, parts, wd] = await Promise.all([
        base44.entities.Payment.list("-created_date"),
        base44.entities.Commitment.list(),
        base44.entities.ParticipantProfile.list(),
        base44.entities.WithdrawalRequest.list("-created_date"),
      ]);
      setPayments(pays);
      setCommitments(comms);
      setProfiles(parts);
      setWithdrawals(wd);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const findCommitment = (id) => commitments.find((c) => c.id === id);
  const findProfile = (userId) => profiles.find((p) => p.created_by_id === userId);

  const approvePayment = async (payment) => {
    setProcessing(true);
    try {
      await base44.entities.Payment.update(payment.id, {
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      });
      if (payment.commitment_id) {
        await base44.entities.Commitment.update(payment.commitment_id, { status: "active" });
        try { await base44.functions.invoke("applyReferralRewards", { commitmentId: payment.commitment_id }); } catch {}
      }
      await loadData();
    } catch {
    } finally {
      setProcessing(false);
    }
  };

  const rejectPayment = async () => {
    setProcessing(true);
    try {
      await base44.entities.Payment.update(rejectTarget.id, {
        status: "rejected",
        rejection_reason: rejectReason || "Payment could not be verified",
      });
      setRejectTarget(null);
      setRejectReason("");
      await loadData();
    } catch {
    } finally {
      setProcessing(false);
    }
  };

  const approveWelcome = async (withdrawal) => {
    setProcessing(true);
    try {
      await base44.entities.WithdrawalRequest.update(withdrawal.id, {
        status: "paid",
        processed_at: new Date().toISOString(),
      });
      if (withdrawal.commitment_id) {
        await base44.entities.Commitment.update(withdrawal.commitment_id, { welcome_package_withdrawn: true });
      }
      await loadData();
    } catch {
    } finally {
      setProcessing(false);
    }
  };

  const rejectWelcome = async () => {
    setProcessing(true);
    try {
      await base44.entities.WithdrawalRequest.update(rejectTarget.id, {
        status: "rejected",
        processed_at: new Date().toISOString(),
        admin_notes: rejectReason || "Welcome package request rejected",
      });
      setRejectTarget(null);
      setRejectReason("");
      await loadData();
    } catch {
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  const pendingPayments = payments.filter((p) => p.status === "pending");
  const pendingWelcome = withdrawals.filter(
    (w) => w.request_type === "welcome_package" && w.status === "requested"
  );

  const tabs = [
    { value: "payments", label: "Payment Verification", count: pendingPayments.length, icon: CreditCard },
    { value: "welcome", label: "Welcome Package Payouts", count: pendingWelcome.length, icon: Gift },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-6 h-6 text-brand" />
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Verification Portal</h1>
        </div>
        <p className="text-muted-foreground mt-1">Manually verify commitment payments and approve 1% welcome package withdrawals.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === t.value ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className={`w-4 h-4 ${tab === t.value ? "text-brand" : ""}`} />
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.value ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {tab === "payments" && (
        pendingPayments.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-brand/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No payments awaiting verification.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingPayments.map((payment) => {
              const commitment = findCommitment(payment.commitment_id);
              const profile = commitment ? findProfile(commitment.created_by_id) : null;
              return (
                <Card key={payment.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">{profile?.full_name || "Unknown participant"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(payment.created_date)}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gold/10 text-gold-dark">pending</span>
                  </div>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-numeric font-medium text-foreground">{formatNaira(payment.amount)}</span>
                    </div>
                    {commitment && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan</span>
                          <span className="text-foreground">{commitment.plan_name} ({commitment.plan_duration_months}mo)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">1% Welcome Package</span>
                          <span className="font-numeric font-medium text-gold-dark">{formatNaira((commitment.amount || 0) * 0.01)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company Account</span>
                      <span className="text-foreground text-xs font-numeric">{payment.company_account_number}</span>
                    </div>
                  </div>
                  {payment.evidence_url && (
                    <div className="mb-4">
                      {isSafeUrl(payment.evidence_url) ? (
                        <a href={payment.evidence_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="w-3.5 h-3.5 mr-2" /> View Evidence
                          </Button>
                        </a>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          <ExternalLink className="w-3.5 h-3.5 mr-2" /> Invalid evidence link
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="p-3 mb-4 rounded-lg bg-gold/5 border border-gold/20 flex items-start gap-2">
                    <Gift className="w-4 h-4 text-gold-dark flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Approving only activates the commitment. The 1% welcome package is paid separately after the participant requests it.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-brand hover:bg-brand-dark" onClick={() => approvePayment(payment)} disabled={processing}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Verify & Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-destructive hover:bg-destructive/10"
                      onClick={() => { setRejectTarget(payment); setRejectKind("payment"); setRejectReason(""); }} disabled={processing}>
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {tab === "welcome" && (
        pendingWelcome.length === 0 ? (
          <Card className="p-12 text-center">
            <Gift className="w-10 h-10 text-gold-dark/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No welcome package payout requests pending.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingWelcome.map((w) => {
              const commitment = findCommitment(w.commitment_id);
              const profile = findProfile(w.created_by_id);
              return (
                <Card key={w.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">{profile?.full_name || "Unknown participant"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(w.created_date)}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gold/10 text-gold-dark">welcome package</span>
                  </div>
                  <div className="p-3 mb-4 rounded-lg bg-gold/5 border border-gold/20 flex items-start gap-2">
                    <Gift className="w-4 h-4 text-gold-dark flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Participant's upfront 1% welcome package. Verify the commitment is active before paying.
                      Full commitment and ROI remain payable at maturity.
                    </p>
                  </div>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payout Amount</span>
                      <span className="font-numeric font-bold text-gold-dark">{formatNaira(w.amount)}</span>
                    </div>
                    {commitment && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Commitment</span>
                        <span className="text-foreground">{commitment.plan_name} · {formatNaira(commitment.amount)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-muted/20 mb-4">
                    <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-brand" /> Payment Destination
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span className="font-medium text-foreground">{w.bank_name}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Account No.</span><span className="font-numeric font-medium text-foreground">{w.account_number}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Account Name</span><span className="font-medium text-foreground">{w.account_name}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-gold hover:bg-gold-dark text-white border-0" onClick={() => approveWelcome(w)} disabled={processing}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Approve Payout
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-destructive hover:bg-destructive/10"
                      onClick={() => { setRejectTarget(w); setRejectKind("welcome"); setRejectReason(""); }} disabled={processing}>
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => { setRejectTarget(null); setRejectReason(""); }} />
          <Card className="relative z-10 w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <X className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">
                  {rejectKind === "payment" ? "Reject Payment" : "Reject Welcome Package"}
                </h3>
                <p className="text-xs text-muted-foreground">Provide a reason for rejection.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Payment amount does not match commitment..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Cancel</Button>
                <Button className="flex-1 bg-destructive hover:bg-destructive/90" onClick={rejectKind === "payment" ? rejectPayment : rejectWelcome} disabled={processing}>
                  {processing ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Rejecting...</> : "Confirm Rejection"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}