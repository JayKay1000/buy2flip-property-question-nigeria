import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/Logo";
import MobileTabBar from "@/components/MobileTabBar";
import MobileHeader from "@/components/MobileHeader";
import { LayoutDashboard, TrendingUp, Wallet, Users, LifeBuoy, LogOut, Receipt, Bot, Banknote, ScrollText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Commitment Plans", path: "/plans", icon: TrendingUp },
  { label: "Portfolio", path: "/portfolio", icon: Wallet },
  { label: "Withdrawal Status", path: "/withdrawal-status", icon: Banknote },
  { label: "Transactions", path: "/transactions", icon: Receipt },
  { label: "Referrals", path: "/referrals", icon: Users },
  { label: "Support", path: "/support", icon: LifeBuoy },
  { label: "Support Assistant", path: "/support-assistant", icon: Bot },
  { label: "Terms of Service", path: "/terms", icon: ScrollText },
];

const TAB_ROOTS = ["/dashboard", "/plans", "/portfolio", "/transactions", "/support"];

const getTabForPath = (p) =>
  TAB_ROOTS.find((r) => p === r || p.startsWith(r + "/"));

export default function AppLayout() {
  const location = useLocation();
  const [tabLocations, setTabLocations] = useState({});

  useEffect(() => {
    const tab = getTabForPath(location.pathname);
    if (tab) {
      setTabLocations((prev) =>
        prev[tab] === location.pathname ? prev : { ...prev, [tab]: location.pathname }
      );
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

      {/* Mobile bottom tab bar */}
      <MobileTabBar tabLocations={tabLocations} />

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
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}