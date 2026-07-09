import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Mail, ArrowLeft } from "lucide-react";

export default function ContactOfficer() {
  const navigate = useNavigate();
  const phoneNumber = "+234 903 339 3000";
  const phoneDigits = "2349033393000";
  const whatsappDigits = "2349033393000";
  const email = "info@propertyquestion.net";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pt-32 pb-20">
        <div className="max-w-3xl w-full">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>

          <div className="text-center mb-12">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-3">
              Speak With A Relationship Officer
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our team is ready to guide you through your land banking journey. Reach out through any of the channels below.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Call Phone Number */}
            <a
              href={`tel:+${phoneDigits}`}
              className="group flex items-center gap-6 p-8 rounded-2xl border-2 border-border hover:border-brand/40 bg-card hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand/20 transition-colors">
                <Phone className="w-8 h-8 text-brand" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Call Phone Number</p>
                <p className="font-numeric font-bold text-2xl sm:text-3xl text-foreground">{phoneNumber}</p>
              </div>
            </a>

            {/* Chat on WhatsApp */}
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-6 p-8 rounded-2xl border-2 border-border hover:border-brand/40 bg-card hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand/20 transition-colors">
                <MessageCircle className="w-8 h-8 text-brand" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Chat on WhatsApp</p>
                <p className="font-numeric font-bold text-2xl sm:text-3xl text-foreground">{phoneNumber}</p>
              </div>
            </a>

            {/* Info Email */}
            <a
              href={`mailto:${email}`}
              className="group flex items-center gap-6 p-8 rounded-2xl border-2 border-border hover:border-brand/40 bg-card hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand/20 transition-colors">
                <Mail className="w-8 h-8 text-brand" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Info Email</p>
                <p className="font-numeric font-bold text-2xl sm:text-3xl text-foreground">{email}</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}