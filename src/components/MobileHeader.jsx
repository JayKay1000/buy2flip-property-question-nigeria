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
  const handleLogout = () => base44.auth.logout("/");

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-brand text-white z-40 flex items-center shadow-md pt-safe px-1">
      <div className="flex items-center flex-1 min-w-0">
        {isTabRoot ? (
          <button onClick={() => navigate("/dashboard")} className="p-2">
            <Logo light size="sm" />
          </button>
        ) : (
          <button
            onClick={handleBack}
            aria-label="Back"
            className="flex items-center px-2 py-2 text-white active:opacity-70 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </div>
      <h1 className="font-heading font-semibold text-white text-base truncate max-w-[55%] text-center px-2">
        {title}
      </h1>
      <div className="flex items-center justify-end flex-1">
        <button
          onClick={() => navigate("/security-settings")}
          aria-label="Account security"
          className={`p-2 text-white active:opacity-70 transition-opacity ${pathname === "/security-settings" ? "opacity-100" : "opacity-90"}`}
        >
          <Shield className="w-5 h-5" />
        </button>
        <button
          onClick={handleLogout}
          aria-label="Sign out"
          className="p-2 text-white active:opacity-70 transition-opacity"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}