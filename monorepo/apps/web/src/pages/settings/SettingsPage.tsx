import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, Lock, User, Shield, LogOut } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
         <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
            <p className="text-slate-500">Manage your account preferences and configurations.</p>
         </div>

         {/* Account Settings */}
         <Card className="border-none shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[#DD6B20]" />
                    <CardTitle>Account Information</CardTitle>
                </div>
                <CardDescription>Update your personal details and contact info.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input defaultValue="John Doe" />
                    </div>
                     <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input defaultValue="john.doe@email.com" />
                    </div>
                     <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input defaultValue="+1 (555) 123-4567" />
                    </div>
                </div>
                <div className="pt-2">
                    <Button variant="outline" className="text-[#DD6B20] border-orange-200 hover:bg-orange-50">Update Profile</Button>
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
                <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {[
                    { title: "Email Notifications", desc: "Receive daily summaries and match alerts via email.", checked: true },
                    { title: "Push Notifications", desc: "Get real-time alerts on your mobile device.", checked: true },
                    { title: "Match Alerts", desc: "Get notified immediately when a potential match is found.", checked: true },
                    { title: "Newsletter", desc: "Receive news and updates about Findeka features.", checked: false },
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div className="space-y-0.5">
                            <h4 className="text-sm font-medium text-slate-900">{item.title}</h4>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
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
                <CardDescription>Control your visibility and security settings.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                 {[
                    { title: "Public Profile", desc: "Allow other users to see your basic profile info.", checked: true },
                    { title: "Location Sharing", desc: "Share approximate location for better item matching.", checked: false },
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div className="space-y-0.5">
                            <h4 className="text-sm font-medium text-slate-900">{item.title}</h4>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DD6B20]"></div>
                        </label>
                    </div>
                ))}
                 <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                     <div className="space-y-0.5">
                        <h4 className="text-sm font-medium text-slate-900">Change Password</h4>
                        <p className="text-xs text-slate-500">Update your password regularly to stay safe.</p>
                     </div>
                     <Button variant="outline" size="sm">Update</Button>
                 </div>
            </CardContent>
         </Card>

         <div className="flex justify-end pt-6">
             <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
             </Button>
         </div>
      </div>
    </DashboardLayout>
  );
}
