import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNaira, formatDate } from "@/lib/format";
import { downloadCsv } from "@/lib/exportCsv";
import { liveCommitments } from "@/lib/commitmentStatus";
import {
  totalEarnedRewards, totalWithdrawnAmount,
} from "@/lib/referralEarnings";
import {
  FileSpreadsheet, Download, Search, Users, TrendingUp, Banknote, X,
  Mail, Phone, Building2, CreditCard, Network, Wallet, Calendar,
} from "lucide-react";

const todayStamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function AdminBookkeeping() {
  const [participants, setParticipants] = useState([]);
  const [users, setUsers] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [parts, usrs, comms, refs] = await Promise.all([
        base44.entities.ParticipantProfile.list(),
        base44.entities.User.list(),
        base44.entities.Commitment.list(),
        base44.entities.Referral.list(),
      ]);
      setParticipants(parts);
      setUsers(usrs);
      setCommitments(comms);
      setReferrals(refs);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const getUser = (uid) => users.find((u) => u.id === uid);

  // Build the complete per-user report rows (used for both the table and the
  // CSV export). One row per participant with their full profile, aggregated
  // commitment totals + plan breakdown, and full direct/indirect referral data.
  const reportRows = useMemo(() => {
    return participants.map((p) => {
      const user = getUser(p.created_by_id);
      const userComms = liveCommitments(
        commitments.filter((c) => c.created_by_id === p.created_by_id)
      );
      const userRefs = referrals.filter((r) => r.referrer_code === p.referral_code);
      const directRefs = userRefs.filter((r) => r.level === 1);
      const indirectRefs = userRefs.filter((r) => r.level === 2);

      const totalCommitted = userComms.reduce((s, c) => s + (c.amount || 0), 0);
      const totalExpectedReturn = userComms.reduce((s, c) => s + (c.expected_return || 0), 0);
      const totalExpectedValue = userComms.reduce((s, c) => s + (c.total_expected_value || 0), 0);

      const plansDetail = userComms
        .map((c) => `${c.plan_name} ${formatNaira(c.amount || 0)} [${c.status}] ${c.start_date || ""}->${c.maturity_date || ""}`)
        .join("; ");

      const refDetail = (list) =>
        list
          .map((r) => `${r.referred_name || "—"} <${r.referred_email || "—"}> earned=${formatNaira(r.reward_amount || 0)} withdrawn=${formatNaira(r.withdrawn_amount || 0)} [${r.status}]`)
          .join("; ");

      const earned = totalEarnedRewards(userRefs);
      const withdrawn = totalWithdrawnAmount(userRefs);

      return {
        id: p.id,
        full_name: p.full_name,
        email: user?.email || "",
        phone_number: p.phone_number,
        referral_code: p.referral_code,
        referred_by_code: p.referred_by_code || "",
        status: p.status,
        bank_name: p.bank_name || "",
        account_number: p.account_number || "",
        account_name: p.account_name || "",
        preferred_receiving_bank: p.preferred_receiving_bank || "",
        relationship_officer: p.relationship_officer || "",
        joined_date: p.created_date,
        commitments_count: userComms.length,
        total_committed: totalCommitted,
        total_expected_return: totalExpectedReturn,
        total_expected_value: totalExpectedValue,
        plans_detail: plansDetail,
        direct_count: directRefs.length,
        indirect_count: indirectRefs.length,
        referral_earned: earned,
        referral_withdrawn: withdrawn,
        referral_available: Math.max(0, earned - withdrawn),
        direct_detail: refDetail(directRefs),
        indirect_detail: refDetail(indirectRefs),
        _commitments: userComms,
        _direct: directRefs,
        _indirect: indirectRefs,
      };
    });
  }, [participants, users, commitments, referrals]);

  const filtered = reportRows.filter((r) =>
    !search ||
    r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.phone_number?.includes(search) ||
    r.referral_code?.toLowerCase().includes(search.toLowerCase())
  );

  // Aggregate totals for the summary cards.
  const totals = useMemo(() => {
    return reportRows.reduce(
      (acc, r) => {
        acc.participants += 1;
        acc.committed += r.total_committed;
        acc.earned += r.referral_earned;
        acc.withdrawn += r.referral_withdrawn;
        return acc;
      },
      { participants: 0, committed: 0, earned: 0, withdrawn: 0 }
    );
  }, [reportRows]);

  const exportColumns = [
    { label: "Full Name", key: "full_name" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phone_number" },
    { label: "Referral Code", key: "referral_code" },
    { label: "Referred By Code", key: "referred_by_code" },
    { label: "Status", key: "status" },
    { label: "Bank Name", key: "bank_name" },
    { label: "Account Number", key: "account_number" },
    { label: "Account Name", key: "account_name" },
    { label: "Preferred Receiving Bank", key: "preferred_receiving_bank" },
    { label: "Relationship Officer", key: "relationship_officer" },
    { label: "Joined Date", key: "joined_date" },
    { label: "Commitments Count", key: "commitments_count" },
    { label: "Total Committed Amount", key: "total_committed" },
    { label: "Total Expected Return", key: "total_expected_return" },
    { label: "Total Expected Value", key: "total_expected_value" },
    { label: "Commitment Plans (Plan | Amount | Status | Dates)", key: "plans_detail" },
    { label: "Direct Referrals Count", key: "direct_count" },
    { label: "Indirect Referrals Count", key: "indirect_count" },
    { label: "Total Referral Earned", key: "referral_earned" },
    { label: "Total Referral Withdrawn", key: "referral_withdrawn" },
    { label: "Available Referral Balance", key: "referral_available" },
    { label: "Direct Referrals (Name | Email | Earned | Withdrawn | Status)", key: "direct_detail" },
    { label: "Indirect Referrals (Name | Email | Earned | Withdrawn | Status)", key: "indirect_detail" },
  ];

  const handleExport = () => {
    const rows = filtered.map((r) => {
      const { _commitments, _direct, _indirect, ...rest } = r;
      return rest;
    });
    downloadCsv(`buy2flip-bookkeeping-report-${todayStamp()}.csv`, exportColumns, rows);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  const summaryCards = [
    { label: "Total Participants", value: totals.participants, icon: Users, color: "text-brand", bg: "bg-brand/10" },
    { label: "Total Committed", value: formatNaira(totals.committed), icon: TrendingUp, color: "text-gold-dark", bg: "bg-gold/10" },
    { label: "Total Referral Earned", value: formatNaira(totals.earned), icon: Network, color: "text-brand", bg: "bg-brand/10" },
    { label: "Total Referral Withdrawn", value: formatNaira(totals.withdrawn), icon: Banknote, color: "text-gold-dark", bg: "bg-gold/10" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Book-Keeping Report</h1>
          <p className="text-muted-foreground mt-1">
            Complete, exportable record of every participant — commitments, referrals, and earnings.
          </p>
        </div>
        <Button onClick={handleExport} className="bg-brand hover:bg-brand-dark h-11">
          <Download className="w-4 h-4 mr-2" /> Export Full Report ({todayStamp()})
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="font-numeric font-bold text-lg text-foreground">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, phone, or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileSpreadsheet className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No participants found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Participant</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Code</th>
                  <th className="px-4 py-3 font-medium text-center">Commitments</th>
                  <th className="px-4 py-3 font-medium text-right">Total Committed</th>
                  <th className="px-4 py-3 font-medium text-center hidden sm:table-cell">Direct</th>
                  <th className="px-4 py-3 font-medium text-center hidden sm:table-cell">Indirect</th>
                  <th className="px-4 py-3 font-medium text-right hidden lg:table-cell">Earned</th>
                  <th className="px-4 py-3 font-medium text-right hidden lg:table-cell">Withdrawn</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{r.full_name}</p>
                      <p className="text-xs text-muted-foreground">{r.email || "—"}</p>
                    </td>
                    <td className="px-4 py-3 font-numeric text-foreground hidden md:table-cell">{r.referral_code}</td>
                    <td className="px-4 py-3 text-center text-foreground font-numeric">{r.commitments_count}</td>
                    <td className="px-4 py-3 text-right font-numeric text-foreground">{formatNaira(r.total_committed)}</td>
                    <td className="px-4 py-3 text-center text-foreground font-numeric hidden sm:table-cell">{r.direct_count}</td>
                    <td className="px-4 py-3 text-center text-foreground font-numeric hidden sm:table-cell">{r.indirect_count}</td>
                    <td className="px-4 py-3 text-right font-numeric text-gold-dark hidden lg:table-cell">{formatNaira(r.referral_earned)}</td>
                    <td className="px-4 py-3 text-right font-numeric text-brand hidden lg:table-cell">{formatNaira(r.referral_withdrawn)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(r)}>View</Button>
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
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-background shadow-2xl overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-background border-b border-border p-5 flex items-center justify-between z-10">
              <h2 className="font-heading font-semibold text-foreground">Full Participant Record</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-6">
              {/* Profile */}
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
                <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{selected.email || "—"}</span></div>
                <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{selected.phone_number}</span></div>
                <div className="flex items-center gap-3 text-sm"><Building2 className="w-4 h-4 text-muted-foreground" /><span className="text-foreground font-numeric">Code: {selected.referral_code}</span></div>
                {selected.referred_by_code && <p className="text-xs text-muted-foreground pl-7">Referred by: {selected.referred_by_code}</p>}
                {selected.bank_name && (
                  <>
                    <div className="flex items-center gap-3 text-sm"><CreditCard className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{selected.bank_name} — {selected.account_number}</span></div>
                    <p className="text-xs text-muted-foreground pl-7">Account Name: {selected.account_name}</p>
                  </>
                )}
                {selected.preferred_receiving_bank && <p className="text-xs text-muted-foreground pl-7">Preferred Bank: {selected.preferred_receiving_bank}</p>}
                {selected.relationship_officer && <p className="text-xs text-muted-foreground pl-7">Officer: {selected.relationship_officer}</p>}
                <div className="flex items-center gap-3 text-sm"><Calendar className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">Joined {formatDate(selected.joined_date)}</span></div>
              </div>

              {/* Commitments */}
              <div>
                <h4 className="font-heading font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand" /> Commitments ({selected.commitments_count})
                </h4>
                {selected._commitments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No commitments.</p>
                ) : (
                  <div className="space-y-2">
                    {selected._commitments.map((c) => (
                      <div key={c.id} className="border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{c.plan_name} Plan</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            c.status === "active" ? "bg-brand/10 text-brand" :
                            c.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                            c.status === "pending_payment" ? "bg-gold/10 text-gold-dark" : "bg-muted text-muted-foreground"
                          }`}>{c.status.replace(/_/g, " ")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-numeric">{formatNaira(c.amount)} → {formatNaira(c.total_expected_value)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(c.start_date)} → {formatDate(c.maturity_date)}</p>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Committed</span>
                      <span className="font-numeric font-semibold text-foreground">{formatNaira(selected.total_committed)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Referrals */}
              <div>
                <h4 className="font-heading font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                  <Network className="w-4 h-4 text-brand" /> Referral Network
                </h4>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-3 rounded-lg bg-muted/40 text-center">
                    <p className="text-xs text-muted-foreground">Direct</p>
                    <p className="font-numeric font-bold text-foreground">{selected.direct_count}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 text-center">
                    <p className="text-xs text-muted-foreground">Indirect</p>
                    <p className="font-numeric font-bold text-foreground">{selected.indirect_count}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gold/5 text-center">
                    <p className="text-xs text-muted-foreground">Available</p>
                    <p className="font-numeric font-bold text-gold-dark text-xs">{formatNaira(selected.referral_available)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-brand/5 border border-brand/10">
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                    <p className="font-numeric font-semibold text-brand">{formatNaira(selected.referral_earned)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border border-border">
                    <p className="text-xs text-muted-foreground">Withdrawn</p>
                    <p className="font-numeric font-semibold text-foreground">{formatNaira(selected.referral_withdrawn)}</p>
                  </div>
                </div>
                {(() => {
                  const renderList = (list, label) => (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">{label} — {list.length}</p>
                      {list.length === 0 ? (
                        <p className="text-xs text-muted-foreground">None</p>
                      ) : (
                        <div className="space-y-2">
                          {list.map((r) => (
                            <div key={r.id} className="border border-border rounded-lg p-2">
                              <p className="text-sm font-medium text-foreground truncate">{r.referred_name || "—"}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.referred_email || "—"}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="font-numeric text-xs text-foreground">earned {formatNaira(r.reward_amount || 0)}</span>
                                <span className="font-numeric text-xs text-brand">paid {formatNaira(r.withdrawn_amount || 0)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                  return (
                    <div className="space-y-4">
                      {renderList(selected._direct, "Direct Referrals (Level 1)")}
                      {renderList(selected._indirect, "Indirect Referrals (Level 2)")}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}