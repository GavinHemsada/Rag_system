"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileType, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { ingestDocument } from "@/lib/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setStatus("idle");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setMessage("");

    try {
      const res = await ingestDocument(file);
      setStatus("success");
      setMessage(res.data.message || "File uploaded successfully. Ingestion in background.");
      // Auto reset after 3s
      setTimeout(() => {
        setFile(null);
        setStatus("idle");
      }, 3000);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.response?.data?.detail || "Upload failed. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Upload Documents</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Add PDF, TXT, or DOCX files to your knowledge base.</p>
      </div>

      <motion.div
        layout
        className={`w-full relative rounded-3xl border-2 border-dashed p-10 flex flex-col items-center justify-center gap-4 transition-colors duration-300 ${
          isHovering
            ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10"
            : file
            ? "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#0a0a0a]"
            : "border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111] hover:bg-neutral-100 dark:hover:bg-[#151515]"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.txt,.docx"
          onChange={handleFileChange}
        />

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center pointer-events-none"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-1">Drag & drop your file here</h3>
              <p className="text-sm text-neutral-500 mb-6 font-medium">or click the button below to browse</p>
              
              <label
                htmlFor="file-upload"
                className="px-6 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black font-medium text-sm cursor-pointer shadow-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors pointer-events-auto"
              >
                Browse Files
              </label>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center w-full"
            >
              <div className="w-full flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm mb-6">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <FileType size={24} />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-sm truncate">{file.name}</span>
                    <span className="text-xs text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                {status === "idle" && (
                  <button
                    onClick={() => setFile(null)}
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {status === "idle" && (
                <button
                  onClick={handleUpload}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                  Ingest to Vectorstore
                </button>
              )}

              {status === "uploading" && (
                <div className="w-full py-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-400 font-medium">
                  <Loader2 className="animate-spin" size={18} />
                  Uploading and processing...
                </div>
              )}

              {status === "success" && (
                <div className="w-full py-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 size={18} />
                  {message}
                </div>
              )}

              {status === "error" && (
                <div className="w-full py-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex flex-col items-center justify-center gap-1 text-red-700 dark:text-red-400 text-sm font-medium text-center px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={18} />
                    <span>Upload Failed</span>
                  </div>
                  <span className="text-xs opacity-80">{message}</span>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
