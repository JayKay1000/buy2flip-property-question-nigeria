import React, { useState, useEffect, Suspense } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/Logo";
import MobileTabBar from "@/components/MobileTabBar";
import MobileHeader from "@/components/MobileHeader";
import LoginActivityTracker from "@/components/LoginActivityTracker";
import { LayoutDashboard, TrendingUp, Wallet, Users, LifeBuoy, LogOut, Receipt, Bot, Banknote, ScrollText, FolderOpen, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Commitment Plans", path: "/plans", icon: TrendingUp },
  { label: "Portfolio", path: "/portfolio", icon: Wallet },
  { label: "Withdrawal Status", path: "/withdrawal-status", icon: Banknote },
  { label: "Transactions", path: "/transactions", icon: Receipt },
  { label: "Documents", path: "/documents", icon: FolderOpen },
  { label: "Referrals", path: "/referrals", icon: Users },
  { label: "Support", path: "/support", icon: LifeBuoy },
  { label: "Support Assistant", path: "/support-assistant", icon: Bot },
  { label: "Account Security", path: "/security-settings", icon: Shield },
  { label: "Terms of Service", path: "/terms", icon: ScrollText },
];

const TAB_ROOTS = ["/dashboard", "/plans", "/portfolio", "/transactions", "/support"];

const getTabForPath = (p) =>
  TAB_ROOTS.find((r) => p === r || p.startsWith(r + "/"));

const TAB_MEMORY_KEY = "pqlb_tab_memory";
const loadTabMemory = () => {
  try {
    const raw = sessionStorage.getItem(TAB_MEMORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export default function AppLayout() {
  const location = useLocation();
  const [tabLocations, setTabLocations] = useState(loadTabMemory);

  useEffect(() => {
    const tab = getTabForPath(location.pathname);
    if (tab) {
      setTabLocations((prev) => {
        if (prev[tab] === location.pathname) return prev;
        const next = { ...prev, [tab]: location.pathname };
        try { sessionStorage.setItem(TAB_MEMORY_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-white/10">
        <Link to="/"><Logo light /></Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? "text-gold" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-brand text-white z-40 hidden lg:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <MobileHeader />
      <LoginActivityTracker />

      {/* Mobile bottom tab bar */}
      <MobileTabBar
        tabLocations={tabLocations}
        onTabReset={(path) =>
          setTabLocations((prev) => {
            const next = { ...prev };
            delete next[path];
            try { sessionStorage.setItem(TAB_MEMORY_KEY, JSON.stringify(next)); } catch {}
            return next;
          })
        }
      />

      {/* Main content */}
      <main className="lg:ml-72 pt-14 lg:pt-0 min-h-screen pb-20 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
              </div>
            }>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}