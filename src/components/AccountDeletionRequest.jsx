import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2, CheckCircle2 } from "lucide-react";

export default function AccountDeletionRequest() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await base44.entities.SupportTicket.create({
        subject: "Account Deletion Request",
        message: reason.trim()
          ? `I would like to request that my account be deleted.\n\nReason: ${reason.trim()}`
          : "I would like to request that my account be deleted.",
        category: "account",
      });
      setSubmitted(true);
      setOpen(false);
      setReason("");
    } catch (err) {
      setError(err?.message || "Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-6 border-destructive/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-1">Request Submitted</h3>
            <p className="text-sm text-muted-foreground">
              Your account deletion request has been sent to our admin team. We will review and
              process it shortly. You will be contacted before any action is taken.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 border-destructive/30">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-1">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Request permanent deletion of your account and associated data. This action is
              irreversible once processed by our team.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => setOpen(true)}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Request Account Deletion
        </Button>
      </Card>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirm Account Deletion Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will submit a request to our admin team to permanently delete your account,
              commitments, referrals, and associated data. Please provide a reason (optional) to
              help us process your request.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="deletion-reason">Reason (optional)</Label>
            <Textarea
              id="deletion-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tell us why you'd like to delete your account..."
              rows={3}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}