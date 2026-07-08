import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNaira, formatDate, daysBetween } from "@/lib/format";
import { generateCommitmentCertificate } from "@/lib/certificate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NIGERIAN_BANKS } from "@/lib/nigerianBanks";
import {
  Wallet, TrendingUp, Calendar, Download, Award, CheckCircle2,
  Clock, FileText, Plus, Building2, Save
} from "lucide-react";

export default function Portfolio() {
  const [profile, setProfile] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bank_name: "", account_number: "", account_name: "", preferred_receiving_bank: "" });
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.ParticipantProfile.filter({ created_by_id: me.id });
      const p = profiles[0] || null;
      setProfile(p);
      if (p) {
        setBankForm({
          bank_name: p.bank_name || "",
          account_number: p.account_number || "",
          account_name: p.account_name || "",
          preferred_receiving_bank: p.preferred_receiving_bank || "",
        });
      }
      const comms = await base44.entities.Commitment.filter({ created_by_id: me.id }, "-created_date");
      setCommitments(comms);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const saveBankDetails = async () => {
    setSavingBank(true);
    try {
      await base44.entities.ParticipantProfile.update(profile.id, bankForm);
      setProfile({ ...profile, ...bankForm });
      setEditingBank(false);
    } catch {
    } finally {
      setSavingBank(false);
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
  const pendingCommitments = commitments.filter((c) => c.status === "pending_payment");

  const portfolioValue = activeCommitments.reduce((sum, c) => sum + (c.total_expected_value || 0), 0);
  const totalCommitted = activeCommitments.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalReturns = activeCommitments.reduce((sum, c) => sum + (c.expected_return || 0), 0);

  const summary = [
    { label: "Portfolio Value", value: formatNaira(portfolioValue), icon: Wallet, color: "text-brand", bg: "bg-brand/10" },
    { label: "Total Committed", value: formatNaira(totalCommitted), icon: TrendingUp, color: "text-gold-dark", bg: "bg-gold/10" },
    { label: "Expected Returns", value: formatNaira(totalReturns), icon: Award, color: "text-brand", bg: "bg-brand/10" },
    { label: "Active Plans", value: activeCommitments.length, icon: Clock, color: "text-gold-dark", bg: "bg-gold/10" },
  ];

  const statusConfig = {
    active: { label: "Active", color: "bg-brand/10 text-brand", icon: CheckCircle2 },
    pending_payment: { label: "Pending Payment", color: "bg-gold/10 text-gold-dark", icon: Clock },
    completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700", icon: Award },
    cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive", icon: Clock },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">My Portfolio</h1>
          <p className="text-muted-foreground mt-1">Track your commitments, returns, and documents.</p>
        </div>
        <Link to="/plans">
          <Button className="bg-brand hover:bg-brand-dark">
            <Plus className="w-4 h-4 mr-2" /> New Commitment
          </Button>
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summary.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="font-numeric font-bold text-lg text-foreground">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commitments list */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-heading font-semibold text-foreground mb-4">Commitment History</h2>
            {commitments.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No commitments yet.</p>
                <Link to="/plans"><Button size="sm" variant="outline">Browse Plans</Button></Link>
              </div>
            ) : (
              <div className="space-y-4">
                {commitments.map((c) => {
                  const StatusIcon = statusConfig[c.status]?.icon || Clock;
                  return (
                    <div key={c.id} className="border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-heading font-semibold text-foreground">{c.plan_name} Plan</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[c.status]?.color}`}>
                              {statusConfig[c.status]?.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">Started {formatDate(c.start_date)}</p>
                        </div>
                        {c.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateCommitmentCertificate(c, profile?.full_name)}
                          >
                            <Download className="w-3.5 h-3.5 mr-1" /> Certificate
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="font-numeric font-medium text-foreground">{formatNaira(c.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Expected Return</p>
                          <p className="font-numeric font-medium text-brand">{formatNaira(c.expected_return)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Maturity</p>
                          <p className="font-numeric font-medium text-foreground">{formatDate(c.maturity_date)}</p>
                        </div>
                        {c.status === "active" && (
                          <div>
                            <p className="text-xs text-muted-foreground">Days Left</p>
                            <p className="font-numeric font-medium text-gold-dark">{daysBetween(new Date(), c.maturity_date)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Documents */}
          <Card className="p-6">
            <h2 className="font-heading font-semibold text-foreground mb-4">Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Acknowledgement Letter", icon: FileText },
                { label: "Commitment Certificate", icon: Award },
                { label: "Payment Confirmation", icon: CheckCircle2 },
                { label: "Account Statement", icon: Wallet },
                { label: "Completion Certificate", icon: Award },
                { label: "Referral Report", icon: TrendingUp },
              ].map((doc) => (
                <button
                  key={doc.label}
                  disabled={commitments.length === 0}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-gold/40 hover:bg-muted/30 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <doc.icon className="w-4 h-4 text-brand" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">{doc.label}</span>
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column - bank details */}
        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand" />
                <h2 className="font-heading font-semibold text-foreground">Bank Details</h2>
              </div>
              {!editingBank && profile && (
                <Button variant="ghost" size="sm" onClick={() => setEditingBank(true)}>Edit</Button>
              )}
            </div>

            {!editingBank ? (
              profile?.bank_name ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Bank Name</p>
                    <p className="font-medium text-foreground">{profile.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Account Number</p>
                    <p className="font-numeric font-medium text-foreground">{profile.account_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Account Name</p>
                    <p className="font-medium text-foreground">{profile.account_name}</p>
                  </div>

                </div>
              ) : (
                <div className="text-center py-6">
                  <Building2 className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">Add your bank details for future disbursements.</p>
                  <Button size="sm" variant="outline" onClick={() => setEditingBank(true)}>Add Details</Button>
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Select value={bankForm.bank_name} onValueChange={(val) => setBankForm({ ...bankForm, bank_name: val })}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select your bank" /></SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_BANKS.map((bank) => (
                        <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input id="account_number" value={bankForm.account_number} onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })} placeholder="0123456789" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input id="account_name" value={bankForm.account_name} onChange={(e) => setBankForm({ ...bankForm, account_name: e.target.value })} placeholder="John Doe" className="h-11" />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditingBank(false)}>Cancel</Button>
                  <Button className="flex-1 bg-brand hover:bg-brand-dark" onClick={saveBankDetails} disabled={savingBank}>
                    {savingBank ? "Saving..." : <><Save className="w-4 h-4 mr-1" /> Save</>}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}