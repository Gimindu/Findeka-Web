import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Info, AlertTriangle, Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const notifications = [
    { id: 1, type: "match", title: "Potential Match Found!", message: "We found a Black Leather Wallet that matches your description.", time: "2 mins ago", read: false },
    { id: 2, type: "system", title: "Welcome to Findeka Premium", message: "Your account has been upgraded successfully.", time: "1 hour ago", read: false },
    { id: 3, type: "update", title: "Item Status Updated", message: "Your reported item 'Blue Backpack' is now marked as FOUND.", time: "Yesterday", read: true },
    { id: 4, type: "alert", title: "Security Alert", message: "New login detected from Safari on iPhone.", time: "2 days ago", read: true },
];

export default function NotificationPage() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
         <div className="flex items-center justify-between mb-6">
            <div>
                 <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
                <p className="text-slate-500">Stay updated with your latest activity.</p>
            </div>
            <Button variant="outline" size="sm" className="text-slate-600">
                <Check className="h-4 w-4 mr-2" /> Mark all as read
            </Button>
         </div>

         <div className="space-y-4">
             {notifications.map((notif) => (
                 <div 
                    key={notif.id}
                    className={cn(
                        "flex gap-4 p-4 rounded-xl border transition-all hover:shadow-md",
                        notif.read ? "bg-white border-slate-100" : "bg-orange-50 border-orange-100 shadow-sm"
                    )}
                 >
                     <div className={cn(
                         "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                         notif.type === "match" ? "bg-green-100 text-green-600" :
                         notif.type === "alert" ? "bg-red-100 text-red-600" :
                         notif.type === "system" ? "bg-blue-100 text-blue-600" :
                         "bg-slate-100 text-slate-600"
                     )}>
                         {notif.type === "match" && <Search className="h-5 w-5" />}
                         {notif.type === "alert" && <AlertTriangle className="h-5 w-5" />}
                         {notif.type === "system" && <Info className="h-5 w-5" />}
                         {notif.type === "update" && <Package className="h-5 w-5" />}
                     </div>
                     <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start">
                             <h4 className={cn("font-semibold text-sm", notif.read ? "text-slate-900" : "text-[#DD6B20]")}>
                                 {notif.title}
                             </h4>
                             <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{notif.time}</span>
                         </div>
                         <p className="text-slate-600 text-sm mt-1">{notif.message}</p>
                     </div>
                     {!notif.read && (
                         <div className="flex items-center">
                             <span className="h-2 w-2 rounded-full bg-[#DD6B20]"></span>
                         </div>
                     )}
                 </div>
             ))}
         </div>
      </div>
    </DashboardLayout>
  );
}
