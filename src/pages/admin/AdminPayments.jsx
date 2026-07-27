import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatNaira, formatDate } from "@/lib/format";
import { isSafeUrl } from "@/lib/urlSafe";
import {
  CreditCard, Clock, CheckCircle2, X, FileText, ExternalLink,
  AlertCircle, Building2, Gift
} from "lucide-react";

const statusFilters = [
  { value: "pending", label: "Pending", icon: Clock, color: "text-gold-dark" },
  { value: "confirmed", label: "Confirmed", icon: CheckCircle2, color: "text-brand" },
  { value: "rejected", label: "Rejected", icon: X, color: "text-destructive" },
];

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pays, comms, parts] = await Promise.all([
        base44.entities.Payment.list(),
        base44.entities.Commitment.list(),
        base44.entities.ParticipantProfile.list(),
      ]);
      setPayments(pays);
      setCommitments(comms);
      setProfiles(parts);
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
        try {
          await base44.functions.invoke("applyReferralRewards", { commitmentId: payment.commitment_id });
        } catch {}
      }
      await loadData();
      setSelected(null);
    } catch {
    } finally {
      setProcessing(false);
    }
  };

  const rejectPayment = async (payment) => {
    setProcessing(true);
    try {
      await base44.entities.Payment.update(payment.id, {
        status: "rejected",
        rejection_reason: rejectReason || "Payment could not be verified",
      });
      await loadData();
      setSelected(null);
      setShowReject(false);
      setRejectReason("");
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

  const filtered = payments.filter((p) => p.status === filter);
  const counts = {
    pending: payments.filter((p) => p.status === "pending").length,
    confirmed: payments.filter((p) => p.status === "confirmed").length,
    rejected: payments.filter((p) => p.status === "rejected").length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Payment Evidence</h1>
        <p className="text-muted-foreground mt-1">Review uploaded payment evidence and approve commitments.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {statusFilters.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              filter === tab.value ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className={`w-4 h-4 ${filter === tab.value ? tab.color : ""}`} />
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === tab.value ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground"}`}>
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No {filter} payments.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((payment) => {
            const commitment = findCommitment(payment.commitment_id);
            const profile = commitment ? findProfile(commitment.created_by_id) : null;
            return (
              <Card key={payment.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">{profile?.full_name || "Unknown participant"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(payment.created_date)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    payment.status === "pending" ? "bg-gold/10 text-gold-dark" :
                    payment.status === "confirmed" ? "bg-brand/10 text-brand" : "bg-destructive/10 text-destructive"
                  }`}>{payment.status}</span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-numeric font-medium text-foreground">{formatNaira(payment.amount)}</span>
                  </div>
                  {commitment && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan</span>
                      <span className="text-foreground">{commitment.plan_name} ({commitment.plan_duration_months}mo)</span>
                    </div>
                  )}
                  {commitment && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">1% Welcome Package</span>
                      <span className="font-numeric font-medium text-gold-dark">{formatNaira((commitment.amount || 0) * 0.01)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account</span>
                    <span className="text-foreground text-xs">{payment.company_account_number}</span>
                  </div>
                </div>

                {payment.status === "pending" && commitment && (
                  <div className="mb-4 p-3 rounded-lg bg-gold/5 border border-gold/20 flex items-start gap-2">
                    <Gift className="w-4 h-4 text-gold-dark flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      This commitment includes a 1% welcome package ({formatNaira((commitment.amount || 0) * 0.01)}). Approving this payment only activates the commitment — it does <span className="font-medium text-foreground">not</span> pay the welcome package. The participant must separately request it, and you will approve that request under Withdrawal Requests.
                    </p>
                  </div>
                )}

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

                {payment.status === "rejected" && payment.rejection_reason && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {payment.rejection_reason}
                  </div>
                )}

                {payment.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-brand hover:bg-brand-dark"
                      onClick={() => approvePayment(payment)}
                      disabled={processing}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-destructive hover:bg-destructive/10"
                      onClick={() => { setSelected(payment); setShowReject(true); }}
                      disabled={processing}
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {selected && showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => { setShowReject(false); setSelected(null); }} />
          <Card className="relative z-10 w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <X className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">Reject Payment</h3>
                <p className="text-xs text-muted-foreground">Provide a reason for rejection.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Payment amount does not match commitment..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setShowReject(false); setSelected(null); setRejectReason(""); }}>Cancel</Button>
                <Button className="flex-1 bg-destructive hover:bg-destructive/90" onClick={() => rejectPayment(selected)} disabled={processing}>
                  {processing ? "Rejecting..." : "Confirm Rejection"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}