import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, Tag, MessageSquare, AlertTriangle, ShieldCheck } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { fetchAllItems, ItemMatch } from "@/services/aiService";
import { motion } from "framer-motion";

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ItemMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        const data = await fetchAllItems(); // uses global cache
        const foundItem = data.items.find(i => String(i._id) === id || String(i.id) === id);
        if (foundItem) {
          setItem(foundItem);
        } else {
          setError("Item not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadItem();
    }
  }, [id]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 -ml-4 text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {loading ? (
          <div className="flex justify-center items-center py-32 text-slate-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mr-3"></div>
            Loading details...
          </div>
        ) : error || !item ? (
          <div className="text-center py-32 bg-white rounded-2xl shadow-sm border border-slate-100">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Item Not Found</h2>
            <p className="text-slate-500 mb-6">{error || "The item you are looking for does not exist or has been removed."}</p>
            <Button onClick={() => navigate('/dashboard')} className="bg-orange-600 hover:bg-orange-700">
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 bg-white">
              <div className="lg:col-span-3 bg-slate-100 relative min-h-[400px]">
                <img 
                    src={item.image_url || "https://placehold.co/800x600/e2e8f0/64748b?text=No+Image"} 
                    alt={item.name || item.title}
                    className="w-full h-full object-cover absolute inset-0"
                    onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/800x600/e2e8f0/64748b?text=No+Image";
                    }}
                />
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${
                        item.type === 'lost' || item.type === 'Lost'
                        ? 'bg-red-500/90 text-white shadow-red-500/20' 
                        : 'bg-emerald-500/90 text-white shadow-emerald-500/20'
                    }`}>
                        {item.type}
                    </span>
                </div>
              </div>
              
              <div className="p-8 lg:col-span-2 flex flex-col h-full border-l border-slate-100">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-md">
                        {item.category}
                    </span>
                    <span className="text-sm text-slate-500 flex items-center bg-slate-50 px-3 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {item.status || "active"}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">{item.name || item.title}</h1>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start text-slate-600">
                      <MapPin className="w-5 h-5 mr-3 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Location</p>
                        <p>{item.location || "Location not specified"}</p>
                      </div>
                    </div>
                    <div className="flex items-start text-slate-600">
                      <Calendar className="w-5 h-5 mr-3 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Date {item.type === 'lost' || item.type === 'Lost' ? 'Lost' : 'Found'}</p>
                        <p>{item.date_lost || item.date_found || item.date || new Date(item.created_at || Date.now()).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {item.color && (
                      <div className="flex items-start text-slate-600">
                        <Tag className="w-5 h-5 mr-3 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">Color</p>
                          <p>{item.color}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-6 mb-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Description</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {item.description || "No additional description provided by the reporter."}
                    </p>
                  </div>
                </div>

                <div className="mt-auto space-y-3 pt-6">
                  <Button className="w-full h-12 text-lg bg-[#DD6B20] hover:bg-[#C05616] text-white shadow-lg shadow-orange-500/25">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Contact Reporter
                  </Button>
                  <Button variant="outline" className="w-full h-12 text-slate-600 border-slate-200 hover:bg-slate-50">
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Report this listing
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
