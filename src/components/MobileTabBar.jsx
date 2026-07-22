import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Wallet, LifeBuoy, Receipt, MoreHorizontal, FolderOpen, Users } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

const tabs = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Plans", path: "/plans", icon: TrendingUp },
  { label: "Portfolio", path: "/portfolio", icon: Wallet },
  { label: "Transactions", path: "/transactions", icon: Receipt },
  { label: "Support", path: "/support", icon: LifeBuoy },
];

// Secondary pages reachable on mobile via the "More" sheet
const moreItems = [
  { label: "Documents", path: "/documents", icon: FolderOpen },
  { label: "Referrals", path: "/referrals", icon: Users },
];

export default function MobileTabBar({ tabLocations = {}, onTabReset }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreItems.some((i) => location.pathname.startsWith(i.path));

  const handleClick = (e, tab) => {
    const active = location.pathname.startsWith(tab.path);
    // If already on this tab, reset to its base root and clear saved memory
    if (active) {
      e.preventDefault();
      navigate(tab.path);
      onTabReset?.(tab.path);
    }
  };

  const go = (path) => {
    setMoreOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around pb-safe"
        style={{ boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}
      >
        {tabs.map((tab) => {
          const active = location.pathname.startsWith(tab.path);
          const dest = tabLocations[tab.path] || tab.path;
          return (
            <Link
              key={tab.path}
              to={dest}
              onClick={(e) => handleClick(e, tab)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 px-3 flex-1 transition-colors ${
                active ? "text-brand" : "text-muted-foreground"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${active ? "text-brand" : ""}`} />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex flex-col items-center justify-center gap-0.5 py-2 px-3 flex-1 transition-colors ${
            isMoreActive ? "text-brand" : "text-muted-foreground"
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? "text-brand" : ""}`} />
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </nav>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="pb-safe">
          <DrawerHeader className="text-center">
            <DrawerTitle>More</DrawerTitle>
          </DrawerHeader>
          <div className="grid grid-cols-2 gap-3 p-4 pb-6">
            {moreItems.map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => go(item.path)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-colors ${
                    active
                      ? "border-brand bg-brand/5 text-brand"
                      : "border-border text-foreground active:bg-accent"
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}