import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/Logo";

const ROUTE_TITLES = {
  "/dashboard": "Dashboard",
  "/plans": "Commitment Plans",
  "/portfolio": "Portfolio",
  "/transactions": "Transactions",
  "/support": "Support",
  "/referrals": "Referrals",
  "/documents": "Document Centre",
  "/withdrawal-status": "Withdrawal Status",
  "/support-assistant": "Support Assistant",
  "/security-settings": "Account Security",
  "/terms": "Terms of Service",
  "/payment": "Payment",
};

const TAB_ROOTS = [
  "/dashboard",
  "/plans",
  "/portfolio",
  "/transactions",
  "/support",
];

function getTitle(pathname) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith("/plans/")) return "Plan Details";
  return "Property Question";
}

export default function MobileHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const isTabRoot = TAB_ROOTS.includes(pathname);
  const title = getTitle(pathname);

  const handleBack = () => navigate(-1);
  // SOURCE FIX: fire the Base44 logout endpoint at its ABSOLUTE URL (not the
  // relative /api/apps/auth/logout that base44.auth.logout() builds from the
  // empty appBaseUrl → Hostinger 404), clear the local token, and redirect
  // client-side to the public landing page.
  const handleLogout = () => {
    window.localStorage.removeItem("base44_access_token");
    window.localStorage.removeItem("token");
    fetch("https://base44.app/api/apps/auth/logout", {
      credentials: "include",
      mode: "no-cors",
      keepalive: true,
    }).catch(() => {});
    window.location.href = window.location.origin + "/";
  };

  return (
    <header className="lg:hidden bg-brand text-white z-40 pt-safe shadow-md">
      <div className="h-14 flex items-center px-1">
        <div className="flex items-center flex-shrink-0">
          {isTabRoot ? (
            <button onClick={() => navigate("/dashboard")} aria-label="Home" className="h-10 w-10 flex items-center justify-center rounded-lg active:bg-white/10 transition-colors">
              <Logo light size="sm" />
            </button>
          ) : (
            <button
              onClick={handleBack}
              aria-label="Back"
              className="h-10 w-10 flex items-center justify-center rounded-lg text-white active:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        <h1 className="flex-1 min-w-0 font-heading font-semibold text-white text-sm sm:text-base text-center px-2 truncate">
          {title}
        </h1>
        <div className="flex items-center justify-end flex-shrink-0 gap-1">
          <button
            onClick={() => navigate("/security-settings")}
            aria-label="Account security"
            className={`h-10 w-10 flex items-center justify-center rounded-lg text-white active:bg-white/10 transition-colors ${pathname === "/security-settings" ? "opacity-100" : "opacity-90"}`}
          >
            <Shield className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            aria-label="Sign out"
            className="h-10 w-10 flex items-center justify-center rounded-lg text-white active:bg-white/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}