import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center p-6 sm:p-12">
      <header className="w-full max-w-5xl flex justify-between items-center mb-16">
        <Link to="/" className="text-3xl font-black tracking-tighter text-[#2D3436]">
          ART<span className="text-[#9D50BB]">COMMISH</span>
        </Link>
        <nav className="flex gap-6">
          <Link to="/admin" className="text-sm font-bold uppercase tracking-widest text-[#636E72] hover:text-[#9D50BB] transition-colors">
            Admin
          </Link>
        </nav>
      </header>
      
      <main className="w-full max-w-5xl flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>

      <footer className="w-full max-w-5xl mt-20 py-10 border-t border-black/5 text-center">
        <p className="text-sm text-[#B2BEC3] font-bold tracking-widest uppercase">
          © 2024 ArtCommish. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
