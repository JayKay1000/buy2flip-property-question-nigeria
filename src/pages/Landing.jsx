import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { PLANS, HOW_IT_WORKS_STEPS } from "@/lib/plans";
import { formatNaira } from "@/lib/format";
import {
  ArrowRight, ShieldCheck, TrendingUp, Users, Lock, Building2,
  CheckCircle2, Award, PhoneCall, Star } from
"lucide-react";

const features = [
{ icon: ShieldCheck, title: "High-End Security", desc: "Email OTP, password hashing, session management, and audit logs protect every transaction." },
{ icon: TrendingUp, title: "Strategic Returns", desc: "Up to 50% expected returns on carefully selected real estate developments." },
{ icon: Users, title: "Referral Rewards", desc: "Earn 2% on direct referrals and 0.5% on indirect referrals — automatically tracked." },
{ icon: Lock, title: "Secure Commitments", desc: "All commitments are backed by real estate, deployed by Property Question Nigeria Limited." },
{ icon: Building2, title: "Real Estate Backing", desc: "Your commitments are deployed into carefully selected, premium real estate developments." },
{ icon: Award, title: "Certified Portfolio", desc: "Download digital commitment certificates, statements, and acknowledgement letters." }];


const stats = [
{ value: "₦2B+", label: "COMMITMENTS" },
{ value: "500+", label: "Buy2Flip Participants" },
{ value: "65%", label: "Maximum Expected Return" },
{ value: "100%", label: "Land-EDGED Security" }];


export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
            alt="Luxury estate"
            className="w-full h-full object-cover" />
          
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/90 via-brand/75 to-brand-dark/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex-1 flex items-center w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 w-full">
            <div className="max-w-3xl">
            <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] tracking-tight animate-fade-up">
              <span className="text-gradient-gold">Buy2Flip</span>
              <br />
              Made Simple.
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Property Question Nigeria Limited helps you build wealth through strategic Buy2Flip —
              acquire premium land, earn returns according to your selected plan, and watch your portfolio grow.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-white border-0 h-14 px-8 text-base font-semibold">
                  Participate Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact-officer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto glass text-white border-white/20 hover:bg-white/10 h-14 px-6 sm:px-8 text-base font-semibold">
                  <PhoneCall className="w-5 h-5 mr-2 flex-shrink-0" /> Speak With A Relationship Officer
                </Button>
              </Link>
            </div>
            </div>
          </div>
        </div>
{/* GOOGLE ADSENSE AD START */}
      <div className="my-8 flex justify-center">
          <ins
            className="adsbygoogle"
            style={{display:"block"}}
            data-ad-client="ca-pub-5371658397951527"
            data-ad-slot="9876543210"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
      </div>
      {/* GOOGLE ADSENSE AD END */}
        {/* Stats bar */}
        <div className="relative z-10 border-t border-white/10 glass-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) =>
            <div key={stat.label} className="text-center">
                <div className="font-numeric font-bold text-2xl sm:text-3xl text-gold">{stat.value}</div>
                <div className="text-xs text-white/60 mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            )}
          </div>
        </div>
      </section>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5371658397951527"
     crossorigin="anonymous"></script>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">The Process</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mt-3 text-foreground">How It Works</h2>
            <p className="text-muted-foreground mt-4">From account creation to portfolio activation in eight simple steps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((step, i) =>
            <div key={step.step} className="relative">
                <Card className="p-6 h-full border-border hover:border-gold/40 transition-colors duration-300 hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                    <span className="font-numeric font-bold text-lg text-brand">{step.step}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
                </Card>
                {i < HOW_IT_WORKS_STEPS.length - 1 && i % 4 !== 3 &&
              <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-border" />
              }
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Plans Preview */}
      <section id="plans" className="py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">Commitment Plans</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mt-3 text-foreground">Choose Your Plan</h2>
            <p className="text-muted-foreground mt-4">Select a plan that aligns with your financial goals.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) =>
            <Card key={plan.slug} className={`overflow-hidden transition-all duration-300 hover:shadow-xl ${plan.name === "Gold" ? "ring-2 ring-gold" : ""}`}>
                <div className="relative h-40 overflow-hidden">
                  <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <h3 className="font-display font-bold text-2xl text-white">{plan.name} Plan</h3>
                    <p className="text-xs text-white/70">{plan.tagline}</p>
                  </div>
                  {plan.name === "Gold" &&
                <div className="absolute top-4 right-4 glass rounded-full px-3 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 text-gold fill-gold" />
                      <span className="text-xs font-medium text-white">Popular</span>
                    </div>
                }
                </div>
                <div className="p-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-numeric font-bold text-4xl text-brand">{(plan.returnRate * 100).toFixed(0)}%</span>
                    <span className="text-sm text-muted-foreground">expected return</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-6">{plan.durationMonths} months · from {formatNaira(plan.minimum)}</div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.benefits.slice(0, 4).map((benefit) =>
                  <li key={benefit} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                  )}
                  </ul>
                  <Link to={`/plans/${plan.slug}`}>
                    <Button variant="outline" className="w-full">View Plan Details</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">Why Choose Us</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mt-3 text-foreground">A Platform Built On Trust</h2>
            <p className="text-muted-foreground mt-4">Premium, secure, and transparent — designed for confidence.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) =>
            <Card key={feature.title} className="p-6 border-border hover:border-gold/40 transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-brand" />
                </div>
                <h3 className="font-heading font-semibold text-foreground text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brand relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Ready to Start Buy2Flip?
          </h2>
          <p className="text-white/70 mt-4 max-w-xl mx-auto">
            Join Property Question Nigeria Limited today and start building wealth through strategic Buy2Flip.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gold hover:bg-gold-dark text-white border-0 h-14 px-8 text-base font-semibold">
                Participate Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="glass text-white border-white/20 hover:bg-white/10 h-14 px-8 text-base font-semibold">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>);

}