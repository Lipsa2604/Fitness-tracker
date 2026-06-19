/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Target, Calendar, ChevronRight } from 'lucide-react';
import { FitnessGoal, GoalCategory } from '../types';

interface GoalModalProps {
  onClose: () => void;
  onSaveGoal: (goal: Omit<FitnessGoal, 'id' | 'currentValue' | 'logs' | 'createdAt'>) => void;
}

const CATEGORIES: GoalCategory[] = ['Cardio', 'Strength', 'Flexibility', 'Nutrition', 'Weight', 'Lifestyle'];

const DEFAULT_UNITS: Record<GoalCategory, string> = {
  Cardio: 'mins',
  Strength: 'sessions',
  Flexibility: 'mins',
  Nutrition: 'liters',
  Weight: 'kg',
  Lifestyle: 'hours',
};

export default function GoalModal({ onClose, onSaveGoal }: GoalModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Cardio');
  const [targetValue, setTargetValue] = useState<string>('');
  const [unit, setUnit] = useState('mins');
  const [targetDate, setTargetDate] = useState(() => {
    // Default to 1 month from now
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [dailyFrequency, setDailyFrequency] = useState(true);

  const handleCategoryChange = (cat: GoalCategory) => {
    setCategory(cat);
    setUnit(DEFAULT_UNITS[cat] || 'units');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetValue);
    if (isNaN(parsedTarget) || parsedTarget <= 0) return;

    onSaveGoal({
      title: title.trim(),
      category,
      targetValue: parsedTarget,
      unit,
      startDate: new Date().toISOString().split('T')[0],
      targetDate,
      status: 'In Progress',
      dailyFrequency,
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      id="goal-creation-modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden flex flex-col relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-55 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Define Fitness Target</h3>
              <p className="text-slate-500 text-xs">Set measurable milestones and target times</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
          {/* Goal Title */}
          <div>
            <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-1.5 pl-0.5">Goal Description</label>
            <input
              type="text"
              required
              placeholder="e.g., Morning Cardiovascular Jogging, Water Intake, Benchpress Volume"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 focus:outline-indigo-500 rounded-2xl text-sm font-medium text-slate-800"
            />
          </div>

          {/* Goal Category Grid */}
          <div>
            <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-1.5 pl-0.5">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                    category === cat 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                      : 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Target Quantity Value & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-1.5 pl-0.5">Target Value</label>
              <input
                type="number"
                step="any"
                required
                min="0.1"
                placeholder="e.g., 10000, 3, 45, 80"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 focus:outline-indigo-500 rounded-2xl text-sm font-bold text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-1.5 pl-0.5">Metric Unit</label>
              <input
                type="text"
                required
                placeholder="e.g., steps, kcal, sessions, liters"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 focus:outline-indigo-500 rounded-2xl text-sm font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Target Deadline Date */}
          <div>
            <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-1.5 pl-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Target Deadline
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 focus:outline-indigo-500 rounded-2xl text-sm font-medium text-slate-800 antialiased font-mono"
            />
          </div>

          {/* Frequency (Daily metric resets vs long-term milestones) */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Daily Target Focus</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Is this logged daily (e.g. 10000 steps daily) vs a one-off target?</span>
            </div>
            <input
              type="checkbox"
              checked={dailyFrequency}
              onChange={(e) => setDailyFrequency(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Save Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 flex-shrink-0">
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Build Fitness Target</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-2xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
