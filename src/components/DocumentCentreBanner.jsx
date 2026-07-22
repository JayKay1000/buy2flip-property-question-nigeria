import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Building2, MapPin, ShieldCheck, ArrowRight } from "lucide-react";

const BANNER_URL = "https://media.base44.com/images/public/6a4d7c087d41148d5f9d3c8c/7de964ab9_generated_image.png";

export default function DocumentCentreBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-8 shadow-lg">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={BANNER_URL}
          alt="Colony Enclave land development, Epe, Lagos"
          fittingType="fill"
          focalPointY={0.4}
          className="w-full h-full" />
        
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/70 to-brand/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative px-6 sm:px-10 py-8 sm:py-12 lg:py-14 text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-4">
          <Building2 className="w-3.5 h-3.5 text-gold" />
          <span className="text-xs font-medium tracking-wide uppercase">Land Allocation & Document Centre</span>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl max-w-xl leading-tight">
          Your Land-Backed Commitment, Fully Transparent
        </h1>

        <p className="text-white/70 text-sm sm:text-base mt-2 max-w-lg">
          Explore your proportional land allocation and download official project documents for Colony Enclave, Epe.
        </p>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <MapPin className="w-4 h-4 text-gold" />
            <span>Colony Enclave, Epe, Lagos</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>Land-Backed Commitments</span>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 mt-7 px-5 py-2.5 rounded-xl bg-gold text-charcoal font-medium text-sm hover:bg-gold-light transition-colors no-select">View My Commitments


        </Link>
      </div>
    </div>);

}