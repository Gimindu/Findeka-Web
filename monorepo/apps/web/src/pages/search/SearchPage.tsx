import { useState } from "react";
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

// Mock Data
const MOCK_ITEMS = [
  {
    id: 1,
    type: "lost",
    title: "iPhone 15 Pro Max",
    category: "Electronics",
    location: "Central Park, NYC",
    date: "2024-03-15",
    description: "Black titanium iPhone 15 Pro Max. Lost near the Bethesda Fountain. has a blue case.",
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=2070&auto=format&fit=crop",
    status: "active"
  },
  {
    id: 2,
    type: "found",
    title: "Brown Leather Wallet",
    category: "Personal Items",
    location: "Grand Central Terminal",
    date: "2024-03-14",
    description: "Found a brown leather wallet with some cards. No ID found inside.",
    image: "https://images.unsplash.com/photo-1627123424574-181ce5171700?q=80&w=2670&auto=format&fit=crop",
    status: "active"
  },
  {
    id: 3,
    type: "lost",
    title: "Golden Retriever Puppy",
    category: "Pets",
    location: "Brooklyn Heights Promenade",
    date: "2024-03-15",
    description: "3 month old golden retriever puppy. Answers to the name 'Buddy'. Wearing a red collar.",
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=2615&auto=format&fit=crop",
    status: "urgent"
  },
  {
    id: 4,
    type: "found",
    title: "Car Keys",
    category: "Keys",
    location: "Times Square",
    date: "2024-03-13",
    description: "Set of car keys (Toyota) with a Spiderman keychain found near the red stairs.",
    image: "https://images.unsplash.com/photo-1622396636133-74323dc26867?q=80&w=2522&auto=format&fit=crop",
    status: "active"
  },
  {
    id: 5,
    type: "lost",
    title: "MacBook Air M2",
    category: "Electronics",
    location: "Public Library",
    date: "2024-03-12",
    description: "Silver MacBook Air left in the main reading room. Has a 'Code Like a Girl' sticker.",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop",
    status: "active"
  },
  {
    id: 6,
    type: "found",
    title: "Vintage Camera",
    category: "Electronics",
    location: "SoHo",
    date: "2024-03-10",
    description: "Old film camera found on a bench. Looks like a Canon AE-1.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop",
    status: "active"
  }
];

const CATEGORIES = ["All", "Electronics", "Personal Items", "Pets", "Keys", "Documents", "Clothing"];
const TYPES = ["All", "Lost", "Found"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = MOCK_ITEMS.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) || 
                         item.description.toLowerCase().includes(query.toLowerCase()) ||
                         item.location.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesType = selectedType === "All" || item.type.toLowerCase() === selectedType.toLowerCase();
    
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
                Wait Filters
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
                        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Category</label>
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
            {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="h-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow group overflow-hidden bg-white">
                            <div className="relative aspect-video overflow-hidden">
                                <img 
                                    src={item.image} 
                                    alt={item.title}
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
                            <CardContent className="p-4 flex flex-col gap-3">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md">
                                            {item.category}
                                        </span>
                                        <span className="text-xs text-slate-500 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {item.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                        {item.title}
                                    </h3>
                                </div>
                                
                                        <p className="text-slate-600 text-sm line-clamp-2 min-h-[2.5rem]">
                                    {item.description}
                                </p>

                                <div className="pt-3 mt-auto border-t border-slate-100 space-y-2">
                                    <div className="flex items-center text-xs text-slate-500">
                                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                                        <span className="truncate">{item.location}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-slate-500">
                                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                                        <span>{item.date}</span>
                                    </div>
                                </div>

                                <Button className="w-full mt-2 bg-slate-100 text-slate-900 hover:bg-slate-200">
                                    View Details
                                </Button>
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
