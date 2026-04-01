// Page module: SettingsPage
// Purpose: Handles this page's UI state and user actions.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, User, Shield, LogOut, CheckCircle2, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
} from "../../services/aiService";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    about: "",
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    matchAlerts: true,
    newsletter: false,
    publicProfile: true,
    locationSharing: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        const [profileData, settingsData] = await Promise.all([
          getUserProfile(user.uid),
          getUserSettings(user.uid),
        ]);

        setProfile({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          email: profileData.email || user.email || "",
          phone: profileData.phone || "",
          about: (profileData as any).about || "",
        });

        setSettings({
          emailNotifications: settingsData.emailNotifications ?? true,
          pushNotifications: settingsData.pushNotifications ?? true,
          matchAlerts: settingsData.matchAlerts ?? true,
          newsletter: settingsData.newsletter ?? false,
          publicProfile: settingsData.publicProfile ?? true,
          locationSharing: settingsData.locationSharing ?? false,
        });
      } catch (error) {
        console.error("Failed to load settings data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSettingChange = (settingKey: string) => {
    setSettings((prev) => ({
      ...prev,
      [settingKey]: !(prev as any)[settingKey],
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await Promise.all([
        updateUserProfile(user.uid, profile),
        updateUserSettings(user.uid, settings),
      ]);
      setSuccessMsg("Settings updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3500); // Auto-hide success
    } catch (error) {
      console.error("Failed to save settings", error);
      setErrorMsg("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500">
            Manage your account preferences and configurations.
          </p>
        </div>

        {/* Account Settings */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#DD6B20]" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal details and contact info.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>About Me</Label>
                <Input
                  name="about"
                  value={(profile as any).about || ""}
                  onChange={handleProfileChange}
                />
              </div>
            </div>
            <div className="pt-4 pb-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto bg-[#DD6B20] hover:bg-[#C05615] text-white"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#DD6B20]" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Choose how you want to be notified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "emailNotifications",
                title: "Email Notifications",
                desc: "Receive daily summaries and match alerts via email.",
              },
              {
                key: "pushNotifications",
                title: "Push Notifications",
                desc: "Get real-time alerts on your mobile device.",
              },
              {
                key: "matchAlerts",
                title: "Match Alerts",
                desc: "Get notified immediately when a potential match is found.",
              },
              {
                key: "newsletter",
                title: "Newsletter",
                desc: "Receive news and updates about Findeka features.",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex flex-col gap-3 py-2 border-b border-slate-50 last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={(settings as any)[item.key]}
                    onChange={() => handleSettingChange(item.key)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DD6B20]"></div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#DD6B20]" />
              <CardTitle>Privacy & Security</CardTitle>
            </div>
            <CardDescription>
              Control your visibility and security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "publicProfile",
                title: "Public Profile",
                desc: "Allow other users to see your basic profile info.",
              },
              {
                key: "locationSharing",
                title: "Location Sharing",
                desc: "Share approximate location for better item matching.",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex flex-col gap-3 py-2 border-b border-slate-50 last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={(settings as any)[item.key]}
                    onChange={() => handleSettingChange(item.key)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DD6B20]"></div>
                </label>
              </div>
            ))}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-slate-900">
                  Change Password
                </h4>
                <p className="text-xs text-slate-500">
                  Update your password regularly to stay safe.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-stretch sm:justify-end pt-6">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Custom Modals */}
      <AnimatePresence>
        {/* Success Toast */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[100] bg-slate-900 text-white px-4 sm:px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            <span className="font-medium">{successMsg}</span>
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
    </DashboardLayout>
  );
}

