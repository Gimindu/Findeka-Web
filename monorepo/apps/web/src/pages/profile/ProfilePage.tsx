import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Trophy,
  Edit,
  Search,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getUserProfile,
  getUserItems,
  ItemMatch,
  deleteItem,
} from "../../services/aiService";
import { useNavigate, Link } from "react-router-dom";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [userItems, setUserItems] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "pending" | "active" | "rejected" | "resolved"
  >("all");

  const initDelete = (itemId: string) => {
    setConfirmDeleteId(itemId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    const itemId = confirmDeleteId;
    setConfirmDeleteId(null);

    setDeletingId(itemId);
    try {
      await deleteItem(itemId);
      setUserItems((prev) =>
        prev.filter((i: any) => i._id !== itemId && i.id !== itemId),
      );
    } catch (err) {
      setErrorMsg("Failed to delete the item. Please try again.");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        const [profileData, myItemsData] = await Promise.all([
          getUserProfile(user.uid),
          getUserItems(user.uid),
        ]);
        setProfile(profileData);

        const myItems = myItemsData.items || [];
        myItems.sort(
          (a, b) =>
            new Date(b.created_at || b.date_lost || b.date_found).getTime() -
            new Date(a.created_at || a.date_lost || a.date_found).getTime(),
        );
        setUserItems(myItems);
      } catch (error) {
        console.error("Failed to load profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  const {
    firstName,
    lastName,
    location,
    phone,
    email,
    about,
    stats = {},
    created_at,
  } = profile || {};

  const fullName = firstName
    ? `${firstName} ${lastName || ""}`.trim()
    : user?.email?.split("@")[0] || "User";
  const userLocation = location || "Not provided";
  const userEmail = email || user?.email || "Not provided";
  const userPhone = phone || "Not provided";
  const joinDate = created_at
    ? new Date(created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  const filteredItems = userItems.filter((item: any) => {
    if (selectedFilter === "all") return true;
    return (item.status || "pending") === selectedFilter;
  });

  const filterCounts = {
    all: userItems.length,
    pending: userItems.filter((i: any) => (i.status || "pending") === "pending")
      .length,
    active: userItems.filter((i: any) => i.status === "active").length,
    rejected: userItems.filter((i: any) => i.status === "rejected").length,
    resolved: userItems.filter((i: any) => i.status === "resolved").length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-700">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {fullName}
                </h1>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" /> Joined {joinDate}
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/settings")}
              className="bg-[#DD6B20] hover:bg-[#C05615]"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Points", value: stats.points || 0, icon: Star },
                {
                  label: "Items Found",
                  value: stats.items_found || 0,
                  icon: Trophy,
                },
                { label: "Matches", value: stats.matches || 0, icon: Search },
                {
                  label: "Total Reports",
                  value: userItems.length,
                  icon: Calendar,
                },
              ].map((stat) => (
                <Card key={stat.label} className="border-slate-200">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-lg bg-slate-100 p-2">
                      <stat.icon className="h-4 w-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                      <p className="text-xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>My Reported Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-wrap gap-2">
                  {[
                    { key: "all", label: "All" },
                    { key: "pending", label: "Pending" },
                    { key: "active", label: "Approved" },
                    { key: "rejected", label: "Rejected" },
                    { key: "resolved", label: "Resolved" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedFilter(tab.key as any)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedFilter === tab.key
                          ? "bg-orange-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab.label} (
                      {filterCounts[tab.key as keyof typeof filterCounts]})
                    </button>
                  ))}
                </div>

                {filteredItems.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                    <p className="text-sm text-slate-500">
                      No items under this status yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {filteredItems.map((item: any) => (
                      <Card
                        key={item._id || item.id}
                        className="overflow-hidden border-slate-200"
                      >
                        <div className="relative h-40 bg-slate-100">
                          <img
                            src={
                              item.image_url ||
                              "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image"
                            }
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image";
                            }}
                          />
                          <div className="absolute left-3 top-3">
                            <span
                              className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                                item.type === "lost" || item.type === "Lost"
                                  ? "bg-red-500/90 text-white"
                                  : "bg-emerald-500/90 text-white"
                              }`}
                            >
                              {item.type || "unknown"}
                            </span>
                          </div>
                          <div className="absolute right-3 top-3 flex gap-2">
                            <button
                              onClick={() => initDelete(item._id || item.id)}
                              disabled={deletingId === (item._id || item.id)}
                              className="rounded-md bg-white/90 p-1.5 text-red-500 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-50"
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <h3 className="mb-1 line-clamp-1 font-bold text-slate-900">
                            {item.name}
                          </h3>
                          <p className="mb-2 flex items-center text-xs text-slate-500">
                            <Calendar className="mr-1 h-3.5 w-3.5 text-slate-400" />
                            {new Date(
                              item.created_at ||
                                item.date_lost ||
                                item.date_found ||
                                Date.now(),
                            ).toLocaleDateString()}
                          </p>
                          <p className="mb-3 line-clamp-2 text-sm text-slate-600">
                            {item.description}
                          </p>

                          <div
                            className={`mb-3 rounded-lg border p-3 text-xs leading-relaxed ${
                              item.status === "active"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : item.status === "rejected"
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : item.status === "resolved"
                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                    : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.status === "active"
                              ? "Admin approved this listing. It is now visible to all users."
                              : item.status === "rejected"
                                ? `Admin rejected this listing${item.reject_reason ? `: ${item.reject_reason}` : "."}`
                                : item.status === "resolved"
                                  ? "This listing has been marked as resolved."
                                  : "Waiting for admin approval. Your listing is submitted and under review."}
                          </div>

                          {item.status === "active" ? (
                            <Link to={`/item/${item._id || item.id}`}>
                              <Button
                                variant="outline"
                                className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-orange-600"
                              >
                                View Details & Status
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full border-slate-200 text-slate-500"
                              disabled
                            >
                              Awaiting Admin Review
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="h-full border-slate-200">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-slate-100 p-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="font-medium text-slate-900">{userEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-slate-100 p-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Phone</p>
                      <p className="font-medium text-slate-900">{userPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-slate-100 p-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="font-medium text-slate-900">
                        {userLocation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-slate-100 p-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Account Since</p>
                      <p className="font-medium text-slate-900">{joinDate}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                    About
                  </p>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {about || "No bio added yet. Go to settings to add one."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {userItems.length === 0 ? (
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                No items reported yet
              </h3>
              <p className="mt-1 max-w-sm text-slate-500">
                When you report a lost or found item, it will appear here with
                its admin review status.
              </p>
              <Button
                onClick={() => navigate("/report-item")}
                className="mt-6 bg-[#DD6B20] hover:bg-[#C05616]"
              >
                Report an Item
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Custom Modals */}
      <AnimatePresence>
        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6 text-center"
            >
              <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Delete Item?
              </h2>
              <p className="text-slate-500 mb-6 text-sm">
                Are you sure you want to permanently delete this item? This
                action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Error Modal */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6 text-center"
            >
              <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
              <p className="text-slate-500 mb-6 text-sm">{errorMsg}</p>
              <Button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                onClick={() => setErrorMsg(null)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
