import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Bell, User } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="p-4 sm:ml-64">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur-xl border border-white/20">
           
           <h2 className="text-xl font-semibold text-slate-800">
             Overview
           </h2>

           <div className="flex items-center gap-4">
            <Link to="/notifications">
              <Button size="icon" variant="ghost" className="rounded-full relative hover:bg-slate-100">
                 <Bell className="h-5 w-5 text-slate-600" />
                 <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
              </Button>
            </Link>
              <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
              <Link to="/profile">
              <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-slate-900">Gimindu</p>
                      <p className="text-xs text-slate-500">Premium Member</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                      <User className="h-full w-full p-1 text-slate-500" />
                  </div>
              </div>
              </Link>
           </div>
        </header>
        
        {/* Main Content */}
        <main className="min-h-[calc(100vh-8rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
