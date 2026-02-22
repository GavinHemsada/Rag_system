import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RAG System Base",
  description: "Advanced Retrieval-Augmented Generation Frontend",
  icons:{
    icon: "/logo.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-neutral-50 dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 min-h-screen selection:bg-indigo-500/30`} suppressHydrationWarning>
        <Navbar />
        <main className="pt-32 pb-16 px-6 max-w-5xl mx-auto min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
