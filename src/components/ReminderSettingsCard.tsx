/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellOff, Clock, Trash2, Plus, Sparkles, AlertCircle, Play } from 'lucide-react';
import { FitnessGoal, ReminderSetting } from '../types';

interface ReminderSettingsCardProps {
  goals: FitnessGoal[];
  reminders: ReminderSetting[];
  onSaveReminders: (reminders: ReminderSetting[]) => void;
  onTriggerTestReminder: (reminder: ReminderSetting) => void;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ReminderSettingsCard({
  goals,
  reminders,
  onSaveReminders,
  onTriggerTestReminder,
}: ReminderSettingsCardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [time, setTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [aiCoaching, setAiCoaching] = useState(true);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReminder: ReminderSetting = {
      id: 'reminder_' + Date.now(),
      time,
      enabled: true,
      days: selectedDays,
      goals: selectedGoals,
      aiCoaching,
    };

    onSaveReminders([...reminders, newReminder]);
    setShowAddForm(false);
    
    // Reset Form
    setTime('08:00');
    setSelectedDays(['Mon', 'Wed', 'Fri']);
    setSelectedGoals([]);
    setAiCoaching(true);
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    onSaveReminders(updated);
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    onSaveReminders(updated);
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) ? prev.filter(g => g !== goalId) : [...prev, goalId]
    );
  };

  return (
    <div 
      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col h-full"
      id="reminder-settings-card"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">Daily Reminders</h3>
            <p className="text-slate-500 text-xs">Schedule habit triggers & AI checks</p>
          </div>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-all cursor-pointer shadow-sm"
            id="open-add-reminder-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Alert</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddReminder}
            className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5 overflow-hidden text-sm"
            id="add-reminder-form"
          >
            <h4 className="font-semibold text-slate-800 mb-3 text-xs uppercase tracking-wider">Configure New Daily Reminder</h4>
            
            <div className="space-y-4">
              {/* Time selection */}
              <div>
                <label className="block text-slate-600 font-medium text-xs mb-1">Alert Time (HH:MM)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-indigo-500 font-medium text-slate-800 antialiased"
                  />
                </div>
              </div>

              {/* Day Selection */}
              <div>
                <label className="block text-slate-600 font-medium text-xs mb-1.5">Repeat Days</label>
                <div className="flex flex-wrap gap-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Linked Goals */}
              <div>
                <label className="block text-slate-600 font-medium text-xs mb-1.5">Link to Goals (Optional)</label>
                {goals.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">No goals defined yet. Reminders will give general coaching.</p>
                ) : (
                  <div className="max-h-24 overflow-y-auto space-y-1.5 bg-white p-2 rounded-xl border border-slate-200">
                    {goals.map((goal) => {
                      const isSelected = selectedGoals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => handleGoalToggle(goal.id)}
                          className={`w-full flex items-center justify-between text-left p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <span className="truncate">{goal.title}</span>
                          <span className="shrink-0 text-[10px] uppercase font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-500 ml-1">
                            {goal.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* AI Coach Integration switch */}
              <div className="flex items-center justify-between bg-white px-3 py-2.5 border border-slate-150 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-amber-50 text-amber-600 rounded">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Personalized AI Reminder</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">Generates progressive custom tips via Gemini</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={aiCoaching}
                  onChange={(e) => setAiCoaching(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Form Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Save Reminder
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-1">
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl h-full">
            <BellOff className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-slate-500 font-medium text-xs">No active reminders</p>
            <p className="text-slate-400 text-[10px] max-w-[180px] mt-1 leading-normal">
              Set schedules to jog your routine and sync with AI.
            </p>
          </div>
        ) : (
          reminders.map((reminder) => {
            const hasGoals = reminder.goals && reminder.goals.length > 0;
            return (
              <motion.div
                key={reminder.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-3.5 rounded-2xl border transition-all ${
                  reminder.enabled 
                    ? 'bg-white border-slate-100 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      reminder.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 text-base font-mono block leading-none">
                        {reminder.time}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium leading-none mt-1 block">
                        {reminder.days.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Trigger test alert simulation */}
                    {reminder.enabled && (
                      <button
                        onClick={() => onTriggerTestReminder(reminder)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Simulate Daily Chime & AI Advice Prompt"
                      >
                        <Play className="w-3.5 h-3.5 fill-emerald-600" />
                      </button>
                    )}

                    {/* Enable toggle */}
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className={`text-xs px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        reminder.enabled 
                          ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {reminder.enabled ? 'Enabled' : 'Paused'}
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1 items-center">
                  {reminder.aiCoaching && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI Coach Sync
                    </span>
                  )}
                  {hasGoals ? (
                    <span className="text-[9px] text-indigo-600 bg-indigo-50 border border-indigo-100 font-semibold px-1.5 py-0.5 rounded-md">
                      {reminder.goals.length} Goal{reminder.goals.length > 1 ? 's' : ''} Linked
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      General Reminder
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-3xl flex items-start gap-2.5 text-xs">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-slate-500 leading-normal">
          <strong className="text-slate-700 block mb-0.5">How Daily Reminders Work:</strong>
          Our real-time browser monitor runs side-by-side in your tab. When a reminder sounds, a triple-synthesized chime alerts your workout interval. Tap <strong className="font-semibold text-emerald-600">Play</strong> to test simulation any time!
        </p>
      </div>
    </div>
  );
}
