import { DashboardLayout } from "@/components/layout/DashboardLayout";

import { Button } from "@/components/ui/button";
import { Check, Info, AlertTriangle, Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import {
  UserNotification,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/aiService";

function timeAgo(dateValue?: string) {
  if (!dateValue) return "Just now";
  const then = new Date(dateValue).getTime();
  const now = Date.now();
  const diffSec = Math.max(1, Math.floor((now - then) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function NotificationPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const loadNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getUserNotifications(user.uid);
      setNotifications(data.notifications || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user?.uid]);

  const handleMarkAllRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      await markAllNotificationsRead(user.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError("Failed to mark all notifications as read");
    }
  };

  const handleMarkRead = async (notifId: string) => {
    if (!user) return;
    try {
      await markNotificationRead(user.uid, notifId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, read: true } : n)),
      );
    } catch {
      setError("Failed to mark notification as read");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
            <p className="text-slate-500">
              Stay updated with your latest activity.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-slate-600"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-2" /> Mark all as read
          </Button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              Loading notifications...
            </div>
          ) : null}
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {!loading && notifications.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
              No notifications yet.
            </div>
          ) : null}
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={cn(
                "flex cursor-pointer gap-4 p-4 rounded-xl border transition-all hover:shadow-md",
                notif.read
                  ? "bg-white border-slate-100"
                  : "bg-orange-50 border-orange-100 shadow-sm",
              )}
              onClick={() => !notif.read && handleMarkRead(notif._id)}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                  notif.type === "match"
                    ? "bg-green-100 text-green-600"
                    : notif.type === "alert"
                      ? "bg-red-100 text-red-600"
                      : notif.type === "system"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-600",
                )}
              >
                {notif.type === "match" && <Search className="h-5 w-5" />}
                {notif.type === "alert" && (
                  <AlertTriangle className="h-5 w-5" />
                )}
                {notif.type === "system" && <Info className="h-5 w-5" />}
                {notif.type === "update" && <Package className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4
                    className={cn(
                      "font-semibold text-sm",
                      notif.read ? "text-slate-900" : "text-[#DD6B20]",
                    )}
                  >
                    {notif.title}
                  </h4>
                  <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                    {timeAgo(notif.created_at)}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mt-1">{notif.message}</p>
              </div>
              {!notif.read && (
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-[#DD6B20]"></span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
