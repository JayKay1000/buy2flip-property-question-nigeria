import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { ShieldCheck, TrendingUp, Users } from "lucide-react";

const trustItems = [
  { icon: ShieldCheck, label: "Bank-grade security" },
  { icon: TrendingUp, label: "Up to 50% expected return" },
  { icon: Users, label: "Referral reward programme" },
];

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex">
      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80"
            alt="Luxury estate"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/90 via-brand/80 to-brand-dark/95" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          <Link to="/">
            <Logo light size="lg" />
          </Link>
          <div>
            <h2 className="font-display font-bold text-3xl xl:text-4xl leading-tight max-w-md">
              Build Your Financial Future Through Strategic Land Banking
            </h2>
            <p className="text-white/70 mt-4 max-w-sm text-sm leading-relaxed">
              A secure wealth-building platform by Property Question Nigeria Limited, deploying your commitments into carefully selected real estate developments.
            </p>
            <div className="mt-8 space-y-3">
              {trustItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-sm text-white/80">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} Property Question Nigeria Limited</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 flex justify-center">
            <Link to="/"><Logo size="lg" /></Link>
          </div>
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand mb-4">
              <Icon className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
          </div>
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">
            {children}
          </div>
          {footer && (
            <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
          )}
        </div>
      </div>
    </div>
  );
}