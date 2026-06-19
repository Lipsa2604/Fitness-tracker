/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Quote, Sparkles, RefreshCw, Sun } from 'lucide-react';
import { DailyMotivation as DailyMotivationType } from '../types';

export default function DailyMotivation() {
  const [motivation, setMotivation] = useState<DailyMotivationType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchMotivation = async () => {
    setLoading(true);
    setError(false);
    try {
      const todayString = new Date().toDateString();
      const response = await fetch('/api/gemini/motivation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateSeed: todayString }),
      });
      if (response.ok) {
        const data = await response.json();
        setMotivation(data);
      } else {
        throw new Error('Failed to fetch motivation');
      }
    } catch (err) {
      console.error('Error getting daily motivation:', err);
      setError(true);
      // Fallback
      setMotivation({
        quote: "Success isn't always about greatness. It's about consistency. Daily consistent work leads to success.",
        author: "Dwayne Johnson",
        focusOfTheDay: "Complete an extra 15-minute recovery walk of brisk pacing.",
        wellnessTip: "Hydrate immediately: drink 300ml of fresh water within 30 minutes of waking."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotivation();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden"
      id="daily-motivation-widget"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm tracking-wider uppercase">
          <Sun className="w-4 h-4" />
          <span>Today's Focus & Inspiration</span>
        </div>
        <button 
          onClick={fetchMotivation}
          disabled={loading}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 hover:bg-slate-800 rounded-lg disabled:opacity-50"
          title="Refresh Motivation"
          id="refresh-motivation-btn"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          <div className="h-3 bg-slate-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="h-20 bg-slate-800 rounded-xl"></div>
            <div className="h-20 bg-slate-800 rounded-xl"></div>
          </div>
        </div>
      ) : motivation ? (
        <div className="space-y-6">
          {/* Quote Section */}
          <div className="relative pl-6">
            <Quote className="absolute left-0 top-0 w-4 h-4 text-slate-700 transform rotate-180" />
            <p className="text-slate-100 text-lg font-medium leading-relaxed italic pr-4">
              {motivation.quote}
            </p>
            <p className="text-slate-400 text-sm mt-2 font-mono">
              — {motivation.author}
            </p>
          </div>

          {/* Divided grid for specific actionable items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-850 pt-5">
            {/* Focus of the day */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="bg-slate-850/50 border border-slate-800 rounded-2xl p-4 flex gap-3 items-start"
            >
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest pl-0.5">Physical Focus</h4>
                <p className="text-slate-200 text-sm mt-1 font-sans font-medium">
                  {motivation.focusOfTheDay}
                </p>
              </div>
            </motion.div>

            {/* Wellness bio tip */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="bg-slate-850/50 border border-slate-800 rounded-2xl p-4 flex gap-3 items-start"
            >
              <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 shrink-0">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest pl-0.5">Wellness Micro-Habit</h4>
                <p className="text-slate-200 text-sm mt-1 font-sans">
                  {motivation.wellnessTip}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="text-slate-400 text-sm text-center py-4">
          Failed to load today's motivation. Click reload to try again.
        </div>
      )}
    </motion.div>
  );
}
