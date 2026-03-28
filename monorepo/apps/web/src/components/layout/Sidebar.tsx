import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  MessageSquare,
  Trophy,
  Settings,
  LogOut,
  PlusCircle,
  Shield,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "../../contexts/AuthContext";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: PlusCircle, label: "Report Item", href: "/report-item" },
  { icon: Search, label: "Search & Match", href: "/search" },
  { icon: MessageSquare, label: "Messages", href: "/chat" },
  { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();

  const navItems = isAdmin
    ? [...sidebarItems, { icon: Shield, label: "Admin Panel", href: "/admin" }]
    : sidebarItems;

  const handleLogout = async () => {
    await logout();
    onClose?.();
    navigate("/auth");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white/80 backdrop-blur-xl transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-10 flex items-center justify-between pl-3">
          <div className="flex items-center">
            <div className="flex bg-[#DD6B20] p-2 rounded-lg mr-3 shadow-lg shadow-orange-500/20">
              <Search className="h-6 w-6 text-white" />
            </div>
            <span className="self-center text-xl font-bold whitespace-nowrap">
              Findeka
            </span>
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="space-y-2 font-medium flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => onClose?.()}
                  className={cn(
                    "relative flex items-center rounded-lg p-3 group transition-colors",
                    isActive
                      ? "text-[#DD6B20]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50",
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebar"
                      className="absolute inset-0 bg-orange-500/10 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 z-10 transition-colors",
                      isActive
                        ? "text-[#DD6B20]"
                        : "text-slate-500 group-hover:text-slate-900",
                    )}
                  />
                  <span className="ml-3 z-10">{item.label}</span>
                  {item.label === "Messages" && (
                    <span className="ml-auto bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-xs font-medium z-10">
                      3
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto border-t border-slate-200 pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-lg p-3 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-slate-500 group-hover:text-red-600 transition-colors" />
            <span className="ml-3">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
