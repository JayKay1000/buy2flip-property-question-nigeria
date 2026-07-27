import React, { useState, useEffect } from "react";

export default function MaturityCountdown({ maturityDate, className = "" }) {
  const [now, setNow] = useState(Date.now());
  const target = maturityDate ? new Date(maturityDate).getTime() : 0;

  useEffect(() => {
    if (!maturityDate || target <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [maturityDate, target]);

  const remaining = Math.max(0, target - now);
  if (!maturityDate) return <span className={className}>—</span>;
  if (remaining <= 0) {
    return (
      <span className={`font-numeric font-medium text-brand ${className}`}>
        Matured
      </span>
    );
  }

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <span className={`font-numeric font-medium text-gold-dark tabular-nums ${className}`}>
      {days}d {String(hours).padStart(2, "0")}h {String(minutes).padStart(2, "0")}m{" "}
      {String(seconds).padStart(2, "0")}s
    </span>
  );
}