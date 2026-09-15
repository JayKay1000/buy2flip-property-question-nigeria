import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import SocialLinks from "@/components/SocialLinks";

export default function Footer() {
  return (
    <footer id="contact" className="bg-charcoal text-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Logo light />
            <p className="mt-5 text-sm max-w-md leading-relaxed">
              Buy2Flip is a secure wealth-building platform by Property Question Nigeria Limited,
              enabling structured financial commitments backed by carefully selected real estate developments.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/register" className="hover:text-gold transition-colors">Get Started</Link></li>
              <li><Link to="/login" className="hover:text-gold transition-colors">Log in</Link></li>
              <li><a href="#plans" className="hover:text-gold transition-colors">Commitment Plans</a></li>
              <li><a href="#how-it-works" className="hover:text-gold transition-colors">How It Works</a></li>
              <li><Link to="/terms" className="hover:text-gold transition-colors">Terms of Service</Link></li>
              <li><Link to="/delete-account" className="hover:text-gold transition-colors">Delete Account</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gold/70 flex-shrink-0" /> PROPERTY QUESTION NIGERIA LIMITED</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold/70 flex-shrink-0" /> subscribe@buy2flip.net</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold/70 flex-shrink-0" /> +234 703 509 7722</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gold/70 flex-shrink-0 mt-0.5" /> Suite 43, Ogba Shopping Arcade, Ijaiye Road, Ogba, Lagos, Nigeria</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">Follow Us</h4>
            <SocialLinks variant="light" />
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-xs text-white/40 space-y-2">
          <p>© {new Date().getFullYear()} Property Question Nigeria Limited. All rights reserved.</p>
          <p className="max-w-3xl leading-relaxed">
            This platform facilitates structured financial commitments into real estate. Expected returns are based on
            selected commitment plans and are subject to terms and conditions. Please seek independent legal advice
            regarding applicable regulations before participating.
          </p>
        </div>
      </div>
    </footer>
  );
}