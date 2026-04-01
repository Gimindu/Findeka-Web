// Utility module: loadingPage
// Purpose: Shared UI/business logic used across multiple pages.

import { Link } from 'react-router-dom'; 
import { Search, Shield, Zap, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoadingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-orange-200">
      
      {/* Background Gradients & Shapes */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-orange-200/40 rounded-full blur-3xl opacity-50 pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-200/30 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-blue-100/40 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-4xl px-6 text-center"
      >
        {/* Logo Icon */}
        <motion.div variants={item} className="mb-8 flex justify-center">
            <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-lg opacity-30 rounded-full animate-pulse"></div>
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20 rotate-3 transition-transform hover:rotate-0 duration-500">
                    <Search className="text-white h-12 w-12" />
                </div>
            </div>
        </motion.div>

        {/* Hero Title */}
        <motion.h1 variants={item} className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
          Find what matters,
          <br className="hidden md:block" /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
             faster than ever.
          </span>
        </motion.h1>

        {/* Hero Description */}
        <motion.p variants={item} className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          The intelligent lost & found platform powered by advanced AI matching. 
          Reunite with your belongings securely and efficiently.
        </motion.p>

        {/* CTA Button */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link to="/auth">
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 rounded-full ring-2 ring-white/10 group-hover:ring-white/20"></div>
            </motion.button>
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
                { icon: Zap, title: "Instant Matching", desc: "AI-powered image recognition finds matches in seconds." },
                { icon: Shield, title: "Secure & Safe", desc: "Verified community and secure messaging for safe returns." },
                { icon: Globe, title: "Community Driven", desc: "Helping people everywhere reunite with lost items." }
            ].map((feature, idx) => (
                <div key={idx} className="p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                    <feature.icon className="h-8 w-8 text-orange-500 mb-4" />
                    <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-500">{feature.desc}</p>
                </div>
            ))}
        </motion.div>

      </motion.div>
      
      {/* Footer */}
      <div className="absolute bottom-6 text-slate-400 text-sm">
        © 2026 Findeka. All rights reserved.
      </div>
    </div>
  );
}


