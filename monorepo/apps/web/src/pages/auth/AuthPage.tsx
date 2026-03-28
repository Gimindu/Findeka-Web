import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { checkHealth } from "@/services/aiService";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState("");

  const handleGoogleLogin = async () => {
    setSocialError("");
    setSocialLoading(true);
    try {
      await googleLogin();
      navigate("/dashboard");
    } catch (err: any) {
      setSocialError(err?.message || "Google sign-in failed");
    } finally {
      setSocialLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center p-4">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl mb-4"
          >
            <Search className="h-8 w-8 text-[#DD6B20]" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-slate-900 tracking-tight"
          >
            Lost<span className="text-[#DD6B20]">Found</span> AI
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-500 mt-2 mb-4"
          >
            Helping reunite people with their belongings
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-colors ${
                isBackendOnline === true
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : isBackendOnline === false
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-slate-50 text-slate-500 border border-slate-200"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isBackendOnline === true
                    ? "bg-emerald-500 animate-pulse"
                    : isBackendOnline === false
                      ? "bg-red-500"
                      : "bg-slate-400"
                }`}
              />
              {isBackendOnline === true
                ? "AI Service Online"
                : isBackendOnline === false
                  ? "AI Service Offline"
                  : "Connecting..."}
            </div>
          </motion.div>
        </div>

        {/* Main Card */}
        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardHeader className="pb-2">
            {/* Custom Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-xl mb-2">
              <button
                onClick={() => setActiveTab("login")}
                className={`relative z-10 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${activeTab === "login" ? "text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {activeTab === "login" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`relative z-10 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${activeTab === "signup" ? "text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {activeTab === "signup" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Create Account</span>
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "login" ? <LoginForm /> : <SignupForm />}
              </motion.div>
            </AnimatePresence>

            {/* Social Login Separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleGoogleLogin}
                disabled={socialLoading}
                className="flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors bg-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {socialLoading ? "Please wait..." : "Google"}
              </button>
              <button className="flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors bg-white">
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="#1877F2"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
            {socialError ? (
              <div className="mt-3 rounded-md bg-red-100 p-3 text-sm text-red-700">
                {socialError}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-xs text-slate-500">
          By continuing, you agree to our{" "}
          <a href="#" className="underline hover:text-slate-800">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-slate-800">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
