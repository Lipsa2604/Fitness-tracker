/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FitnessGoal, ProgressLog } from '../types';
import { 
  Plus, Flame, Heart, Target, Calendar, ClipboardList, Trash2, CheckCircle2, 
  Dumbbell, Apple, Scale, Compass, ChevronDown, ChevronUp, Clock, FileText 
} from 'lucide-react';

interface GoalCardProps {
  key?: React.Key;
  goal: FitnessGoal;
  onAddLog: (goalId: string, logValue: number, notes?: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onToggleStatus: (goalId: string) => void;
}

export default function GoalCard({ 
  goal, 
  onAddLog, 
  onDeleteGoal, 
  onToggleStatus 
}: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Rapid log form state
  const [logValue, setLogValue] = useState<string>('');
  const [logNotes, setLogNotes] = useState<string>('');

  const targetPercentage = Math.round((goal.currentValue / goal.targetValue) * 100);
  const cappedPercentage = Math.min(100, Math.max(0, targetPercentage));

  // Category Configuration
  const categoryConfig = {
    Cardio: {
      color: 'from-rose-500 to-red-600',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-100',
      icon: Heart,
    },
    Strength: {
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-100',
      icon: Dumbbell,
    },
    Flexibility: {
      color: 'from-purple-500 to-violet-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-100',
      icon: Compass,
    },
    Nutrition: {
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-100',
      icon: Apple,
    },
    Weight: {
      color: 'from-slate-600 to-slate-800',
      textColor: 'text-slate-700',
      bgColor: 'bg-slate-100 border-slate-200',
      icon: Scale,
    },
    Lifestyle: {
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-100',
      icon: Target,
    },
  };

  const currentCategory = categoryConfig[goal.category] || categoryConfig.Lifestyle;
  const CategoryIcon = currentCategory.icon;

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(logValue);
    if (isNaN(parsed) || parsed <= 0) return;
    
    onAddLog(goal.id, parsed, logNotes.trim() || undefined);
    setLogValue('');
    setLogNotes('');
  };

  return (
    <motion.div 
      layout
      className={`border rounded-3xl bg-white transition-shadow duration-300 ${
        goal.status === 'Completed' 
          ? 'border-emerald-200 shadow-emerald-500/5 shadow-sm' 
          : 'border-slate-100 hover:shadow-md'
      }`}
      id={`goal-card-${goal.id}`}
    >
      {/* Header Info */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${currentCategory.bgColor}`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 block">
                {goal.category} {goal.dailyFrequency ? '• Daily target' : '• Overall'}
              </span>
              <h4 className={`font-bold text-slate-900 text-lg ${goal.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                {goal.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleStatus(goal.id)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                goal.status === 'Completed' 
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              title={goal.status === 'Completed' ? 'Mark Goal Active' : 'Mark Goal Completed'}
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDeleteGoal(goal.id)}
              className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
              title="Delete Goal"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Grid - Radial Progress and Details */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          {/* Radial progress ring */}
          <div className="sm:col-span-4 flex items-center justify-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* SVG Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* SVG Foreground Circle */}
                <motion.circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke={`url(#gradient-${goal.id})`}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={226.19} // 2 * PI * r (36)
                  initial={{ strokeDashoffset: 226.19 }}
                  animate={{ strokeDashoffset: 226.19 - (226.19 * cappedPercentage) / 100 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id={`gradient-${goal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={goal.status === 'Completed' ? '#10b981' : '#6366f1'} />
                    <stop offset="100%" stopColor={goal.status === 'Completed' ? '#059669' : '#4f46e5'} stopOpacity="0.85" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Percent text center */}
              <div className="absolute text-center">
                <span className="font-mono text-xl font-extrabold text-slate-800 tracking-tight">
                  {targetPercentage}%
                </span>
                <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider -mt-1">Done</span>
              </div>
            </div>
          </div>

          {/* Value progression statistics */}
          <div className="sm:col-span-8 flex flex-col justify-center space-y-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {goal.currentValue.toLocaleString()}
              </span>
              <span className="text-slate-400 text-sm font-semibold">
                / {goal.targetValue.toLocaleString()} {goal.unit}
              </span>
            </div>

            {/* Micro progress bar tracker */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cappedPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${goal.status === 'Completed' ? 'from-emerald-500 to-emerald-600' : currentCategory.color}`}
              />
            </div>

            {/* Target Date countdown or info */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Target date: <strong>{new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Log Input Interface */}
        {goal.status !== 'Completed' && (
          <form onSubmit={handleSubmitLog} className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-2">
            <input
              type="number"
              step="any"
              placeholder={`Log ${goal.unit}...`}
              required
              value={logValue}
              onChange={(e) => setLogValue(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-indigo-500 rounded-xl font-medium text-slate-800 font-mono"
            />
            <input
              type="text"
              placeholder="Notes (optional)..."
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-indigo-500 rounded-xl text-slate-600"
            />
            <button
              type="submit"
              className="flex items-center justify-center p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer shrink-0"
              title="Add Progress Record"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Header Toggle for Logs history list */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-between text-slate-500 hover:text-slate-800 text-xs py-1.5 font-semibold transition-colors cursor-pointer border-t border-slate-50 pt-3"
        >
          <div className="flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Activity Log History ({goal.logs.length})</span>
          </div>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Logs Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-100 bg-slate-50/50 rounded-b-3xl overflow-hidden"
          >
            <div className="p-5 max-h-60 overflow-y-auto space-y-2">
              {goal.logs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  No progress entry logged yet. Use the logger block above to register workouts!
                </div>
              ) : (
                [...goal.logs].reverse().map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-start justify-between bg-white border border-slate-100 p-3 rounded-2xl text-xs shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg mt-0.5 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-slate-800 font-mono">
                            +{log.value} {goal.unit}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-slate-500 font-medium mt-1 pl-1 border-l-2 border-indigo-200">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
