import React from 'react';
import { Sparkles } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-12 h-12 text-cyan-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Alchemist's Compass
          </h1>
        </div>
        <p className="text-slate-400 text-lg">
          AI-Powered Action Recommendation System
        </p>
        <p className="text-slate-500 mt-4 text-sm">
          Phase 1 MVP - Coming Soon
        </p>
      </div>
    </div>
  );
}