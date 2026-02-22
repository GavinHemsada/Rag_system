"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Database, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-8 backdrop-blur-md">
          <Sparkles size={16} className="text-indigo-400" />
          <span>Next-Gen RAG Architecture</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 dark:from-white dark:to-neutral-500">
          Knowledge, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 pb-2">Unlocked.</span>
        </h1>
        
        <p className="max-w-xl mx-auto text-lg text-neutral-600 dark:text-neutral-400 mb-12">
          Upload your documents, integrate them into the high-dimensional vector space, and query them with unprecedented speed and accuracy.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/upload">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-md text-gray-400 font-medium transition-all"
            >
              <Database size={18} />
              Ingest Documents
            </motion.button>
          </Link>
          
          <Link href="/chat">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.7)] transition-all"
            >
              Start Querying
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50 dark:opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-[20%] -translate-y-[80%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50 dark:opacity-30" />
    </div>
  );
}
