"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, UploadCloud, MessageSquare } from 'lucide-react';

const tabs = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Upload', path: '/upload', icon: UploadCloud },
  { name: 'Chat', path: '/chat', icon: MessageSquare },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-6 px-4 pointer-events-none">
      <div className="flex items-center gap-2 p-2 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] pointer-events-auto transition-all duration-300">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className="relative px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
            >
              <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'}`}>
                <Icon size={16} />
                {tab.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
