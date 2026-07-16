import React, { useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Wallet, LifeBuoy, Receipt } from "lucide-react";

const tabs = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Plans", path: "/plans", icon: TrendingUp },
  { label: "Portfolio", path: "/portfolio", icon: Wallet },
  { label: "Transactions", path: "/transactions", icon: Receipt },
  { label: "Support", path: "/support", icon: LifeBuoy },
];

const TAB_ROOTS = tabs.map((t) => t.path);
const getTabForPath = (p) =>
  TAB_ROOTS.find((r) => p === r || p.startsWith(r + "/"));

export default function MobileTabBar({ tabLocations: propTabLocations = {} }) {
  const location = useLocation();
  const activeTabRoot = getTabForPath(location.pathname);
  const memoryRef = useRef({});

  // Memorize the last-visited sub-route for each tab so switching tabs preserves context
  useEffect(() => {
    const tab = getTabForPath(location.pathname);
    if (tab) {
      memoryRef.current = { ...memoryRef.current, [tab]: location.pathname };
    }
  }, [location.pathname]);

  const resolveDest = (tabPath) =>
    memoryRef.current[tabPath] || propTabLocations[tabPath] || tabPath;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around pb-safe"
      style={{ boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}
    >
      {tabs.map((tab) => {
        const active = location.pathname.startsWith(tab.path);
        const dest = resolveDest(tab.path);
        return (
          <Link
            key={tab.path}
            to={dest}
            className={`flex flex-col items-center justify-center gap-0.5 py-2 px-3 flex-1 transition-colors ${
              active ? "text-brand" : "text-muted-foreground"
            }`}
          >
            <tab.icon className={`w-5 h-5 ${active ? "text-brand" : ""}`} />
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}