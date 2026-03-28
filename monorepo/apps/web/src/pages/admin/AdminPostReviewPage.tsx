import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPendingPosts,
  approvePost,
  rejectPost,
  ItemMatch,
} from "@/services/aiService";

export default function AdminPostReviewPage() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);

  const loadPending = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getPendingPosts(user.uid);
      setItems(data.items || []);
    } catch {
      setError("Failed to load pending posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadPending();
    }
  }, [user, isAdmin]);

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const onApprove = async (itemId: string) => {
    setConfirmApproveId(itemId);
  };

  const onApproveConfirmed = async (itemId: string) => {
    try {
      setBusyId(itemId);
      await approvePost(user.uid, itemId);
      setConfirmApproveId(null);
      await loadPending();
    } finally {
      setBusyId(null);
    }
  };

  const onReject = async (itemId: string) => {
    const reason = window.prompt("Optional reject reason:", "") ?? "";
    try {
      setBusyId(itemId);
      await rejectPost(user.uid, itemId, reason);
      await loadPending();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout
      title="Post Review Queue"
      subtitle="Approve valid posts for public visibility or reject misleading submissions."
    >
      {loading ? (
        <div className="text-slate-600">Loading pending posts...</div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {!loading && items.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
            No pending posts.
          </div>
        ) : null}

        {items.map((item) => (
          <Card key={item._id} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">
                {item.name || item.title || "Untitled Item"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <img
                  src={
                    item.image_url ||
                    "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image"
                  }
                  alt={item.name || "item"}
                  className="h-40 w-full rounded-lg object-cover"
                />
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Type:</span>{" "}
                    {(item.type || "unknown").toUpperCase()}
                  </p>
                  <p>
                    <span className="font-semibold">Category:</span>{" "}
                    {item.category || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Location:</span>{" "}
                    {item.location || "N/A"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {item.description || "No description."}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      onClick={() => onApprove(item._id)}
                      disabled={busyId === item._id}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => onReject(item._id)}
                      disabled={busyId === item._id}
                      variant="destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>

                  {confirmApproveId === item._id ? (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-sm font-medium text-emerald-800">
                        Do you want to approve this post?
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button
                          onClick={() => onApproveConfirmed(item._id)}
                          disabled={busyId === item._id}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Yes, Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setConfirmApproveId(null)}
                          disabled={busyId === item._id}
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
