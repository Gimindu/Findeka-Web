// Component module: AdminLayout
// Purpose: Shared UI/business logic used across multiple pages.

import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  Trash2,
  Users,
  ShieldAlert,
  LogOut,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const adminNav = [
  { label: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Post Review", href: "/admin/post-review", icon: ClipboardCheck },
  { label: "Recycling Bin", href: "/admin/recycling-bin", icon: Trash2 },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Reports", href: "/admin/reports", icon: ShieldAlert },
];

export default function AdminLayout({
  children,
  title,
  subtitle,
}: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-72 border-r border-slate-200 bg-white/90 backdrop-blur-xl transition-transform duration-300 md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col px-4 py-5">
          <div className="mb-8 flex items-center justify-between pl-2">
            <Link to="/dashboard" className="flex items-center">
              <div className="mr-3 rounded-lg bg-[#DD6B20] p-2 shadow-lg shadow-orange-500/25">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">Findeka</p>
                <p className="text-xs text-slate-500">Administration</p>
              </div>
            </Link>
            <button
              type="button"
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close admin navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ul className="space-y-1.5 flex-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2.5 transition-colors",
                      isActive
                        ? "bg-orange-100 text-[#DD6B20]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-[#DD6B20]" : "text-slate-500",
                      )}
                    />
                    <span className="ml-3 font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            onClick={handleLogout}
            className="mt-auto flex w-full items-center rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3 font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <div className="p-3 sm:p-4 md:ml-72">
        <header className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open admin navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {title}
            </h1>
          </div>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}


