import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Mail,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export default function DeleteAccount() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your account email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      await base44.functions.invoke("requestAccountDeletion", {
        email: trimmedEmail,
        reason: reason.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err?.message ||
          "Failed to submit request. Please try again or contact support."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-xl">
          {submitted ? (
            <Card className="border-brand/20">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-7 h-7 text-brand" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground mb-3">
                  Request Received
                </h1>
                <p className="text-muted-foreground mb-6">
                  Your account deletion request has been submitted. Our team will
                  verify your identity and process the request within 72 hours.
                  You will receive a confirmation email at{" "}
                  <span className="font-medium text-foreground">
                    {email.trim()}
                  </span>{" "}
                  before any action is taken.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 inline mr-1 text-brand" />
                    Your account has been deactivated and your data marked for
                    deletion. It will be permanently removed after our review
                    period.
                  </p>
                </div>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Return to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-destructive" />
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Delete Your Account
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Request deactivation and soft deletion of your account. Your
                  account will be deactivated immediately and your data
                  permanently removed after a review period.
                </p>
              </div>

              <Card className="border-destructive/20">
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Account Email{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the email address associated with your account.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason (optional)</Label>
                      <Textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Tell us why you'd like to delete your account..."
                        rows={4}
                      />
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            What will happen:
                          </span>{" "}
                          Your account will be deactivated immediately and
                          marked for deletion. Data is retained securely during
                          the review period, then permanently removed.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          Our team will verify your identity via email before
                          processing. Requests are typically processed within 72
                          hours.
                        </p>
                      </div>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button
                      type="submit"
                      variant="destructive"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Deletion Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Need help? Contact us at{" "}
                <a
                  href="mailto:subscribe@buy2flip.net"
                  className="text-brand font-medium hover:underline"
                >
                  subscribe@buy2flip.net
                </a>
              </p>
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Property Question Nigeria Limited. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}