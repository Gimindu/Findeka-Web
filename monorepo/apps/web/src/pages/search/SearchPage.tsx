import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Clock
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

import { fetchAllItems, ItemMatch } from "@/services/aiService";

const CATEGORIES = ["All", "Electronics", "Personal Items", "Pets", "Keys", "Documents", "Clothing", "Other"];
const TYPES = ["All", "Lost", "Found"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [items, setItems] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const data = await fetchAllItems();
        setItems(data.items || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load items:", err);
        setError("Failed to load items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  const filteredItems = items.filter(item => {
    const title = item.name || "";
    const desc = item.description || "";
    const loc = item.location || "";
    const matchesQuery = title.toLowerCase().includes(query.toLowerCase()) || 
                         desc.toLowerCase().includes(query.toLowerCase()) ||
                         loc.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesType = selectedType === "All" || (item.type || "").toLowerCase() === selectedType.toLowerCase();
    
    return matchesQuery && matchesCategory && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Search & Match</h1>
                <p className="text-slate-500">Find what you lost or help return what you found.</p>
            </div>
            <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className={`gap-2 ${showFilters ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-200 text-slate-600'}`}
            >
                <Filter className="h-4 w-4" />
                Filters
            </Button>
        </div>

        {/* Search & Filters Area */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                    placeholder="Search by keyword, location, or description..." 
                    className="pl-10 h-12 text-lg bg-slate-50 border-slate-200 focus-visible:ring-orange-500 text-slate-900 placeholder-slate-400"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                                selectedCategory === cat 
                                                ? 'bg-orange-600 text-white' 
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Type</label>
                                <div className="flex gap-2">
                                    {TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                                selectedType === type 
                                                ? type === 'Lost' ? 'bg-red-600 text-white' : type === 'Found' ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                    <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading items...</p>
                </div>
            ) : error ? (
                <div className="col-span-full py-12 text-center text-red-500 bg-red-50 rounded-xl">
                    <p>{error}</p>
                    <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                        Try Again
                    </Button>
                </div>
            ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                    <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="h-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow group overflow-hidden bg-white flex flex-col">
                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                <img 
                                    src={item.image_url || "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image"} 
                                    alt={item.name}
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        const fallback = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image";
                                        if (target.src !== fallback) {
                                            target.src = fallback;
                                        }
                                    }}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                                <div className="absolute top-3 left-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                                        item.type === 'lost' 
                                        ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/20' 
                                        : 'bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/20'
                                    }`}>
                                        {item.type}
                                    </span>
                                </div>
                            </div>
                            <CardContent className="p-4 flex flex-1 flex-col gap-3">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 flex py-0.5 rounded-md self-center">
                                            {item.category}
                                        </span>
                                        <span className="text-xs text-slate-500 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {item.status || "active"}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                        {item.name}
                                    </h3>
                                </div>
                                
                                <p className="text-slate-600 text-sm line-clamp-2 min-h-[2.5rem] mb-2">
                                    {item.description}
                                </p>

                                <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
                                    <div className="flex items-center text-xs text-slate-500 font-medium">
                                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                                        <span className="truncate">{item.location}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-slate-500 font-medium">
                                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                                        <span>{item.date_lost || item.date_found || new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <Link to={`/item/${item._id}`} className="w-full mt-4">
                                  <Button className="w-full bg-slate-50 text-slate-900 border border-slate-200 shadow-none hover:bg-slate-100 transition-colors">
                                      View Details
                                  </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))
            ) : (
                <div className="col-span-full py-12 text-center text-slate-500">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No items found</h3>
                    <p>Try adjusting your search terms or filters.</p>
                    <Button 
                        variant="link" 
                        onClick={() => {
                            setQuery("");
                            setSelectedCategory("All");
                            setSelectedType("All");
                        }}
                        className="text-orange-600 mt-2"
                    >
                        Clear all filters
                    </Button>
                </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}
