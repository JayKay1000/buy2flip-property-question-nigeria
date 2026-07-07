import React from "react";

export default function Logo({ light = false, size = "md", className = "" }) {
  const sizes = { sm: "text-base", md: "text-lg", lg: "text-2xl" };
  const subSize = { sm: "text-[8px]", md: "text-[9px]", lg: "text-[10px]" };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shadow-sm ring-1 ring-gold/30">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M3 21V8L12 3L21 8V21H14V14H10V21H3Z" stroke="#C9A227" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-display font-bold tracking-tight ${sizes[size]} ${light ? "text-white" : "text-foreground"}`}>
          Land<span className="text-gold">Banking</span>
        </span>
        <span className={`${subSize[size]} ${light ? "text-white/50" : "text-muted-foreground"} tracking-[0.15em] uppercase mt-0.5`}>
          Property Question
        </span>
      </div>
    </div>
  );
}