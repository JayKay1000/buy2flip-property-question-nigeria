import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";
import { formatNaira } from "@/lib/format";
import { CheckCircle2, Star, ArrowRight, ShieldCheck } from "lucide-react";

export default function Plans() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <span className="text-xs font-semibold text-gold uppercase tracking-widest">Commitment Plans</span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground mt-2">Choose Your Commitment Plan</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Select a plan that aligns with your financial goals. Each plan offers structured commitments
          backed by carefully selected real estate developments.
        </p>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.slug}
            className={`overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl ${
              plan.name === "Gold" ? "ring-2 ring-gold relative" : ""
            }`}
          >
            {plan.name === "Gold" && (
              <div className="absolute top-4 right-4 z-10 glass rounded-full px-3 py-1 flex items-center gap-1">
                <Star className="w-3 h-3 text-gold fill-gold" />
                <span className="text-xs font-medium text-white">Popular</span>
              </div>
            )}
            <div className="relative h-44 overflow-hidden">
              <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2"
                  style={{ backgroundColor: plan.accent, color: plan.name === "Silver" ? "#fff" : plan.name === "Platinum" ? "#fff" : "#1a1a1a" }}
                >
                  {plan.durationMonths} Months
                </div>
                <h2 className="font-display font-bold text-2xl text-white">{plan.name} Plan</h2>
                <p className="text-xs text-white/70">{plan.tagline}</p>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="text-center mb-6 pb-6 border-b border-border">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-numeric font-bold text-5xl text-brand">{(plan.returnRate * 100).toFixed(0)}%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Expected Return</p>
                <p className="text-xs text-muted-foreground mt-2">Minimum: {formatNaira(plan.minimum)}</p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Link to={`/plans/${plan.slug}`}>
                <Button className={`w-full ${plan.name === "Gold" ? "bg-gold hover:bg-gold-dark text-white border-0" : "bg-brand hover:bg-brand-dark"}`}>
                  View Details <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Trust banner */}
      <Card className="mt-10 p-8 bg-brand text-white flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <ShieldCheck className="w-10 h-10 text-gold flex-shrink-0" />
          <div>
            <h3 className="font-heading font-semibold text-lg">All commitments are secured</h3>
            <p className="text-sm text-white/70 mt-1">Backed by carefully selected real estate developments by Property Question Nigeria Limited.</p>
          </div>
        </div>
        <Link to="/support">
          <Button variant="outline" className="glass border-white/20 text-white hover:bg-white/10">Speak to an Officer</Button>
        </Link>
      </Card>
    </div>
  );
}