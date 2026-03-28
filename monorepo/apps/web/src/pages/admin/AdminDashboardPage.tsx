import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminStats, AdminStats } from "@/services/aiService";

const statCards = [
  { key: "total_posts", label: "Total Posts" },
  { key: "pending_review", label: "Pending Reviews" },
  { key: "rejected_posts", label: "In Recycling Bin" },
  { key: "total_users", label: "Registered Users" },
  { key: "open_reports", label: "Open Reports" },
] as const;

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getAdminStats(user.uid);
        setStats(data);
      } catch (err) {
        setError("Failed to load admin metrics.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, isAdmin]);

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Monitor post moderation, user safety, and system trust metrics."
    >
      {loading ? (
        <div className="text-slate-600">Loading dashboard...</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => (
            <Card key={card.key} className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-700">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">
                  {stats?.[card.key] ?? 0}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
