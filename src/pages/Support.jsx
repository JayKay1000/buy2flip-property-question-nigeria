import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdaptiveSelect from "@/components/AdaptiveSelect";
import SupportAssistantChat from "@/components/SupportAssistantChat";
import { formatDateTime } from "@/lib/format";
import {
  LifeBuoy, MessageSquare, Phone, Mail, Building2, HelpCircle,
  Send, CheckCircle2, Clock, ChevronDown, Sparkles
} from "lucide-react";

const faqs = [
  { q: "How do I start a commitment?", a: "Create an account, verify your email, complete your profile, then choose a commitment plan and amount. You'll see the company payment account to transfer to, then upload your payment evidence for verification." },
  { q: "What are the minimum commitment amounts?", a: "The minimum commitment for all plans is ₦1,000,000. You may commit in multiples of ₦1,000,000." },
  { q: "When do I receive my returns?", a: "Returns are disbursed at the end of your selected commitment period (6, 12, or 18 months) to your preferred receiving bank account." },
  { q: "How do referral rewards work?", a: "You earn 2% on direct referrals (first line) and 0.5% on indirect referrals (second line) when they make a commitment." },
  { q: "Can I withdraw my commitment early?", a: "Early withdrawal is not permitted. Commitments are held for the full duration to ensure optimal deployment." },
  { q: "How is my payment verified?", a: "After uploading your payment evidence, our team verifies it within 1-2 business hours. You'll receive a confirmation once your portfolio is activated." },
];

const ticketCategories = [
  { value: "payment", label: "Payment" },
  { value: "commitment", label: "Commitment" },
  { value: "referral", label: "Referral" },
  { value: "account", label: "Account" },
  { value: "general", label: "General" },
];

export default function Support() {
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.ParticipantProfile.filter({ created_by_id: me.id });
      setProfile(profiles[0] || null);
      const tkts = await base44.entities.SupportTicket.filter({ created_by_id: me.id }, "-created_date");
      setTickets(tkts);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Optimistic: show the new pending ticket immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticTicket = {
      id: tempId,
      subject,
      message,
      category,
      status: "open",
      created_date: new Date().toISOString(),
    };
    setTickets((prev) => [optimisticTicket, ...prev]);
    try {
      const created = await base44.entities.SupportTicket.create({
        subject,
        message,
        category,
        status: "open",
      });
      // Replace the temp entry with the real, server-confirmed ticket
      setTickets((prev) => prev.map((t) => (t.id === tempId ? created : t)));
      setSubmitted(true);
      setSubject("");
      setMessage("");
      setCategory("general");
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      // Rollback the optimistic entry on failure
      setTickets((prev) => prev.filter((t) => t.id !== tempId));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Support Centre</h1>
          <p className="text-muted-foreground mt-1">We're here to help with any questions or concerns.</p>
        </div>

      </div>

      {/* Quick support options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <a href="https://wa.me/2349033393000" target="_blank" rel="noopener noreferrer">
          <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-brand" />
            </div>
            <h3 className="font-heading font-semibold text-foreground text-sm">Live Chat</h3>
            <p className="text-xs text-muted-foreground mt-1">Chat with us on WhatsApp</p>
          </Card>
        </a>
        <a href="tel:+2349033393000">
          <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-3">
              <Phone className="w-5 h-5 text-gold-dark" />
            </div>
            <h3 className="font-heading font-semibold text-foreground text-sm">Call Support</h3>
            <p className="text-xs text-muted-foreground mt-1">+234 903 339 3000</p>
          </Card>
        </a>
        <a href="mailto:buy2flip@propertyquestion.net">
          <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-brand" />
            </div>
            <h3 className="font-heading font-semibold text-foreground text-sm">Email Us</h3>
            <p className="text-xs text-muted-foreground mt-1">buy2flip@propertyquestion.net</p>
          </Card>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support ticket form */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <LifeBuoy className="w-5 h-5 text-brand" />
            <h2 className="font-heading font-semibold text-foreground">Submit a Support Ticket</h2>
          </div>
          {submitted && (
            <div className="mb-4 p-3 rounded-lg bg-brand/10 text-brand text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Ticket submitted! We'll get back to you shortly.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Briefly describe your issue" className="h-11" required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <AdaptiveSelect
                value={category}
                onValueChange={setCategory}
                placeholder="Select Category"
                options={ticketCategories}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue in detail..." rows={5} required />
            </div>
            <Button type="submit" className="w-full h-12 bg-brand hover:bg-brand-dark" disabled={submitting}>
              {submitting ? "Submitting..." : <><Send className="w-4 h-4 mr-2" /> Submit Ticket</>}
            </Button>
          </form>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Relationship Officer */}
          {profile && (
            <Card className="p-6">
              <h2 className="font-heading font-semibold text-foreground mb-4">Your Relationship Officer</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{profile.relationship_officer || "Assigned Officer"}</p>
                  <p className="text-xs text-muted-foreground">Property Question Nigeria Ltd</p>
                </div>
              </div>
              <div className="space-y-2">
                <a href="tel:+2349033393000" className="flex items-center gap-2 text-sm text-foreground hover:text-brand transition-colors">
                  <Phone className="w-4 h-4 text-muted-foreground" /> +234 903 339 3000
                </a>
                <a href="mailto:buy2flip@propertyquestion.net" className="flex items-center gap-2 text-sm text-foreground hover:text-brand transition-colors">
                  <Mail className="w-4 h-4 text-muted-foreground" /> buy2flip@propertyquestion.net
                </a>
              </div>
            </Card>
          )}

          {/* Your tickets */}
          <Card className="p-6">
            <h2 className="font-heading font-semibold text-foreground mb-4">Your Tickets</h2>
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No support tickets yet.</p>
            ) : (
              <div className="space-y-3">
                {tickets.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      t.status === "resolved" || t.status === "closed" ? "bg-brand/10" : "bg-gold/10"
                    }`}>
                      {t.status === "resolved" || t.status === "closed" ? <CheckCircle2 className="w-4 h-4 text-brand" /> : <Clock className="w-4 h-4 text-gold-dark" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(t.created_date)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      t.status === "resolved" || t.status === "closed" ? "bg-brand/10 text-brand" : "bg-gold/10 text-gold-dark"
                    }`}>
                      {t.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Support Assistant */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-brand" />
          <h2 className="font-heading font-semibold text-foreground">Support Assistant</h2>
        </div>
        <SupportAssistantChat />
      </div>

      {/* FAQ */}
      <Card className="p-6 mt-6">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-brand" />
          <h2 className="font-heading font-semibold text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <span className="font-medium text-sm text-foreground">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ml-2 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}