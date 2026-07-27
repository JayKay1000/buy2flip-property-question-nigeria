import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNaira, formatDate } from "@/lib/format";
import WelcomePackageWithdrawDialog from "@/components/WelcomePackageWithdrawDialog";
import {
  Gift, CheckCircle2, Clock, AlertCircle, Wallet, ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function WelcomePackage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeCommitment, setActiveCommitment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.ParticipantProfile.filter({ created_by_id: me.id });
      const p = profiles[0] || null;
      setProfile(p);
      const [comms, reqs] = await Promise.all([
        base44.entities.Commitment.filter({ created_by_id: me.id }, "-created_date"),
        base44.entities.WithdrawalRequest.filter({ created_by_id: me.id }, "-created_date"),
      ]);
      setCommitments(comms);
      setRequests(reqs);
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

  const welcomeRequests = requests.filter((r) => r.request_type === "welcome_package");
  const pendingRequestFor = (commitmentId) =>
    welcomeRequests.find((r) => r.commitment_id === commitmentId && r.status === "requested");
  const paidRequestFor = (commitmentId) =>
    welcomeRequests.find((r) => r.commitment_id === commitmentId && r.status === "paid");

  const eligible = commitments.filter(
    (c) => c.status === "active" && !c.welcome_package_withdrawn && !pendingRequestFor(c.id)
  );
  const totalAvailable = eligible.reduce((s, c) => s + Math.round((c.amount || 0) * 0.01), 0);
  const totalWithdrawn = commitments
    .filter((c) => c.welcome_package_withdrawn)
    .reduce((s, c) => s + Math.round((c.amount || 0) * 0.01), 0);
  const totalPending = welcomeRequests
    .filter((r) => r.status === "requested")
    .reduce((s, r) => s + (r.amount || 0), 0);

  const openDialog = (commitment) => {
    setActiveCommitment(commitment);
    setDialogOpen(true);
  };

  const stats = [
    { label: "Available Now", value: formatNaira(totalAvailable), icon: Gift, color: "text-gold-dark", bg: "bg-gold/10" },
    { label: "Pending Approval", value: formatNaira(totalPending), icon: Clock, color: "text-brand", bg: "bg-brand/10" },
    { label: "Total Withdrawn", value: formatNaira(totalWithdrawn), icon: CheckCircle2, color: "text-brand", bg: "bg-brand/10" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">1% Welcome Package</h1>
        <p className="text-muted-foreground mt-1">
          View the status of your 1% welcome package on each verified commitment and request a withdrawal once it becomes available.
        </p>
      </div>

      {/* How it works */}
      <Card className="p-5 mb-6 border-gold/30 bg-gold/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5 text-gold-dark" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-foreground">How the welcome package works</h2>
            <p className="text-sm text-muted-foreground mt-1">
              When your payment is verified and your commitment is activated, a 1% welcome package becomes available.
              Request it here and our team pays it to your bank account after manual verification. Your full commitment
              and expected return remain payable at maturity.
            </p>
          </div>
        </div>
      </Card>

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

      {/* Bank details check */}
      {profile && !(profile.bank_name && profile.account_number && profile.account_name) && (
        <Card className="p-5 mb-6 border-destructive/30 bg-destructive/5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground text-sm">Bank details required</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add your receiving bank details in Portfolio before requesting a welcome package withdrawal.
            </p>
          </div>
        </Card>
      )}

      {/* Commitments */}
      <h2 className="font-heading font-semibold text-foreground mb-4">Your Commitments</h2>
      {commitments.length === 0 ? (
        <Card className="p-12 text-center">
          <Wallet className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No commitments yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {commitments.map((c) => {
            const welcomeAmount = Math.round((c.amount || 0) * 0.01);
            const pending = pendingRequestFor(c.id);
            const paid = c.welcome_package_withdrawn;
            const isPendingPayment = c.status === "pending_payment";
            return (
              <Card key={c.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-heading font-semibold text-foreground">{c.plan_name} Plan</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.status === "active" ? "bg-brand/10 text-brand" :
                        c.status === "pending_payment" ? "bg-gold/10 text-gold-dark" :
                        "bg-muted text-muted-foreground"
                      }`}>{c.status.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Committed {formatNaira(c.amount)} · Activated {formatDate(c.start_date)}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">1% Welcome</p>
                      <p className="font-numeric font-bold text-lg text-gold-dark">{formatNaira(welcomeAmount)}</p>
                    </div>
                    <div className="w-32 text-right">
                      {isPendingPayment ? (
                        <span className="text-xs text-muted-foreground">Awaiting payment verification</span>
                      ) : paid ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                          <CheckCircle2 className="w-4 h-4" /> Withdrawn
                        </span>
                      ) : pending ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-dark">
                          <Clock className="w-4 h-4" /> Pending
                        </span>
                      ) : (
                        <Button size="sm" className="bg-gold hover:bg-gold-dark text-white border-0" onClick={() => openDialog(c)}>
                          <Gift className="w-4 h-4 mr-1" /> Request
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* History */}
      {welcomeRequests.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading font-semibold text-foreground mb-4">Request History</h2>
          <Card className="p-6">
            <div className="space-y-3">
              {welcomeRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatNaira(r.amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.created_date)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.status === "paid" ? "bg-brand/10 text-brand" :
                    r.status === "rejected" ? "bg-destructive/10 text-destructive" :
                    "bg-gold/10 text-gold-dark"
                  }`}>{r.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <WelcomePackageWithdrawDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        commitment={activeCommitment}
        profile={profile}
        onSubmitted={loadData}
        onRevert={loadData}
      />
    </div>
  );
}