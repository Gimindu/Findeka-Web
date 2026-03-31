import { DashboardLayout } from "@/components/layout/DashboardLayout";

import { Button } from "@/components/ui/button";
import { Check, Info, AlertTriangle, Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserNotification,
  acceptMatch,
  completeMatch,
  clearUserNotifications,
  getMatch,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  rejectMatch,
} from "@/services/aiService";

function timeAgo(dateValue?: string) {
  if (!dateValue) return "Just now";
  // Backward compatibility: older records may store ISO without timezone.
  // Treat timezone-less timestamps as UTC to avoid local-time offset errors.
  const normalizedDateValue = /Z|[+-]\d\d:\d\d$/.test(dateValue)
    ? dateValue
    : `${dateValue}Z`;
  const then = new Date(normalizedDateValue).getTime();
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [timelines, setTimelines] = useState<Record<string, any[]>>({});
  const [timelineLoading, setTimelineLoading] = useState<
    Record<string, boolean>
  >({});

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

  const handleClearAll = async () => {
    if (!user || notifications.length === 0) return;
    try {
      await clearUserNotifications(user.uid);
      setNotifications([]);
      setTimelines({});
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to clear notifications");
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

  const setNotifLoading = (notifId: string, value: boolean) => {
    setActionLoading((prev) => ({ ...prev, [notifId]: value }));
  };

  const handleMatchAction = async (
    notif: UserNotification,
    action: "accept" | "reject" | "complete",
  ) => {
    if (!user || !notif.match_id) return;
    try {
      setNotifLoading(notif._id, true);
      if (action === "accept") {
        await acceptMatch(user.uid, notif.match_id);
      } else if (action === "reject") {
        await rejectMatch(user.uid, notif.match_id);
      } else {
        await completeMatch(user.uid, notif.match_id);
      }
      await loadNotifications();
    } catch (err: any) {
      setError(err?.message || "Failed to process match action");
    } finally {
      setNotifLoading(notif._id, false);
    }
  };

  const handleOpenItem = (notif: UserNotification) => {
    if (!notif.matched_item_id) return;
    navigate(`/report-item?matchItemId=${notif.matched_item_id}`);
  };

  const handleToggleTimeline = async (notif: UserNotification) => {
    if (!user || !notif.match_id) return;
    if (timelines[notif._id]) {
      setTimelines((prev) => {
        const next = { ...prev };
        delete next[notif._id];
        return next;
      });
      return;
    }
    try {
      setTimelineLoading((prev) => ({ ...prev, [notif._id]: true }));
      const data = await getMatch(user.uid, notif.match_id);
      setTimelines((prev) => ({
        ...prev,
        [notif._id]: data.match.timeline || [],
      }));
    } catch (err: any) {
      setError(err?.message || "Failed to load timeline");
    } finally {
      setTimelineLoading((prev) => ({ ...prev, [notif._id]: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Notifications
            </h1>
            <p className="text-slate-500">
              Stay updated with your latest activity.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-slate-600"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4 mr-2" /> Mark all as read
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              Clear notifications
            </Button>
          </div>
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

                {(notif.counterpart_name || notif.counterpart_uid) && (
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2">
                    <p className="text-xs font-semibold text-amber-700">
                      {notif.counterpart_role
                        ? `${String(notif.counterpart_role).charAt(0).toUpperCase()}${String(notif.counterpart_role).slice(1)} details`
                        : "User details"}
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      Name: {notif.counterpart_name || "Not provided"}
                    </p>
                    <p className="text-xs text-amber-800">
                      UID: {notif.counterpart_uid || "Not available"}
                    </p>
                    {notif.counterpart_location ? (
                      <p className="text-xs text-amber-800">
                        Location: {notif.counterpart_location}
                      </p>
                    ) : null}
                    {notif.counterpart_item_name ? (
                      <p className="text-xs text-amber-800">
                        Item: {notif.counterpart_item_name}
                      </p>
                    ) : null}
                    {notif.counterpart_phone ? (
                      <a
                        href={`tel:${notif.counterpart_phone}`}
                        className="inline-block mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Call {notif.counterpart_phone}
                        </Button>
                      </a>
                    ) : (
                      <p className="text-xs text-amber-700 mt-1">
                        Phone: Not provided
                      </p>
                    )}
                  </div>
                )}

                {notif.type === "match" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {notif.match_action === "review" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={!!actionLoading[notif._id]}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMatchAction(notif, "accept");
                          }}
                        >
                          Accept Match
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!!actionLoading[notif._id]}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMatchAction(notif, "reject");
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {notif.match_action === "complete" && (
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700"
                        disabled={!!actionLoading[notif._id]}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMatchAction(notif, "complete");
                        }}
                      >
                        Mark Handover Complete
                      </Button>
                    )}

                    {notif.matched_item_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenItem(notif);
                        }}
                      >
                        Open Item
                      </Button>
                    )}

                    {notif.match_id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTimeline(notif);
                        }}
                        disabled={!!timelineLoading[notif._id]}
                      >
                        {timelineLoading[notif._id]
                          ? "Loading timeline..."
                          : timelines[notif._id]
                            ? "Hide Timeline"
                            : "View Timeline"}
                      </Button>
                    )}
                  </div>
                )}

                {timelines[notif._id] && (
                  <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      Match Timeline
                    </p>
                    <div className="space-y-1">
                      {timelines[notif._id].map((step: any, idx: number) => (
                        <p key={idx} className="text-xs text-slate-600">
                          {step.status} - {timeAgo(step.at)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
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
