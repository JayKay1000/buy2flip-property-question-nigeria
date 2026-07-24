import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2, X, ExternalLink, FileText, AlertCircle,
  ChevronDown, ChevronUp
} from "lucide-react";
import { formatNaira, formatDate } from "@/lib/format";
import { isSafeUrl } from "@/lib/urlSafe";

/**
 * Displays a single payment record with evidence preview (inline image
 * or external link), status badge, and approve/reject actions.
 * Self-contained: the reject form is shown inline.
 */
export default function PaymentEvidenceCard({ payment, onApprove, onReject, processing }) {
  const [showPreview, setShowPreview] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const safeUrl = isSafeUrl(payment.evidence_url);
  const isImage = safeUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(payment.evidence_url);

  const handleReject = () => {
    onReject(payment, reason || "Payment could not be verified");
    setShowReject(false);
    setReason("");
  };

  return (
    <div className="border border-border rounded-lg p-3 space-y-3 bg-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-numeric font-medium text-foreground">{formatNaira(payment.amount)}</p>
          <p className="text-xs text-muted-foreground">{formatDate(payment.created_date)}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
          payment.status === "pending" ? "bg-gold/10 text-gold-dark" :
          payment.status === "confirmed" ? "bg-brand/10 text-brand" :
          "bg-destructive/10 text-destructive"
        }`}>{payment.status}</span>
      </div>

      {/* Bank details */}
      {payment.company_account_number && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Paid to</span>
          <span className="text-foreground font-numeric">
            {payment.company_bank_name ? `${payment.company_bank_name} — ` : ""}{payment.company_account_number}
          </span>
        </div>
      )}

      {/* Evidence */}
      {payment.evidence_url && (
        <div>
          {!safeUrl ? (
            <Button variant="outline" size="sm" className="w-full" disabled>
              <AlertCircle className="w-3.5 h-3.5 mr-2" /> Evidence link unavailable
            </Button>
          ) : isImage ? (
            <div className="space-y-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-between p-2 border border-border rounded-lg text-sm text-brand hover:bg-brand/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> View payment evidence
                </span>
                {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showPreview && (
                <img
                  src={payment.evidence_url}
                  alt="Payment evidence"
                  className="w-full rounded-lg border border-border"
                />
              )}
            </div>
          ) : (
            <a href={payment.evidence_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-3.5 h-3.5 mr-2" /> View Evidence
              </Button>
            </a>
          )}
        </div>
      )}

      {/* Rejection reason */}
      {payment.status === "rejected" && payment.rejection_reason && (
        <div className="p-2 rounded-lg bg-destructive/10 text-destructive text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {payment.rejection_reason}
        </div>
      )}

      {/* Confirmation timestamp */}
      {payment.status === "confirmed" && payment.confirmed_at && (
        <p className="text-xs text-muted-foreground">Confirmed: {formatDate(payment.confirmed_at)}</p>
      )}

      {/* Actions */}
      {payment.status === "pending" && onApprove && (
        <>
          {!showReject ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-brand hover:bg-brand-dark"
                onClick={() => onApprove(payment)}
                disabled={processing}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-destructive hover:bg-destructive/10"
                onClick={() => setShowReject(true)}
                disabled={processing}
              >
                <X className="w-4 h-4 mr-1" /> Reject
              </Button>
            </div>
          ) : (
            <div className="space-y-2 p-3 border border-destructive/20 rounded-lg bg-destructive/5">
              <Label className="text-xs font-medium">Rejection Reason</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Amount does not match commitment..."
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setShowReject(false); setReason(""); }}>
                  Cancel
                </Button>
                <Button size="sm" className="flex-1 bg-destructive hover:bg-destructive/90" onClick={handleReject} disabled={processing}>
                  {processing ? "Rejecting..." : "Confirm"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}