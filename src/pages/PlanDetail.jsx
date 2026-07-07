import React, { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPlan, AMOUNT_PRESETS } from "@/lib/plans";
import { formatNaira, addMonths, formatDate } from "@/lib/format";
import {
  CheckCircle2, ArrowLeft, ArrowRight, Calculator, HelpCircle, FileText,
  Calendar, TrendingUp, ShieldCheck
} from "lucide-react";

export default function PlanDetail() {
  const { planName } = useParams();
  const navigate = useNavigate();
  const plan = getPlan(planName);
  const [amount, setAmount] = useState(plan ? plan.minimum : 1000000);
  const [customAmount, setCustomAmount] = useState("");

  if (!plan) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Plan not found</h1>
        <Link to="/plans"><Button>Back to Plans</Button></Link>
      </div>
    );
  }

  const validAmount = customAmount ? Math.round(parseFloat(customAmount) / 1000000) * 1000000 : amount;
  const expectedReturn = validAmount * plan.returnRate;
  const totalValue = validAmount + expectedReturn;
  const maturityDate = addMonths(new Date(), plan.durationMonths);
  const today = new Date().toISOString().split("T")[0];

  const handleCustomChange = (val) => {
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= plan.minimum && num % 1000000 === 0) {
      setAmount(num);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back link */}
      <Link to="/plans" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Plans
      </Link>

      {/* Plan header */}
      <div className="relative rounded-3xl overflow-hidden mb-8 h-56">
        <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80" alt={plan.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand/60" />
        <div className="absolute inset-0 flex items-center p-8 sm:p-12">
          <div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-gold text-white">
              {plan.durationMonths} Months · {(plan.returnRate * 100).toFixed(0)}% Return
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white">{plan.name} Plan</h1>
            <p className="text-white/70 mt-2 max-w-lg">{plan.tagline}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Benefits */}
          <Card className="p-6">
            <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gold" /> Benefits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plan.benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                  {benefit}
                </div>
              ))}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" /> Timeline
            </h2>
            <div className="space-y-4">
              {plan.timeline.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < plan.timeline.length - 1 && <div className="w-0.5 flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-sm text-foreground">{item.phase}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Calculator */}
          <Card className="p-6">
            <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-gold" /> Expected Return Calculator
            </h2>
            <div className="mb-4">
              <Label className="mb-3 block">Select Commitment Amount</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {AMOUNT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => { setAmount(preset); setCustomAmount(""); }}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                      amount === preset && !customAmount
                        ? "bg-brand text-white shadow-sm"
                        : "bg-muted hover:bg-accent text-foreground"
                    }`}
                  >
                    ₦{preset / 1000000}M
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom">Or enter custom amount (multiples of ₦1,000,000)</Label>
                <Input
                  id="custom"
                  type="number"
                  placeholder="1000000"
                  value={customAmount}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className="h-12"
                  min={plan.minimum}
                  step={1000000}
                />
                {customAmount && parseFloat(customAmount) % 1000000 !== 0 && (
                  <p className="text-xs text-destructive">Amount must be a multiple of ₦1,000,000</p>
                )}
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Commitment Amount</span>
                <span className="font-numeric font-semibold text-foreground">{formatNaira(validAmount)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Applicable Return ({(plan.returnRate * 100).toFixed(0)}%)
                </span>
                <span className="font-numeric font-semibold text-brand">{formatNaira(expectedReturn)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Maturity Date</span>
                <span className="font-numeric font-semibold text-foreground">{formatDate(maturityDate)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-medium text-foreground">Total Expected Value at Maturity</span>
                <span className="font-numeric font-bold text-xl text-gold-dark">{formatNaira(totalValue)}</span>
              </div>
            </div>
          </Card>

          {/* FAQ */}
          <Card className="p-6">
            <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gold" /> Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {plan.faqs.map((faq, i) => (
                <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                  <p className="font-medium text-sm text-foreground mb-1">{faq.q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Terms */}
          <Card className="p-6">
            <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" /> Terms & Conditions
            </h2>
            <ol className="space-y-2 list-decimal list-inside">
              {plan.terms.map((term, i) => (
                <li key={i} className="text-sm text-muted-foreground leading-relaxed">{term}</li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Right column - sticky choose plan */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <Card className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">Starting from</p>
                <p className="font-numeric font-bold text-3xl text-foreground">{formatNaira(plan.minimum)}</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <TrendingUp className="w-4 h-4 text-brand" /> {(plan.returnRate * 100).toFixed(0)}% expected return
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <Calendar className="w-4 h-4 text-brand" /> {plan.durationMonths}-month commitment
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <ShieldCheck className="w-4 h-4 text-brand" /> Real estate backed
                </div>
              </div>
              <Button
                className="w-full bg-gold hover:bg-gold-dark text-white border-0 h-12 text-base font-semibold"
                onClick={() => navigate(`/payment?plan=${plan.slug}`)}
              >
                Choose Plan <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                You'll select your amount on the next step.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}