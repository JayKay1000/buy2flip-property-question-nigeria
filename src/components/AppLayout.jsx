import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/Logo";
import { LayoutDashboard, TrendingUp, Wallet, Users, LifeBuoy, LogOut, Menu, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Commitment Plans", path: "/plans", icon: TrendingUp },
  { label: "Portfolio", path: "/portfolio", icon: Wallet },
  { label: "Referrals", path: "/referrals", icon: Users },
  { label: "Support", path: "/support", icon: LifeBuoy },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
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
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-brand text-white z-40 flex items-center justify-between px-4 shadow-md">
        <Link to="/dashboard"><Logo light size="sm" /></Link>
        <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-brand text-white flex flex-col animate-slide-in">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <Logo light />
              <button onClick={() => setSidebarOpen(false)} className="p-1">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
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
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 w-full"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}