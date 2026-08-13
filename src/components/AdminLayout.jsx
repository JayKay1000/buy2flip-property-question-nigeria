import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/Logo";
import {
  LayoutDashboard, Users, CreditCard, TrendingUp, Megaphone, Banknote,
  LogOut, Menu, X, ShieldCheck, Trophy, UserCog, BarChart3, FolderOpen, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
  { label: "Verification Portal", path: "/admin-verification", icon: ShieldCheck },
  { label: "Participants", path: "/admin/participants", icon: Users },
  { label: "User Management", path: "/admin/users", icon: UserCog },
  { label: "Payments", path: "/admin/payments", icon: CreditCard },
  { label: "Withdrawals", path: "/admin/withdrawals", icon: Banknote },
  { label: "Commitments", path: "/admin/commitments", icon: TrendingUp },
  { label: "Announcements", path: "/admin/announcements", icon: Megaphone },
  { label: "Leaderboard", path: "/admin/leaderboard", icon: Trophy },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Documents", path: "/admin/documents", icon: FolderOpen },
  { label: "Launch Reset", path: "/admin/launch-reset", icon: AlertTriangle },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await base44.auth.logout("/login");
  };

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-white/10">
        <Logo light />
        <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
          <ShieldCheck className="w-3.5 h-3.5 text-gold" />
          <span>Admin Portal</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(item)
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item) ? "text-gold" : ""}`} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 space-y-3">
        {user && (
          <div className="px-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Signed in as</p>
            <p className="text-sm text-white/80 font-medium truncate">{user.email}</p>
          </div>
        )}
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
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-brand text-white z-40 hidden lg:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-brand text-white z-40 flex items-center justify-between px-4 shadow-md pt-safe">
        <div className="flex items-center gap-2">
          <Logo light size="sm" />
          <span className="text-xs text-gold font-medium">Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-brand text-white flex flex-col animate-slide-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <Logo light size="sm" />
              <button onClick={() => setSidebarOpen(false)} className="p-1">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(item) ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive(item) ? "text-gold" : ""}`} />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10">
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 w-full">
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}