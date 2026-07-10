import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNaira, formatDate } from "@/lib/format";
import {
  Users, Search, Phone, Mail, Building2, CreditCard, Ban,
  CheckCircle2, X, Receipt
} from "lucide-react";
import PaymentEvidenceCard from "@/components/admin/PaymentEvidenceCard";

export default function AdminParticipants() {
  const [participants, setParticipants] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [parts, comms, pays] = await Promise.all([
        base44.entities.ParticipantProfile.list(),
        base44.entities.Commitment.list(),
        base44.entities.Payment.list(),
      ]);
      setParticipants(parts);
      setCommitments(comms);
      setPayments(pays);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (p) => {
    const newStatus = p.status === "suspended" ? "active" : "suspended";
    await base44.entities.ParticipantProfile.update(p.id, { status: newStatus });
    loadData();
    setSelected({ ...p, status: newStatus });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = participants.filter((p) =>
    !search ||
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone_number?.includes(search) ||
    p.referral_code?.toLowerCase().includes(search.toLowerCase())
  );

  const getParticipantCommitments = (participantId) =>
    commitments.filter((c) => c.created_by_id === participantId);

  const getCommitmentPayments = (commitmentId) =>
    payments.filter((p) => p.commitment_id === commitmentId);

  const approvePayment = async (payment) => {
    setProcessing(true);
    try {
      await base44.entities.Payment.update(payment.id, {
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      });
      if (payment.commitment_id) {
        await base44.entities.Commitment.update(payment.commitment_id, { status: "active" });
      }
      await loadData();
    } catch {
    } finally {
      setProcessing(false);
    }
  };

  const rejectPayment = async (payment, reason) => {
    setProcessing(true);
    try {
      await base44.entities.Payment.update(payment.id, {
        status: "rejected",
        rejection_reason: reason,
      });
      await loadData();
    } catch {
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Participants</h1>
          <p className="text-muted-foreground mt-1">{participants.length} registered participants</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No participants found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Phone</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Referral Code</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{p.full_name}</p>
                      <p className="text-xs text-muted-foreground">{p.created_by_id?.slice(0, 8)}...</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.phone_number}</td>
                    <td className="px-4 py-3 font-numeric text-foreground hidden md:table-cell">{p.referral_code}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === "active" ? "bg-brand/10 text-brand" :
                        p.status === "suspended" ? "bg-destructive/10 text-destructive" :
                        "bg-gold/10 text-gold-dark"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(p.created_date)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(p)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setSelected(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-2xl overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-background border-b border-border p-5 flex items-center justify-between z-10">
              <h2 className="font-heading font-semibold text-foreground">Participant Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-brand" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">{selected.full_name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    selected.status === "active" ? "bg-brand/10 text-brand" :
                    selected.status === "suspended" ? "bg-destructive/10 text-destructive" : "bg-gold/10 text-gold-dark"
                  }`}>{selected.status}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{selected.phone_number}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-numeric">Referral: {selected.referral_code}</span>
                </div>
                {selected.bank_name && (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{selected.bank_name} — {selected.account_number}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-7">Account: {selected.account_name}</p>
                  </>
                )}
                {selected.referred_by_code && (
                  <p className="text-xs text-muted-foreground">Referred by: {selected.referred_by_code}</p>
                )}
                <p className="text-xs text-muted-foreground">Joined: {formatDate(selected.created_date)}</p>
              </div>

              {/* Commitments & Payment Evidence */}
              <div>
                <h4 className="font-heading font-semibold text-sm text-foreground mb-3">Commitments & Payment Evidence</h4>
                {getParticipantCommitments(selected.created_by_id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No commitments.</p>
                ) : (
                  <div className="space-y-4">
                    {getParticipantCommitments(selected.created_by_id).map((c) => {
                      const commPayments = getCommitmentPayments(c.id);
                      return (
                        <div key={c.id} className="border border-border rounded-lg p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{c.plan_name} Plan</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              c.status === "active" ? "bg-brand/10 text-brand" :
                              c.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                              c.status === "pending_payment" ? "bg-gold/10 text-gold-dark" :
                              "bg-destructive/10 text-destructive"
                            }`}>{c.status.replace(/_/g, " ")}</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-numeric">{formatNaira(c.amount)} → {formatNaira(c.total_expected_value)}</p>
                          {commPayments.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <Receipt className="w-3.5 h-3.5" /> Payment Evidence ({commPayments.length})
                              </p>
                              {commPayments.map((pmt) => (
                                <PaymentEvidenceCard
                                  key={pmt.id}
                                  payment={pmt}
                                  onApprove={approvePayment}
                                  onReject={rejectPayment}
                                  processing={processing}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No payment evidence uploaded.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <Button
                className={`w-full h-12 ${selected.status === "suspended" ? "bg-brand hover:bg-brand-dark" : "bg-destructive hover:bg-destructive/90"}`}
                onClick={() => toggleStatus(selected)}
              >
                {selected.status === "suspended" ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Reactivate Account</>
                ) : (
                  <><Ban className="w-4 h-4 mr-2" /> Suspend Account</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}