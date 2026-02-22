"use client";

import { useState, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Loader2, BookOpen } from "lucide-react";
import { querySystem } from "@/lib/api";

type Source = {
  content: string;
  metadata: Record<string, any>;
};

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  sources?: Source[];
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content: "Hello! I am your RAG assistant. Ask me anything about your ingested documents."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setTimeout(scrollToBottom, 100);

    try {
      const { data } = await querySystem(userMsg.content);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.answer,
        sources: data.sources,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "bot", content: "Sorry, I encountered an error while processing your request." }
      ]);
      console.error(error);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-[calc(100vh-12rem)] border border-neutral-200 dark:border-white/10 rounded-3xl overflow-hidden bg-white/50 dark:bg-black/40 backdrop-blur-xl shadow-2xl relative">
      
      {/* Decorative gradients */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" 
                  ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
              }`}>
                {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
              </div>

              <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-5 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                    : "bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200 rounded-tl-none shadow-sm"
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Sources section for bot */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2 w-full">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider pl-1">
                      <BookOpen size={14} /> Sources
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, idx) => (
                        <div key={idx} className="group relative">
                          <div className="px-3 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 rounded-lg cursor-help transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-500/20">
                            {src.metadata?.source ? src.metadata.source.split('/').pop() : `Source ${idx + 1}`}
                          </div>
                          {/* Tooltip for source content preview */}
                          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-neutral-900 border border-white/10 text-neutral-200 text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 line-clamp-4">
                            "{src.content}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                <Bot size={20} />
              </div>
              <div className="px-5 py-4 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-white/10 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span className="text-sm text-neutral-500">Searching documents...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white/50 dark:bg-black/50 border-t border-neutral-200 dark:border-white/10 backdrop-blur-md">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-400 disabled:dark:bg-neutral-700 text-white rounded-full transition-colors"
          >
            <Send size={18} className={input.trim() && !isLoading ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </form>
      </div>

    </div>
  );
}
