import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Flag, ShieldX, Trash2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  getReports,
  rejectReport,
  removeReportedItem,
  UserReport,
} from "@/services/aiService";

export default function AdminReportsPage() {
  const { user, isAdmin } = useAuth();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    reportId: string;
    kind: "reject" | "remove";
  } | null>(null);

  const loadReports = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getReports(user.uid);
      setReports(data.reports || []);
    } catch {
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadReports();
    }
  }, [user, isAdmin]);

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const onRejectReport = async (reportId: string) => {
    setPendingAction({ reportId, kind: "reject" });
  };

  const onRejectReportConfirmed = async (reportId: string) => {
    try {
      setBusyId(reportId);
      await rejectReport(user.uid, reportId);
      setPendingAction(null);
      await loadReports();
    } finally {
      setBusyId(null);
    }
  };

  const onRemoveItem = async (reportId: string) => {
    setPendingAction({ reportId, kind: "remove" });
  };

  const onRemoveItemConfirmed = async (reportId: string) => {
    try {
      setBusyId(reportId);
      await removeReportedItem(user.uid, reportId);
      setPendingAction(null);
      await loadReports();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout
      title="Suspicious Reports"
      subtitle="Review flagged posts and resolve abuse reports from users."
    >
      {loading ? (
        <div className="text-slate-600">Loading reports...</div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {!loading && reports.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
            No reports submitted.
          </div>
        ) : null}

        {reports.map((report) => (
          <Card key={report._id} className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flag className="h-5 w-5 text-red-500" />
                Report by {report.reporter_uid || "unknown"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <img
                  src={
                    report.item?.image_url ||
                    "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image"
                  }
                  alt={report.item?.name || "reported item"}
                  className="h-40 w-full rounded-lg object-cover"
                />
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold text-slate-800">
                      Reason:
                    </span>{" "}
                    {report.reason || "No reason provided."}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">
                      Status:
                    </span>{" "}
                    {report.status}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Item:</span>{" "}
                    {report.item?.name || "Item not found"}
                  </p>
                  <p className="text-slate-600">
                    {report.item?.description || "No item description."}
                  </p>

                  {report.status === "pending" ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        onClick={() => onRemoveItem(report._id)}
                        disabled={busyId === report._id}
                        variant="destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Item
                      </Button>
                      <Button
                        onClick={() => onRejectReport(report._id)}
                        disabled={busyId === report._id}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <ShieldX className="mr-2 h-4 w-4" />
                        Reject Report
                      </Button>
                    </div>
                  ) : report.status === "resolved" ? (
                    <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      Resolved
                    </div>
                  ) : (
                    <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                      Report Rejected
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pendingAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <Card className="w-full max-w-md border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Confirm Action</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">
                {pendingAction.kind === "remove"
                  ? "Remove the reported listing and close this report?"
                  : "Reject this report and keep the listing?"}
              </p>
              <div className="mt-4 flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setPendingAction(null)}
                  disabled={busyId === pendingAction.reportId}
                >
                  Cancel
                </Button>
                <Button
                  variant={pendingAction.kind === "remove" ? "destructive" : "default"}
                  className={pendingAction.kind === "remove" ? "" : "bg-amber-600 hover:bg-amber-700"}
                  onClick={() =>
                    pendingAction.kind === "remove"
                      ? onRemoveItemConfirmed(pendingAction.reportId)
                      : onRejectReportConfirmed(pendingAction.reportId)
                  }
                  disabled={busyId === pendingAction.reportId}
                >
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </AdminLayout>
  );
}
