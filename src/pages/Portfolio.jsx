import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNaira, formatDate } from "@/lib/format";
import { isWelcomePackageEligible, getWelcomePackageRate, formatWelcomePackageRate } from "@/lib/plans";
import { liveCommitments } from "@/lib/commitmentStatus";
import { generateCommitmentCertificate } from "@/lib/certificate";
import AdaptiveSelect from "@/components/AdaptiveSelect";
import { NIGERIAN_BANKS } from "@/lib/nigerianBanks";
import {
  Wallet, TrendingUp, Calendar, Download, Award, CheckCircle2,
  Clock, FileText, Plus, Building2, Save, Banknote, Gift
} from "lucide-react";
import WithdrawalDialog from "@/components/WithdrawalDialog";
import WelcomePackageWithdrawDialog from "@/components/WelcomePackageWithdrawDialog";
import PullToRefresh from "@/components/PullToRefresh";
import MaturityCountdown from "@/components/MaturityCountdown";
import PortfolioDocuments from "@/components/PortfolioDocuments";

export default function Portfolio() {
  const [profile, setProfile] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBank, setEditingBank] = useState(false);
  const [withdrawCommitment, setWithdrawCommitment] = useState(null);
  const [bankForm, setBankForm] = useState({ bank_name: "", account_number: "", account_name: "" });
  const [savingBank, setSavingBank] = useState(false);
  const [bankError, setBankError] = useState("");
  const [withdrawWelcome, setWithdrawWelcome] = useState(null);

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
        });
      }
      const comms = await base44.entities.Commitment.filter({ created_by_id: me.id }, "-created_date");
      setCommitments(comms);
      const wd = await base44.entities.WithdrawalRequest.filter({ created_by_id: me.id }, "-created_date");
      setWithdrawals(wd);
      const pays = await base44.entities.Payment.filter({ created_by_id: me.id }, "-created_date");
      setPayments(pays);
      const refs = await base44.entities.Referral.filter({ referrer_code: p?.referral_code || "___" });
      setReferrals(refs);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const saveBankDetails = async () => {
    setBankError("");
    if (bankForm.account_number.length !== 10) {
      setBankError("Account number must be exactly 10 digits.");
      return;
    }
    // Optimistic: snapshot for rollback, reflect locally, close edit immediately
    const previousProfile = profile;
    const previousBankForm = { ...bankForm };
    const optimisticProfile = profile
      ? { ...profile, ...bankForm }
      : { ...bankForm, status: "pending" };
    setProfile(optimisticProfile);
    setEditingBank(false);
    setSavingBank(true);
    try {
      let savedProfile;
      if (previousProfile) {
        const bankUpdate = {
          bank_name: bankForm.bank_name,
          account_number: bankForm.account_number,
          account_name: bankForm.account_name,
        };
        savedProfile = await base44.entities.ParticipantProfile.update(previousProfile.id, bankUpdate);
      } else {
        const me = await base44.auth.me();
        const clean = (me.full_name || me.email || "PQLB").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4).padEnd(4, "X");
        const refCode = `${clean}${Math.floor(1000 + Math.random() * 9000)}`;
        savedProfile = await base44.entities.ParticipantProfile.create({
          ...bankForm,
          full_name: me.full_name || me.email,
          phone_number: me.phone_number || "0000000000",
          referral_code: refCode,
        });
      }
      setProfile(savedProfile);
    } catch (err) {
      // Rollback to previous state on failure
      setProfile(previousProfile);
      setBankForm(previousProfile
        ? { bank_name: previousProfile.bank_name || "", account_number: previousProfile.account_number || "", account_name: previousProfile.account_name || "" }
        : previousBankForm);
      setEditingBank(true);
      setBankError(err?.message || "Failed to save bank details. Please try again.");
    } finally {
      setSavingBank(false);
    }
  };

  const handleWithdrawalSubmitted = (optimisticRecord) => {
    setWithdrawals((prev) => [optimisticRecord, ...prev]);
  };

  const handleWithdrawalRevert = (record) => {
    setWithdrawals((prev) => prev.filter((w) => w.id !== record.id));
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

  // Only match maturity-type withdrawals here — welcome-package and referral
  // requests share the same commitment_id and must not hide the plan Withdraw button.
  const getWithdrawal = (commitmentId) =>
    withdrawals.find((w) => w.commitment_id === commitmentId && (w.request_type === "maturity" || !w.request_type));
  const withdrawalStatusConfig = {
    requested: { label: "Withdrawal Requested", color: "bg-gold/10 text-gold-dark" },
    processing: { label: "Withdrawal Processing", color: "bg-blue-100 text-blue-700" },
    paid: { label: "Withdrawn", color: "bg-brand/10 text-brand" },
    rejected: { label: "Withdrawal Rejected", color: "bg-destructive/10 text-destructive" },
  };

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
    <PullToRefresh onRefresh={loadData}>
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
            {liveCommitments(commitments).length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No commitments yet.</p>
                <Link to="/plans"><Button size="sm" variant="outline">Browse Plans</Button></Link>
              </div>
            ) : (
              <div className="space-y-4">
                {liveCommitments(commitments).map((c) => {
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
                            <p className="text-xs text-muted-foreground">Time to Maturity</p>
                            <MaturityCountdown maturityDate={c.maturity_date} />
                          </div>
                        )}
                        </div>

                        {c.status === "active" && isWelcomePackageEligible(c.plan_name) && (() => {
                          const wp = withdrawals.find((w) => w.commitment_id === c.id && w.request_type === "welcome_package");
                          const wpPaid = c.welcome_package_withdrawn || wp?.status === "paid";
                          const wpPending = wp && (wp.status === "requested" || wp.status === "processing");
                          const wpAmount = Math.round((c.amount || 0) * getWelcomePackageRate(c.plan_name));
                          return (
                            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Gift className="w-4 h-4 text-gold-dark" />
                                <div>
                                  <p className="text-xs font-medium text-foreground">{formatWelcomePackageRate(c.plan_name)} Welcome Package</p>
                                  <p className="text-xs text-muted-foreground">{formatNaira(wpAmount)}</p>
                                </div>
                              </div>
                              {wpPaid ? (
                                <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-brand/10 text-brand"><CheckCircle2 className="w-3 h-3 inline mr-1" /> Paid</span>
                              ) : wpPending ? (
                                <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-gold/10 text-gold-dark"><Clock className="w-3 h-3 inline mr-1" /> Processing</span>
                              ) : (
                                <Button size="sm" className="bg-gold hover:bg-gold-dark text-white border-0" onClick={() => setWithdrawWelcome(c)}>
                                  <Gift className="w-4 h-4 mr-1" /> Withdraw {formatWelcomePackageRate(c.plan_name)}
                                </Button>
                              )}
                            </div>
                          );
                        })()}

                        {(c.status === "active" || c.status === "completed") && (() => {
                        const wd = getWithdrawal(c.id);
                        if (wd && (wd.status === "requested" || wd.status === "processing")) {
                          const cfg = withdrawalStatusConfig[wd.status];
                          return (
                            <div className="mt-4 pt-4 border-t border-border">
                              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${cfg.color}`}>
                                <Clock className="w-3 h-3 inline mr-1" /> {cfg.label}
                              </span>
                            </div>
                          );
                        }
                        if (wd?.status === "paid") {
                          return (
                            <div className="mt-4 pt-4 border-t border-border">
                              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${withdrawalStatusConfig.paid.color}`}>
                                <CheckCircle2 className="w-3 h-3 inline mr-1" /> {withdrawalStatusConfig.paid.label}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Ready to withdraw your returns?</span>
                            <Button size="sm" className="bg-brand hover:bg-brand-dark" onClick={() => setWithdrawCommitment(c)}>
                              <Banknote className="w-4 h-4 mr-1" /> Withdraw
                            </Button>
                          </div>
                        );
                        })()}
                        </div>
                        );
                        })}
                        </div>
            )}
          </Card>

          {/* Documents */}
          <PortfolioDocuments
            profile={profile}
            commitments={commitments}
            payments={payments}
            referrals={referrals}
          />
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
                  <AdaptiveSelect
                    value={bankForm.bank_name}
                    onValueChange={(val) => setBankForm({ ...bankForm, bank_name: val })}
                    placeholder="Select your bank"
                    options={NIGERIAN_BANKS}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input id="account_number" value={bankForm.account_number} onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="0123456789" maxLength={10} inputMode="numeric" className="h-11" />
                  {bankError && <p className="text-xs text-destructive">{bankError}</p>}
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

    <WelcomePackageWithdrawDialog
      open={!!withdrawWelcome}
      onOpenChange={(open) => !open && setWithdrawWelcome(null)}
      commitment={withdrawWelcome}
      profile={profile}
      onSubmitted={handleWithdrawalSubmitted}
      onRevert={handleWithdrawalRevert}
    />

    <WithdrawalDialog
      open={!!withdrawCommitment}
      onOpenChange={(open) => !open && setWithdrawCommitment(null)}
      commitment={withdrawCommitment}
      profile={profile}
      onSubmitted={handleWithdrawalSubmitted}
      onRevert={handleWithdrawalRevert}
    />
    </PullToRefresh>
  );
}