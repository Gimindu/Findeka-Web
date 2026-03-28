import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Bell, User } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserNotifications, getUserProfile } from "@/services/aiService";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("User");
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const loadProfileName = async () => {
      if (!user) {
        setDisplayName("User");
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        const fullName =
          `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
        if (fullName) {
          setDisplayName(fullName);
          return;
        }
      } catch {
        // Fall back to email/uid display name when profile fetch fails.
      }

      const emailName = user.email?.split("@")[0]?.trim();
      setDisplayName(emailName || "User");
    };

    loadProfileName();
  }, [user?.uid, user?.email]);

  useEffect(() => {
    const loadUnreadNotifications = async () => {
      if (!user) {
        setUnreadNotifications(0);
        return;
      }
      try {
        const data = await getUserNotifications(user.uid);
        setUnreadNotifications(
          (data.notifications || []).filter((n: any) => !n.read).length,
        );
      } catch {
        setUnreadNotifications(0);
      }
    };

    loadUnreadNotifications();
    const interval = setInterval(loadUnreadNotifications, 20000);
    return () => clearInterval(interval);
  }, [user?.uid]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="p-4 sm:ml-64">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur-xl border border-white/20">
          <h2 className="text-xl font-semibold text-slate-800">Overview</h2>

          <div className="flex items-center gap-4">
            <Link to="/notifications">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full relative hover:bg-slate-100"
              >
                <Bell className="h-5 w-5 text-slate-600" />
                {unreadNotifications > 0 ? (
                  <span className="absolute top-1 right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white border-2 border-white">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                ) : null}
              </Button>
            </Link>
            <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
            <Link to="/profile">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500">Premium Member</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                  <User className="h-full w-full p-1 text-slate-500" />
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>
      </div>
    </div>
  );
}
