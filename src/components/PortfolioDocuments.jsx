import React from "react";
import { Card } from "@/components/ui/card";
import { generateCommitmentCertificate } from "@/lib/certificate";
import {
  FileText, Award, CheckCircle2, Wallet, Download, TrendingUp,
} from "lucide-react";
import {
  generateAcknowledgementLetter,
  generatePaymentConfirmation,
  generateAccountStatement,
  generateCompletionCertificate,
  generateReferralReport,
} from "@/lib/portfolioDocuments";

export default function PortfolioDocuments({ profile, commitments, payments, referrals }) {
  const name = profile?.full_name || "Participant";

  const handleDownload = (doc) => {
    switch (doc.key) {
      case "acknowledgement":
        generateAcknowledgementLetter(profile, commitments);
        break;
      case "certificate": {
        const active = commitments.find((c) => c.status === "active" || c.status === "completed");
        if (active) generateCommitmentCertificate(active, name);
        break;
      }
      case "payment":
        generatePaymentConfirmation(profile, payments, commitments);
        break;
      case "statement":
        generateAccountStatement(profile, commitments, payments);
        break;
      case "completion": {
        const completed = commitments.find((c) => c.status === "completed");
        if (completed) generateCompletionCertificate(profile, completed);
        break;
      }
      case "referral":
        generateReferralReport(profile, referrals);
        break;
    }
  };

  const docs = [
    { key: "acknowledgement", label: "Acknowledgement Letter", icon: FileText, available: commitments.length > 0 },
    { key: "certificate", label: "Commitment Certificate", icon: Award, available: commitments.some((c) => c.status === "active" || c.status === "completed") },
    { key: "payment", label: "Payment Confirmation", icon: CheckCircle2, available: payments.some((p) => p.status === "confirmed") },
    { key: "statement", label: "Account Statement", icon: Wallet, available: commitments.length > 0 },
    { key: "completion", label: "Completion Certificate", icon: Award, available: commitments.some((c) => c.status === "completed") },
    { key: "referral", label: "Referral Report", icon: TrendingUp, available: referrals.length > 0 },
  ];

  return (
    <Card className="p-6">
      <h2 className="font-heading font-semibold text-foreground mb-4">Documents</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {docs.map((doc) => (
          <button
            key={doc.key}
            disabled={!doc.available}
            onClick={() => handleDownload(doc)}
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
  );
}