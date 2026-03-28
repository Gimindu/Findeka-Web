import React, { useState, useRef } from "react";
import {
  MapPin,
  UploadCloud,
  X,
  Loader2,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { motion, AnimatePresence } from "framer-motion";
import { searchItems, submitItem, ItemMatch } from "@/services/aiService";
import { ITEM_CATEGORIES } from "@/data/itemCategories";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const categories = ITEM_CATEGORIES;

const commonLocations = [
  "Colombo",
  "Kandy",
  "Gampaha",
  "Kalutara",
  "Matara",
  "Galle",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Moneragala",
  "Ratnapura",
  "Kegalle",
  "Nuwara Eliya",
];

export default function ReportItemPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [postType, setPostType] = useState<"lost" | "found">("lost");
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<ItemMatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [reportedId, setReportedId] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      setPostData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newFiles].slice(0, 5), // Limit to 5
      }));
    }
  };

  const removePhoto = (index: number) => {
    setPostData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMatches([]); // Clear previous

    try {
      const formData = new FormData();
      formData.append("type", postType);
      formData.append("name", postData.title);
      formData.append("description", postData.description);
      formData.append("category", postData.category);
      formData.append("subcategory", postData.subcategory);
      formData.append("color", postData.color);
      formData.append("location", postData.location);
      formData.append("date", postData.date);
      if (user?.uid) formData.append("uid", user.uid);

      if (postData.photos.length > 0) {
        formData.append("image", postData.photos[0]); // Send first image for scanning
      }

      console.log("SENDING SEARCH...");
      const result = await searchItems(formData);
      console.log("SEARCH RESULT:", result);

      if (result.matches && result.matches.length > 0) {
        setMatches(result.matches);
        setShowMatchesModal(true);
      } else {
        // No matches, direct submit
        await performSubmit(formData);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setErrorMsg("Something went wrong: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const performSubmit = async (formData: FormData) => {
    try {
      // ensure type is set if passing plain form data again, which we are.
      const res = await submitItem(formData);
      // NEW: Show Success Modal instead of alert
      setReportedId(res.id);
      setSuccessMessage(
        "Your item has been successfully reported to our AI system.",
      );
      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMsg("Failed to submit item: " + err.message);
    }
  };

  // When user says "None of these match"
  const handleNoMatch = async () => {
    setShowMatchesModal(false);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("type", postType);
    formData.append("name", postData.title);
    formData.append("description", postData.description);
    formData.append("category", postData.category);
    formData.append("subcategory", postData.subcategory);
    formData.append("color", postData.color);
    formData.append("location", postData.location);
    formData.append("date", postData.date);
    if (user?.uid) formData.append("uid", user.uid);
    if (postData.photos.length > 0) {
      formData.append("image", postData.photos[0]);
    }

    await performSubmit(formData);
    setIsLoading(false);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto relative">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Report an Item</h1>
          <p className="text-slate-500">
            Help us reunite items with their owners by providing detailed
            information.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 bg-slate-100 border border-slate-200 p-1 rounded-xl">
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
            <CardDescription>
              Please provide as much detail as possible to help AI match your
              item.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>
                  What is it? <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. iPhone 15 Pro Max, Black Leather Wallet"
                  value={postData.title}
                  onChange={(e) =>
                    setPostData({ ...postData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <NativeSelect
                    value={postData.category}
                    onChange={handleCategoryChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.keys(categories).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label>
                    Subcategory <span className="text-red-500">*</span>
                  </Label>
                  <NativeSelect
                    value={postData.subcategory}
                    onChange={(e) =>
                      setPostData({ ...postData, subcategory: e.target.value })
                    }
                    disabled={!postData.category}
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {postData.category &&
                      categories[postData.category].map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                  </NativeSelect>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <NativeSelect
                    value={postData.location}
                    onChange={(e) =>
                      setPostData({ ...postData, location: e.target.value })
                    }
                    icon={<MapPin className="h-4 w-4" />}
                    required
                  >
                    <option value="">Select Location</option>
                    {commonLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label>
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={postData.date}
                    onChange={(e) =>
                      setPostData({ ...postData, date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color / Distinguishing Features</Label>
                <Input
                  placeholder="e.g. Red, Has a sticker on the back"
                  value={postData.color}
                  onChange={(e) =>
                    setPostData({ ...postData, color: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Describe the item in detail. Mention scratches, marks, or specific contents."
                  rows={5}
                  value={postData.description}
                  onChange={(e) =>
                    setPostData({ ...postData, description: e.target.value })
                  }
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
                    onChange={(e) =>
                      setPostData({ ...postData, reward: e.target.value })
                    }
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
                    <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-[#DD6B20]" />
                  </div>
                  <p className="font-medium text-slate-700">
                    Click to upload photos
                  </p>
                  <p className="text-sm text-slate-500">
                    SVG, PNG, JPG or GIF (max. 5 items)
                  </p>
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
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 sm:gap-4">
                    {postData.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden group"
                      >
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
                  disabled={isLoading}
                  className={`w-full ${postType === "lost" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Processing...
                    </>
                  ) : (
                    `Find / Report Item`
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Matches Modal */}
        <AnimatePresence>
          {showMatchesModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                      <AlertTriangle className="text-orange-500" />
                      We found potential matches!
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowMatchesModal(false)}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <p className="text-slate-500 mt-2">
                    Based on our AI analysis, these items look similar to what
                    you reported. Please check if any of these are yours.
                  </p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matches.map((match) => (
                    <div
                      key={match._id}
                      className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-48 bg-slate-100 relative">
                        {match.image_url ? (
                          <img
                            src={match.image_url}
                            alt={match.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">
                            {match.name}
                          </h3>
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            {Math.round(match.final_score * 100)}% Match
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                          {match.description}
                        </p>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => setSelectedMatch(match)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-slate-50 border-t flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    None of these match my item.
                  </p>
                  <Button
                    onClick={handleNoMatch}
                    className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Submit My Report Anyway{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Detailed Match View Modal */}
          {selectedMatch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedMatch.name}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedMatch(null)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="p-6 space-y-4">
                  {selectedMatch.image_url && (
                    <div className="h-64 w-full rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={selectedMatch.image_url}
                        alt={selectedMatch.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-slate-700">
                        Category:
                      </span>{" "}
                      {selectedMatch.category}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Subcategory:
                      </span>{" "}
                      {selectedMatch.subcategory}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Color:
                      </span>{" "}
                      {selectedMatch.color}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Location:
                      </span>{" "}
                      {selectedMatch.location}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Date:
                      </span>{" "}
                      {selectedMatch.date_found || selectedMatch.date_lost}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Match Score:
                      </span>{" "}
                      {Math.round(selectedMatch.final_score * 100)}%
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Description
                    </h4>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm">
                      {selectedMatch.description}
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={`tel:${selectedMatch.phone || "+94701234567"}`}
                      className="flex-1 flex"
                    >
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
                        <Phone className="w-4 h-4 mr-2" /> Call{" "}
                        {postType === "lost" ? "Finder" : "Owner"} (
                        {selectedMatch.phone || "+94 70 123 4567"})
                      </Button>
                    </a>
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setSelectedMatch(null)}
                    >
                      It's not a match
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
              >
                <div className="h-32 bg-emerald-500 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/10"></div>
                  {/* Animated Checkmark Circle */}
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="bg-white rounded-full p-4 relative z-10 shadow-lg"
                  >
                    <CheckCircle2
                      className="h-10 w-10 text-emerald-600"
                      strokeWidth={3}
                    />
                  </motion.div>

                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/20 rounded-full blur-xl -ml-10 -mb-10"></div>
                </div>

                <div className="px-8 py-6 text-center">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Success!
                  </h2>
                  <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                    {successMessage}
                  </p>

                  <div className="bg-slate-50 rounded-lg p-3 mb-6 border border-slate-100">
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                      Reference ID
                    </span>
                    <span className="font-mono text-slate-700 font-medium">
                      {reportedId}
                    </span>
                  </div>

                  <Button
                    onClick={handleSuccessClose}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 py-6 text-lg font-medium"
                  >
                    Go to Dashboard
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
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
              >
                <div className="h-32 bg-red-500 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="bg-white rounded-full p-4 relative z-10 shadow-lg"
                  >
                    <X className="h-10 w-10 text-red-600" strokeWidth={3} />
                  </motion.div>
                </div>
                <div className="px-8 py-6 text-center">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Error
                  </h2>
                  <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                    {errorMsg}
                  </p>
                  <Button
                    onClick={() => setErrorMsg(null)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 py-6 text-lg font-medium"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
