import React, { useState, useRef } from "react";
import { Camera, MapPin, Calendar, Clock, UploadCloud, X } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { motion, AnimatePresence } from "framer-motion";

const categories: Record<string, string[]> = {
  Accessories: ["Jewelry", "Watches", "Bags", "Wallets", "Sunglasses", "Keys", "Other"],
  Electronics: ["Phones", "Laptops", "Tablets", "Headphones", "Chargers", "Cameras", "Other"],
  Documents: ["ID Cards", "Passports", "Licenses", "Credit Cards", "Certificates", "Other"],
  Pets: ["Dogs", "Cats", "Birds", "Other"],
  Clothing: ["Shirts", "Pants", "Shoes", "Jackets", "Other"],
};

const commonLocations = [
  "Colombo", "Kandy", "Gampaha", "Kalutara", "Matara", "Galle", "Hambantota",
  "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa",
  "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa",
  "Badulla", "Moneragala", "Ratnapura", "Kegalle", "Nuwara Eliya",
];

export default function ReportItemPage() {
  const [postType, setPostType] = useState<"lost" | "found">("lost");
  const [postData, setPostData] = useState({
    title: "",
    category: "",
    subcategory: "",
    location: "",
    date: "",
    color: "",
    description: "",
    reward: "",
    photos: [] as File[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPostData({
      ...postData,
      category: e.target.value,
      subcategory: "",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPostData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newFiles].slice(0, 5)
      }));
    }
  };

  const removePhoto = (index: number) => {
    setPostData(prev => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted:", { type: postType, ...postData });
    // Handle submission logic
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
         <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Report an Item</h1>
            <p className="text-slate-500">Help us reunite items with their owners by providing detailed information.</p>
         </div>

         <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-100 p-1 rounded-xl">
            <button
                type="button"
                onClick={() => setPostType("lost")}
                className={`py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${postType === "lost" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                I Lost Something
            </button>
            <button
                type="button"
                onClick={() => setPostType("found")}
                className={`py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${postType === "found" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                I Found Something
            </button>
         </div>

         <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>Please provide as much detail as possible.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>What is it? <span className="text-red-500">*</span></Label>
                        <Input 
                            placeholder="e.g. iPhone 15 Pro Max, Black Leather Wallet"
                            value={postData.title}
                            onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Category <span className="text-red-500">*</span></Label>
                            <NativeSelect 
                                value={postData.category}
                                onChange={handleCategoryChange}
                                required
                            >
                                <option value="">Select Category</option>
                                {Object.keys(categories).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="space-y-2">
                            <Label>Subcategory <span className="text-red-500">*</span></Label>
                            <NativeSelect
                                value={postData.subcategory}
                                onChange={(e) => setPostData({ ...postData, subcategory: e.target.value })}
                                disabled={!postData.category}
                                required
                            >
                                <option value="">Select Subcategory</option>
                                {postData.category && categories[postData.category].map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </NativeSelect>
                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Location <span className="text-red-500">*</span></Label>
                             <NativeSelect
                                value={postData.location}
                                onChange={(e) => setPostData({ ...postData, location: e.target.value })}
                                icon={<MapPin className="h-4 w-4" />}
                                required
                             >
                                <option value="">Select Location</option>
                                {commonLocations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                             </NativeSelect>
                        </div>
                        <div className="space-y-2">
                            <Label>Date <span className="text-red-500">*</span></Label>
                            <Input 
                                type="date"
                                value={postData.date}
                                onChange={(e) => setPostData({ ...postData, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                     <div className="space-y-2">
                        <Label>Color / Distinguishing Features</Label>
                        <Input 
                            placeholder="e.g. Red, Has a sticker on the back"
                            value={postData.color}
                            onChange={(e) => setPostData({ ...postData, color: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description <span className="text-red-500">*</span></Label>
                        <Textarea 
                            placeholder="Describe the item in detail. Mention scratches, marks, or specific contents."
                            rows={5}
                            value={postData.description}
                            onChange={(e) => setPostData({ ...postData, description: e.target.value })}
                            required
                        />
                    </div>
                    
                    {postType === "lost" && (
                         <div className="space-y-2">
                            <Label>Reward Amount (LKR) - Optional</Label>
                            <Input 
                                type="number"
                                placeholder="e.g. 5000"
                                value={postData.reward}
                                onChange={(e) => setPostData({ ...postData, reward: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <Label>Upload Photos</Label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#DD6B20] hover:bg-orange-50 transition-all group"
                        >
                            <div className="bg-slate-100 p-3 rounded-full mb-3 group-hover:bg-white transition-colors">
                                <UploadCloud className="h-6 w-6 text-slate-500 group-hover:text-[#DD6B20]" />
                            </div>
                            <p className="font-medium text-slate-700">Click to upload photos</p>
                            <p className="text-sm text-slate-500">SVG, PNG, JPG or GIF (max. 5 items)</p>
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                hidden 
                                multiple 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        {postData.photos.length > 0 && (
                            <div className="grid grid-cols-5 gap-4">
                                {postData.photos.map((photo, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img 
                                            src={URL.createObjectURL(photo)} 
                                            alt="preview" 
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                         <Button 
                            size="lg" 
                            className={`w-full ${postType === 'lost' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                            Submit {postType === 'lost' ? 'Lost' : 'Found'} Report
                         </Button>
                    </div>
                </form>
            </CardContent>
         </Card>
      </div>
    </DashboardLayout>
  );
}
