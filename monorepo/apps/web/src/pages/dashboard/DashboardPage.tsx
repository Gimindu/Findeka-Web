// Page module: DashboardPage
// Purpose: Handles this page's UI state and user actions.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  CheckCircle2,
  Trophy,
  MapPin,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  checkHealth,
  fetchAllItems,
  getUserProfile,
} from "@/services/aiService";
import { useAuth } from "@/contexts/AuthContext";

type DashboardItem = {
  id: string | number;
  type: "lost" | "found" | string;
  title: string;
  category: string;
  location: string;
  date: string;
  reward?: number;
  description: string;
  image: string;
  matchScore?: number;
  status: string;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  const [items, setItems] = useState<DashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("User");

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
        // Ignore and fall back.
      }

      setDisplayName(user.email?.split("@")[0] || "User");
    };

    loadProfileName();
  }, [user?.uid, user?.email]);

  useEffect(() => {
    const verifyBackend = async () => {
      const isOnline = await checkHealth();
      setIsBackendOnline(isOnline);
    };
    verifyBackend();

    // Optional: Poll every 30 seconds
    const interval = setInterval(verifyBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllItems();
        if (data && data.items) {
          const mappedItems: DashboardItem[] = data.items.map((item: any) => ({
            id: item._id || String(Math.random()),
            type: item.type || item.item_type || "lost",
            title: item.name || item.title || "Unknown Item",
            category: item.category || "Other",
            location: item.location || "Unknown location",
            date:
              item.date ||
              item.created_at ||
              new Date().toISOString().split("T")[0],
            reward: item.reward || 0,
            description: item.description || "No description provided.",
            image:
              item.image_url ||
              "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image",
            matchScore: item.final_score || item.matchScore || 0,
            status: item.status || "active",
          }));
          // Sort items by date descending (newest first)
          mappedItems.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
          setItems(mappedItems.slice(0, 4));
        }
      } catch (err: any) {
        console.error("Failed to load dashboard items:", err);
        setError("Error loading items. Backend might be unavailable.");
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [isBackendOnline]); // re-fetch if backend comes online

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout>
      {/* Hero / Quick Actions */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-r from-[#DD6B20] to-[#FF8C42] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-orange-500/20">
          <div className="relative z-10">
            <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back, {displayName}!
              </h1>

              {/* Backend Status Indicator */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-colors ${
                  isBackendOnline === true
                    ? "bg-emerald-500/20 text-white border border-emerald-400/30"
                    : isBackendOnline === false
                      ? "bg-red-500/20 text-white border border-red-400/30"
                      : "bg-white/10 text-white/70"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isBackendOnline === true
                      ? "bg-emerald-400 animate-pulse"
                      : isBackendOnline === false
                        ? "bg-red-400"
                        : "bg-gray-400"
                  }`}
                />
                {isBackendOnline === true
                  ? "AI Service Online"
                  : isBackendOnline === false
                    ? "AI Service Offline"
                    : "Connecting..."}
              </div>
            </div>

            <p className="text-orange-50 mb-6 max-w-md">
              You have 2 items with potential matches today. Check them out to
              reunite with your belongings.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/report-item">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto bg-slate-100 text-orange-700 hover:bg-white border-none"
                >
                  <Plus className="mr-2 h-4 w-4" /> Report New Item
                </Button>
              </Link>
              <Link to="/search">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-orange-600/20 border-white/20 text-white hover:bg-orange-600/30 hover:text-white backdrop-blur-sm"
                >
                  View All Activity
                </Button>
              </Link>
            </div>
          </div>
          {/* Abstract Shapes */}
          <div className="absolute right-0 top-0 h-64 w-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-20 h-32 w-32 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        <div className="grid grid-rows-2 gap-4">
          <Card className="bg-white border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="h-24 w-24 text-yellow-500" />
            </div>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-slate-600 mb-1">
                Your Impact
              </div>
              <div className="text-3xl font-bold text-slate-900">120 pts</div>
              <div className="flex items-center text-xs text-green-600 mt-2 font-medium">
                <ArrowUpRight className="h-3 w-3 mr-1" /> Top 5% Contributor
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm flex flex-col justify-center group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium text-slate-600">
                  Success Rate
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">85%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Header for Newest Items */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Newest Lost and Found Items
        </h2>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DD6B20] mr-3"></div>
          Loading items...
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20 text-red-500">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-slate-500">
          No items found.
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {items.map((item) => (
            <motion.div key={item.id} variants={itemAnim}>
              <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group bg-white h-full flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image";
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                        item.type === "lost" || item.type === "Lost"
                          ? "bg-red-500/90 text-white shadow-lg shadow-red-500/20"
                          : "bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/20"
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-[#DD6B20] transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="mt-auto space-y-2">
                    <div className="flex items-center text-xs text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0 text-slate-400" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 font-medium">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 shrink-0 text-slate-400" />
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                    <Link to={`/item/${item.id}`} className="w-full">
                      <Button className="w-full bg-slate-50 text-slate-900 hover:bg-slate-100 shadow-none border border-slate-200">
                        Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </DashboardLayout>
  );
}

