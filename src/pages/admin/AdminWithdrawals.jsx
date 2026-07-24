import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira, formatDate } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Banknote, Search, CheckCircle2, Clock, X, Building2, Save, AlertCircle } from "lucide-react";

const statusConfig = {
  requested: { label: "Requested", color: "bg-gold/10 text-gold-dark", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700", icon: Clock },
  paid: { label: "Paid", color: "bg-brand/10 text-brand", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: X },
};

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "requested", label: "Requested" },
  { value: "processing", label: "Processing" },
  { value: "paid", label: "Paid" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [wd, parts, comms] = await Promise.all([
        base44.entities.WithdrawalRequest.list("-created_date"),
        base44.entities.ParticipantProfile.list(),
        base44.entities.Commitment.list(),
      ]);
      setWithdrawals(wd);
      setProfiles(parts);
      setCommitments(comms);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const findProfile = (userId) => profiles.find((p) => p.created_by_id === userId);
  const findCommitment = (id) => commitments.find((c) => c.id === id);

  const isEarlyWithdrawal = (commitment) => {
    if (!commitment?.maturity_date) return false;
    return new Date(commitment.maturity_date) > new Date();
  };

  // Exact payable amount per the early-withdrawal warning the participant accepted:
  // principal minus the 1% welcome package, with the entire expected return forfeited.
  const computePayable = (withdrawal, commitment) => {
    if (!commitment) return withdrawal.amount;
    const principal = commitment.amount || 0;
    if (isEarlyWithdrawal(commitment)) {
      const welcomePackage = principal * 0.01;
      return Math.max(0, Math.round(principal - welcomePackage));
    }
    return commitment.total_expected_value || withdrawal.amount;
  };

  const filtered = withdrawals.filter((w) => {
    const profile = findProfile(w.created_by_id);
    const name = profile?.full_name || "";
    const matchesSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      (w.account_number || "").includes(search);
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openEdit = (w) => {
    setEditing(w);
    setNewStatus(w.status);
    setAdminNotes(w.admin_notes || "");
  };

  const saveStatus = async () => {
    setSaving(true);
    try {
      const editingCommitment = findCommitment(editing.commitment_id);
      const payableAmount = computePayable(editing, editingCommitment);
      const updateData = { status: newStatus, admin_notes: adminNotes };
      if (newStatus === "paid" || newStatus === "rejected") {
        updateData.processed_at = new Date().toISOString();
      }
      // Persist the exact agreed payout amount (early-withdrawal adjusted) on the record.
      updateData.amount = payableAmount;
      await base44.entities.WithdrawalRequest.update(editing.id, updateData);
      if (newStatus === "paid" && editing.commitment_id) {
        await base44.entities.Commitment.update(editing.commitment_id, { status: "completed" });
      }
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

  const pendingCount = withdrawals.filter((w) => w.status === "requested").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Withdrawal Requests</h1>
        <p className="text-muted-foreground mt-1">Review and process participant withdrawal requests.</p>
      </div>

      {pendingCount > 0 && (
        <Card className="p-4 mb-6 border-gold/40 bg-gold/5 flex items-center gap-3">
          <Clock className="w-5 h-5 text-gold-dark" />
          <p className="text-sm font-medium text-foreground">
            {pendingCount} withdrawal request{pendingCount > 1 ? "s" : ""} awaiting processing.
          </p>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or account number..."
              className="w-full pl-9 pr-3 h-10 rounded-md border border-input bg-transparent text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Banknote className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No withdrawal requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Participant</th>
                  <th className="px-4 py-3 font-medium">Commitment</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Bank Details</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => {
                  const profile = findProfile(w.created_by_id);
                  const commitment = findCommitment(w.commitment_id);
                  return (
                    <tr key={w.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{profile?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{profile?.phone_number}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{commitment?.plan_name || "—"} Plan</p>
                        <p className="text-xs text-muted-foreground">{formatDate(w.created_date)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-numeric font-medium text-foreground">{formatNaira(computePayable(w, commitment))}</p>
                        {isEarlyWithdrawal(commitment) ? (
                          <span className="text-[10px] font-medium text-destructive">Early · ROI forfeited</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Matured</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-foreground">{w.bank_name}</p>
                        <p className="text-xs text-muted-foreground font-numeric">{w.account_number}</p>
                        <p className="text-xs text-muted-foreground">{w.account_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[w.status]?.color || ""}`}>
                          {statusConfig[w.status]?.label || w.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(w)}>Process</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editing && (() => {
        const editingCommitment = findCommitment(editing.commitment_id);
        const editingEarly = isEarlyWithdrawal(editingCommitment);
        const editingPayable = computePayable(editing, editingCommitment);
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setEditing(null)} />
          <Card className="relative z-10 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-heading font-semibold text-foreground mb-1">Process Withdrawal Request</h3>
            <p className="text-sm text-muted-foreground mb-4">
              <span className="font-numeric font-semibold text-foreground">{formatNaira(editingPayable)}</span>
              <span className="ml-1">to be paid</span>
            </p>

            {editingEarly && (
              <div className="p-3 mb-4 rounded-lg bg-destructive/5 border border-destructive/30 space-y-1.5">
                <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Early Withdrawal — Adjusted Payout
                </p>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Original Commitment</span><span className="font-numeric font-medium">{formatNaira(editingCommitment?.amount || 0)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Forfeited ROI</span><span className="font-numeric font-medium text-destructive">− {formatNaira(editingCommitment?.expected_return ?? Math.max(0, (editingCommitment?.total_expected_value || 0) - (editingCommitment?.amount || 0)))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">1% Welcome Package</span><span className="font-numeric font-medium text-destructive">− {formatNaira((editingCommitment?.amount || 0) * 0.01)}</span></div>
                  <div className="flex justify-between pt-1 border-t border-destructive/20"><span className="font-medium text-foreground">Payable Amount</span><span className="font-numeric font-bold text-foreground">{formatNaira(editingPayable)}</span></div>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1">Per the early-withdrawal warning the participant accepted, only the adjusted amount may be processed.</p>
              </div>
            )}

            <div className="space-y-3 mb-4">
              <div className="p-3 rounded-lg border border-border bg-muted/20">
                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand" /> Payment Destination
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span className="font-medium text-foreground">{editing.bank_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Account No.</span><span className="font-numeric font-medium text-foreground">{editing.account_number}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Account Name</span><span className="font-medium text-foreground">{editing.account_name}</span></div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the participant or internal use..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="flex-1 bg-brand hover:bg-brand-dark" onClick={saveStatus} disabled={saving || newStatus === editing.status}>
                {saving ? "Saving..." : <><Save className="w-4 h-4 mr-1" /> Save</>}
              </Button>
            </div>
          </Card>
        </div>
        );
      })()}
    </div>
  );
}