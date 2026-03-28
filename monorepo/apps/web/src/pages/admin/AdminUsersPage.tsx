import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Ban, Trash2, UserCheck } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllUsers,
  suspendUser,
  unsuspendUser,
  deleteUserByAdmin,
} from "@/services/aiService";

export default function AdminUsersPage() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  const loadUsers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getAllUsers(user.uid);
      setUsers(data.users || []);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadUsers();
    }
  }, [user, isAdmin]);

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const onSuspendToggle = async (targetUid: string, suspended: boolean) => {
    try {
      setBusyUid(targetUid);
      if (suspended) {
        await unsuspendUser(user.uid, targetUid);
      } else {
        await suspendUser(user.uid, targetUid);
      }
      await loadUsers();
    } finally {
      setBusyUid(null);
    }
  };

  const onDeleteUser = async (targetUid: string) => {
    const ok = window.confirm(
      "Delete this user and all their posts? This cannot be undone.",
    );
    if (!ok) return;
    try {
      setBusyUid(targetUid);
      await deleteUserByAdmin(user.uid, targetUid);
      await loadUsers();
    } finally {
      setBusyUid(null);
    }
  };

  return (
    <AdminLayout
      title="User Management"
      subtitle="View registered users and take disciplinary actions for abuse prevention."
    >
      {loading ? <div className="text-slate-600">Loading users...</div> : null}
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {!loading && users.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
            No users found.
          </div>
        ) : null}

        {users.map((u) => {
          const targetUid = u.firebase_uid || "";
          const isTargetAdmin = u.role === "admin";
          return (
            <Card key={u._id || targetUid} className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  {u.firstName || "User"} {u.lastName || ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-800">UID:</span>{" "}
                      {targetUid || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">
                        Role:
                      </span>{" "}
                      {u.role || "user"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">
                        Status:
                      </span>{" "}
                      {u.suspended ? "Suspended" : "Active"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => onSuspendToggle(targetUid, !!u.suspended)}
                      disabled={
                        !targetUid || busyUid === targetUid || isTargetAdmin
                      }
                      className={
                        u.suspended
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-amber-600 hover:bg-amber-700"
                      }
                    >
                      {u.suspended ? (
                        <UserCheck className="mr-2 h-4 w-4" />
                      ) : (
                        <Ban className="mr-2 h-4 w-4" />
                      )}
                      {u.suspended ? "Unsuspend" : "Suspend"}
                    </Button>
                    <Button
                      onClick={() => onDeleteUser(targetUid)}
                      disabled={
                        !targetUid || busyUid === targetUid || isTargetAdmin
                      }
                      variant="destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AdminLayout>
  );
}
