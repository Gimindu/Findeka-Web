// Page module: AdminRecyclingBinPage
// Purpose: Handles this page's UI state and user actions.

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { RotateCcw, Trash2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  getRecycledPosts,
  restorePost,
  permanentlyDeletePost,
  ItemMatch,
} from "@/services/aiService";

export default function AdminRecyclingBinPage() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadRecycled = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getRecycledPosts(user.uid);
      setItems(data.items || []);
    } catch {
      setError("Failed to load recycling bin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadRecycled();
    }
  }, [user, isAdmin]);

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const onRestore = async (itemId: string) => {
    try {
      setBusyId(itemId);
      await restorePost(user.uid, itemId);
      await loadRecycled();
    } finally {
      setBusyId(null);
    }
  };

  const onPermanentDelete = async (itemId: string) => {
    setConfirmDeleteId(itemId);
  };

  const onPermanentDeleteConfirmed = async () => {
    if (!confirmDeleteId) return;
    try {
      setBusyId(confirmDeleteId);
      await permanentlyDeletePost(user.uid, confirmDeleteId);
      setConfirmDeleteId(null);
      await loadRecycled();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout
      title="Recycling Bin"
      subtitle="Manage rejected posts. Restore for re-review or remove permanently."
    >
      {loading ? (
        <div className="text-slate-600">Loading rejected posts...</div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {!loading && items.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
            Recycling bin is empty.
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
                    <span className="font-semibold">Reject Reason:</span>{" "}
                    {item.reject_reason || "No reason provided."}
                  </p>
                  <p className="text-sm text-slate-600">
                    {item.description || "No description."}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      onClick={() => onRestore(item._id)}
                      disabled={busyId === item._id}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore
                    </Button>
                    <Button
                      onClick={() => onPermanentDelete(item._id)}
                      disabled={busyId === item._id}
                      variant="destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Permanently
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {confirmDeleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <Card className="w-full max-w-md border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Confirm Permanent Delete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">
                Permanently delete this item? This cannot be undone.
              </p>
              <div className="mt-4 flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={busyId === confirmDeleteId}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={onPermanentDeleteConfirmed}
                  disabled={busyId === confirmDeleteId}
                >
                  Delete Permanently
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </AdminLayout>
  );
}

