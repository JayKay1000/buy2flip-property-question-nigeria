import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNaira, formatDate, daysBetween } from "@/lib/format";
import { PLANS } from "@/lib/plans";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Search, CheckCircle2, Clock, Award, Ban, Save, Receipt } from "lucide-react";
import PaymentEvidenceCard from "@/components/admin/PaymentEvidenceCard";

const statuses = [
  { value: "pending_payment", label: "Pending Payment" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminCommitments() {
  const [commitments, setCommitments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [comms, parts, pays] = await Promise.all([
        base44.entities.Commitment.list("-created_date"),
        base44.entities.ParticipantProfile.list(),
        base44.entities.Payment.list(),
      ]);
      setCommitments(comms);
      setProfiles(parts);
      setPayments(pays);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const findProfile = (userId) => profiles.find((p) => p.created_by_id === userId);

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
        setEditing(null);
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

  const saveStatus = async () => {
    setSaving(true);
    try {
      await base44.entities.Commitment.update(editing.id, { status: newStatus });
      await loadData();
      setEditing(null);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = commitments.filter((c) => {
    const profile = findProfile(c.created_by_id);
    const matchesSearch = !search ||
      profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.plan_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Commitments</h1>
        <p className="text-muted-foreground mt-1">{commitments.length} total commitments</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by participant or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 w-full sm:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <TrendingUp className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No commitments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Participant</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Maturity</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Evidence</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const profile = findProfile(c.created_by_id);
                  const daysLeft = c.status === "active" ? daysBetween(new Date(), c.maturity_date) : null;
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{profile?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{profile?.phone_number}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{c.plan_name}</p>
                        <p className="text-xs text-muted-foreground">{c.plan_duration_months}mo · {(c.plan_return_rate * 100).toFixed(0)}%</p>
                      </td>
                      <td className="px-4 py-3 font-numeric text-foreground">{formatNaira(c.amount)}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-foreground">{formatDate(c.maturity_date)}</p>
                        {daysLeft !== null && <p className="text-xs text-muted-foreground">{daysLeft} days left</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.status === "active" ? "bg-brand/10 text-brand" :
                          c.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                          c.status === "pending_payment" ? "bg-gold/10 text-gold-dark" : "bg-destructive/10 text-destructive"
                        }`}>{c.status.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {(() => {
                          const commPays = getCommitmentPayments(c.id);
                          if (commPays.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
                          const hasPending = commPays.some((p) => p.status === "pending");
                          return (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                              hasPending ? "bg-gold/10 text-gold-dark" : "bg-brand/10 text-brand"
                            }`}>
                              <Receipt className="w-3 h-3" /> {commPays.length} {hasPending ? "pending" : "reviewed"}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setEditing(c); setNewStatus(c.status); }}>Update</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit status modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setEditing(null)} />
          <Card className="relative z-10 w-full max-w-md p-6">
            <h3 className="font-heading font-semibold text-foreground mb-1">Update Commitment Status</h3>
            <p className="text-sm text-muted-foreground mb-4">{editing.plan_name} Plan — {formatNaira(editing.amount)}</p>
            <div className="space-y-2">
              <Label className="text-sm font-medium">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Payment Evidence */}
            {(() => {
              const commPayments = getCommitmentPayments(editing.id);
              return commPayments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Receipt className="w-4 h-4" /> Payment Evidence ({commPayments.length})
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
              );
            })()}

            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="flex-1 bg-brand hover:bg-brand-dark" onClick={saveStatus} disabled={saving || newStatus === editing.status}>
                {saving ? "Saving..." : <><Save className="w-4 h-4 mr-1" /> Save</>}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}