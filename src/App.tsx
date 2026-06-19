/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, Plus, Calendar, Sparkles, TrendingUp, Award, Flame, 
  Download, Upload, AlertTriangle, Bell, Play, X, UserCheck, Heart, RefreshCw
} from 'lucide-react';

import { FitnessGoal, ReminderSetting } from './types';
import DailyMotivation from './components/DailyMotivation';
import ReminderSettingsCard from './components/ReminderSettingsCard';
import GoalCard from './components/GoalCard';
import AICoachCard from './components/AICoachCard';
import GoalModal from './components/GoalModal';

// Audio Synthesizer for notifications
function playTripleNoteChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    const notes = [261.63, 329.63, 392.00]; // C4, E4, G4 (C major triad)
    const startTime = audioCtx.currentTime;
    
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.12);
      
      gainNode.gain.setValueAtTime(0.25, startTime + idx * 0.12);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.12 + 0.35);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(startTime + idx * 0.12);
      osc.stop(startTime + idx * 0.12 + 0.4);
    });
  } catch (err) {
    console.error("Audio Context playback block:", err);
  }
}

// Default preloaded data for incredible immediate developer experience
const DEFAULT_STARTER_GOALS = (): FitnessGoal[] => {
  const oneMonthHence = new Date();
  oneMonthHence.setMonth(oneMonthHence.getMonth() + 1);
  const targetDateStr = oneMonthHence.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  return [
    {
      id: 'starter_cardio',
      title: 'Morning Athletic Cardio Run',
      category: 'Cardio',
      targetValue: 45,
      currentValue: 15,
      unit: 'mins',
      startDate: todayStr,
      targetDate: targetDateStr,
      status: 'In Progress',
      dailyFrequency: true,
      createdAt: new Date().toISOString(),
      logs: [
        {
          id: 'log_starter_1',
          date: new Date(Date.now() - 36 * 3600000).toISOString(),
          value: 15,
          notes: 'High-intensity intervals sprint on soccer grass.'
        }
      ]
    },
    {
      id: 'starter_water',
      title: 'Daily Micro Hydration',
      category: 'Nutrition',
      targetValue: 3,
      currentValue: 1.25,
      unit: 'liters',
      startDate: todayStr,
      targetDate: targetDateStr,
      status: 'In Progress',
      dailyFrequency: true,
      createdAt: new Date().toISOString(),
      logs: [
        {
          id: 'log_starter_2',
          date: new Date(Date.now() - 12 * 3600000).toISOString(),
          value: 1.25,
          notes: 'Filtered mineral water with added wellness trace drops.'
        }
      ]
    },
    {
      id: 'starter_core',
      title: 'Strength Squats & Conditioning Volume',
      category: 'Strength',
      targetValue: 12,
      currentValue: 4,
      unit: 'sessions',
      startDate: todayStr,
      targetDate: targetDateStr,
      status: 'In Progress',
      dailyFrequency: false,
      createdAt: new Date().toISOString(),
      logs: [
        {
          id: 'log_starter_3',
          date: new Date(Date.now() - 48 * 3600000).toISOString(),
          value: 4,
          notes: 'Barbell training: squats block working up to 85% maximum weight'
        }
      ]
    }
  ];
};

const DEFAULT_STARTER_REMINDERS = (): ReminderSetting[] => {
  return [
    {
      id: 'starter_rem_1',
      time: '08:30',
      enabled: true,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      goals: ['starter_cardio', 'starter_water'],
      aiCoaching: true
    },
    {
      id: 'starter_rem_2',
      time: '20:15',
      enabled: true,
      days: ['Mon', 'Wed', 'Sat'],
      goals: ['starter_core'],
      aiCoaching: true
    }
  ];
};

export default function App() {
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [reminders, setReminders] = useState<ReminderSetting[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Modals active state
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // Real-time reminder trigger overlay modal
  const [triggeredOverlay, setTriggeredOverlay] = useState<{
    reminder: ReminderSetting;
    customCoachTip: string;
    loadingTip: boolean;
  } | null>(null);

  // Initialize and Seed Storage
  useEffect(() => {
    const savedGoals = localStorage.getItem('personal_fitness_goals');
    const savedReminders = localStorage.getItem('personal_fitness_reminders');

    if (savedGoals && savedReminders) {
      try {
        setGoals(JSON.parse(savedGoals));
        setReminders(JSON.parse(savedReminders));
      } catch (err) {
        console.error("Decoding local storage state failed, seeding default data:", err);
        setGoals(DEFAULT_STARTER_GOALS());
        setReminders(DEFAULT_STARTER_REMINDERS());
      }
    } else {
      // Seed default active stats
      const initialG = DEFAULT_STARTER_GOALS();
      const initialR = DEFAULT_STARTER_REMINDERS();
      setGoals(initialG);
      setReminders(initialR);
      localStorage.setItem('personal_fitness_goals', JSON.stringify(initialG));
      localStorage.setItem('personal_fitness_reminders', JSON.stringify(initialR));
    }
  }, []);

  // Persists changes
  const persistGoals = (updatedG: FitnessGoal[]) => {
    setGoals(updatedG);
    localStorage.setItem('personal_fitness_goals', JSON.stringify(updatedG));
  };

  const persistReminders = (updatedR: ReminderSetting[]) => {
    setReminders(updatedR);
    localStorage.setItem('personal_fitness_reminders', JSON.stringify(updatedR));
  };

  // Scheduled Reminder Monitor Loop
  useEffect(() => {
    const monitorInterval = setInterval(() => {
      const now = new Date();
      const currentHHMM = now.toTimeString().slice(0, 5); // "HH:MM"
      
      const dayIndex = now.getDay(); // 0 is Sun, 1 is Mon, etc.
      const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayShort = DAYS_SHORT[dayIndex];

      reminders.forEach((reminder) => {
        if (!reminder.enabled) return;
        if (reminder.time === currentHHMM && reminder.days.includes(todayShort)) {
          // Guard against multiple triggers within the same minute
          const todayDateKey = now.toDateString(); // e.g. "Fri Jun 19 2026"
          if (reminder.lastTriggered === todayDateKey) return;

          // Perform trigger!
          triggerReminderNotification(reminder);
          
          // Save last trigger update
          const updated = reminders.map(r => 
            r.id === reminder.id ? { ...r, lastTriggered: todayDateKey } : r
          );
          persistReminders(updated);
        }
      });
    }, 15000); // Check every 15s for high precision with low processor sleep footprint

    return () => clearInterval(monitorInterval);
  }, [reminders, goals]);

  // Handle reminder sound & AI text generation
  const triggerReminderNotification = async (reminder: ReminderSetting) => {
    playTripleNoteChime();

    // Setup active state modal immediately
    setTriggeredOverlay({
      reminder,
      customCoachTip: "Gathering statistics to formulate your routine tip...",
      loadingTip: true
    });

    // Determine context goal object inside goals
    const linkedGoalId = reminder.goals && reminder.goals[0];
    const targetGoal = goals.find(g => g.id === linkedGoalId) || goals[0];

    try {
      const response = await fetch('/api/gemini/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalObj: targetGoal }),
      });

      if (response.ok) {
        const data = await response.json();
        setTriggeredOverlay(prev => prev ? {
          ...prev,
          customCoachTip: data.reminder,
          loadingTip: false
        } : null);
      } else {
        throw new Error("Failed to get AI check tip");
      }
    } catch (err) {
      console.error("AI check generator endpoint failed:", err);
      setTriggeredOverlay(prev => prev ? {
        ...prev,
        customCoachTip: `Focus on progress with your active target: "${targetGoal?.title || 'Daily Training'}". Push for your stats target!`,
        loadingTip: false
      } : null);
    }
  };

  // Add a new logged quantity
  const handleAddNewGoal = (newGoalData: Omit<FitnessGoal, 'id' | 'currentValue' | 'logs' | 'createdAt'>) => {
    const newGoal: FitnessGoal = {
      ...newGoalData,
      id: 'goal_' + Date.now(),
      currentValue: 0,
      createdAt: new Date().toISOString(),
      logs: []
    };

    persistGoals([...goals, newGoal]);
  };

  const handleAddLogValue = (goalId: string, logValue: number, notes?: string) => {
    const updated = goals.map((goal) => {
      if (goal.id !== goalId) return goal;

      const newLog = {
        id: 'log_' + Date.now(),
        date: new Date().toISOString(),
        value: logValue,
        notes
      };

      const updatedLogs = [...goal.logs, newLog];
      
      // Compute new calculated total
      // E.g. For Daily metrics we sum them, but we could also treat Weight category as latest logged value instead!
      let newTotal = 0;
      if (goal.category === 'Weight') {
        // Weight is generally the latest entry is current status
        newTotal = logValue;
      } else {
        newTotal = updatedLogs.reduce((acc, curr) => acc + curr.value, 0);
      }

      const isFinished = newTotal >= goal.targetValue;

      return {
        ...goal,
        logs: updatedLogs,
        currentValue: newTotal,
        status: isFinished ? ('Completed' as const) : goal.status
      };
    });

    persistGoals(updated);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm("Are you sure you want to delete this fitness goal? Your workout history logs for this item will be removed permanently.")) {
      const updated = goals.filter(g => g.id !== goalId);
      persistGoals(updated);
      
      // Clean links inside reminders to avoid empty pointers
      const cleanedReminders = reminders.map(r => ({
        ...r,
        goals: r.goals.filter(id => id !== goalId)
      }));
      persistReminders(cleanedReminders);
    }
  };

  const handleToggleStatus = (goalId: string) => {
    const updated = goals.map(g => 
      g.id === goalId 
        ? { ...g, status: (g.status === 'Completed' ? 'In Progress' as const : 'Completed' as const) } 
        : g
    );
    persistGoals(updated);
  };

  // Backups and Restore
  const handleBackupExport = () => {
    const payload = JSON.stringify({ goals, reminders }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-goals-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackupRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data.goals) && Array.isArray(data.reminders)) {
          persistGoals(data.goals);
          persistReminders(data.reminders);
          alert("Your goals history and alerts have been restored successfully!");
        } else {
          alert("Invalid file format. Make sure the restored file contains both goals and reminders arrays.");
        }
      } catch (err) {
        alert("Parser error reading restoration file. Ensure it is a valid backup JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // clear input
  };

  // Filter lists
  const filteredGoals = goals.filter(g => 
    categoryFilter === 'All' ? true : g.category === categoryFilter
  );

  // Stats Counters
  const completedGoalsCount = goals.filter(g => g.status === 'Completed').length;
  const activeStreak = goals.length > 0 ? Math.min(7, Math.max(1, goals.reduce((acc, curr) => acc + curr.logs.length, 0))) : 0;
  const totalPhysicalLogs = goals.reduce((acc, curr) => acc + curr.logs.length, 0);

  // Weekly columns helper
  const getWeeklyProgress = () => {
    const totalsByDay = [1, 2, 4, 1, 3, 2, 1]; // Fallback values
    const now = new Date();
    goals.forEach(g => {
      g.logs.forEach(l => {
        const d = new Date(l.date);
        let day = d.getDay(); // 0 is Sun, 1 is Mon, ... 6 is Sat
        day = day === 0 ? 6 : day - 1;
        if (day >= 0 && day < 7) {
          totalsByDay[day] += 1;
        }
      });
    });
    const maxVal = Math.max(...totalsByDay, 1);
    return totalsByDay.map(t => Math.max(20, Math.min(100, Math.round((t / maxVal) * 100))));
  };
  const weeklyHeights = getWeeklyProgress();

  // Dynamic values for top stats cards
  const cardioGoal = goals.find(g => g.category === 'Cardio');
  const cardioVal = cardioGoal ? cardioGoal.currentValue : 15;
  const cardioTarget = cardioGoal ? cardioGoal.targetValue : 45;
  const cardioPercentage = Math.min(100, Math.round((cardioVal / cardioTarget) * 100));
  const cardioUnit = cardioGoal ? cardioGoal.unit : 'mins';

  const stepsGoal = goals.find(g => g.category === 'Lifestyle' || g.title.toLowerCase().includes('steps'));
  const stepsVal = stepsGoal ? stepsGoal.currentValue : 12482;
  const stepsTarget = stepsGoal ? stepsGoal.targetValue : 15000;
  const stepsPercentage = Math.min(100, Math.round((stepsVal / stepsTarget) * 100));
  const stepsUnit = stepsGoal ? stepsGoal.unit : 'steps';

  const waterGoal = goals.find(g => g.category === 'Nutrition' || g.title.toLowerCase().includes('water') || g.title.toLowerCase().includes('hydration'));
  const waterVal = waterGoal ? waterGoal.currentValue : 1.25;
  const waterTarget = waterGoal ? waterGoal.targetValue : 3;
  const waterPercentage = Math.min(100, Math.round((waterVal / waterTarget) * 100));
  const waterUnit = waterGoal ? waterGoal.unit : 'liters';

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-900 select-none" id="app-root-container">
      
      {/* Sleek Sidebar Navigation Column */}
      <aside className="w-20 bg-white border-r border-slate-200 hidden md:flex flex-col items-center py-8 justify-between shrink-0">
        <div className="flex flex-col gap-8 items-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Target className="w-5 h-5" />
          </div>
          <nav className="flex flex-col gap-6">
            <div className="w-12 h-12 flex items-center justify-center text-indigo-600 bg-indigo-50 rounded-xl cursor-pointer" title="Dashboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            </div>
            
            <button 
              onClick={() => setShowGoalModal(true)}
              className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer" 
              title="Add Milestone"
            >
              <Plus className="w-5 h-5" />
            </button>

            <button 
              onClick={handleBackupExport}
              className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer" 
              title="Export JSON Backup"
            >
              <Download className="w-5 h-5" />
            </button>
          </nav>
        </div>

        {/* User profile avatar decoration */}
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative group cursor-pointer" title="Active Account">
          <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-indigo-300 flex items-center justify-center text-white font-bold text-xs uppercase">
            Fit
          </div>
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full pointer-events-none border border-emerald-400" />
        </div>
      </aside>

      {/* Main Content Dashboard Container */}
      <main className="flex-1 flex flex-col p-6 lg:p-10 gap-8 h-screen overflow-y-auto min-w-0">
        
        {/* Dynamic Greeting & CTA Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
          <div className="flex flex-col gap-1">
            <p className="text-slate-500 font-medium text-sm">{formattedDate}</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-none">
              Good morning, Athlete
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest leading-none">Active Streak</span>
                <span className="text-2xl font-black text-slate-900 mt-1 leading-none">{activeStreak} Days</span>
              </div>
              <div className="w-[1px] h-10 bg-slate-200 mx-2"></div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Completed</span>
                <span className="text-2xl font-black text-slate-900 mt-1 leading-none">{completedGoalsCount} of {goals.length}</span>
              </div>
            </div>

            <button 
              onClick={() => setShowGoalModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold font-sans shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Log Milestone</span>
            </button>
          </div>
        </header>

        {/* 3 Stats Focus Modules */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
          {/* Card 1: Cardio Running Progress */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 fill-orange-500" />
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                {cardioPercentage}% of Daily
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold">Morning Athletic Cardio</p>
              <h3 className="text-3xl font-bold tracking-tight text-slate-950 font-mono">
                {cardioVal.toLocaleString()} <span className="text-lg text-slate-400 font-normal">{cardioUnit}</span>
              </h3>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${cardioPercentage}%` }}></div>
            </div>
          </div>

          {/* Card 2: Steps / Daily activity */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                {stepsPercentage >= 100 ? 'Goal Reached' : `${stepsPercentage}% of Goal`}
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold">Active Daily Target</p>
              <h3 className="text-3xl font-bold tracking-tight text-slate-950 font-mono">
                {stepsVal.toLocaleString()} <span className="text-lg text-slate-400 font-normal">{stepsUnit}</span>
              </h3>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${stepsPercentage}%` }}></div>
            </div>
          </div>

          {/* Card 3: Hydration */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 fill-cyan-500" />
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                {waterPercentage}% of Daily
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold">Hydration Tracker</p>
              <h3 className="text-3xl font-bold tracking-tight text-slate-950 font-mono">
                {waterVal.toLocaleString()} <span className="text-lg text-slate-400 font-normal">{waterUnit}</span>
              </h3>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${waterPercentage}%` }}></div>
            </div>
          </div>
        </section>

        {/* Lower split grids panels */}
        <section className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 w-full">
          
          {/* Main Left column: Motivation, Interactive Milestones, logs */}
          <div className="lg:col-span-8 flex flex-col gap-6 min-h-0 overflow-y-auto pr-1">
            
            {/* Daily Motivation tip banner */}
            <DailyMotivation />

            {/* Core Workout Milestones */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Active Fitness Milestones</h3>
                  <p className="text-slate-500 text-xs">Set and track long-term goals and custom physical stats</p>
                </div>

                <div className="flex items-center gap-1.5 self-start">
                  <label 
                    className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="Restore file backup"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload CSV/JSON</span>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleBackupRestore} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Category Filter buttons Row */}
              <div className="flex flex-wrap gap-1 mb-5">
                {['All', 'Cardio', 'Strength', 'Flexibility', 'Nutrition', 'Weight', 'Lifestyle'].map((cat) => {
                  const isActive = categoryFilter === cat;
                  const countVal = cat === 'All' 
                    ? goals.length 
                    : goals.filter(g => g.category === cat).length;

                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-slate-900 text-white shadow-xs' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cat} <span className="opacity-60 font-medium ml-1">({countVal})</span>
                    </button>
                  );
                })}
              </div>

              {/* goals checklists map */}
              <div className="space-y-4">
                {filteredGoals.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6">
                    <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-800 font-bold text-sm">No target registered under "{categoryFilter}"</p>
                    <p className="text-slate-500 text-xs mt-1">Ready to create a customized milestone to build physical routine?</p>
                    <button
                      onClick={() => setShowGoalModal(true)}
                      className="mt-3.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Add Custom Milestone
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGoals.map((g) => (
                      <GoalCard
                        key={g.id}
                        goal={g}
                        onAddLog={handleAddLogValue}
                        onDeleteGoal={handleDeleteGoal}
                        onToggleStatus={handleToggleStatus}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Right Column: Weekly Activity visual, Alerts Schedule, AI Coach */}
          <div className="lg:col-span-4 flex flex-col gap-6 shrink-0">
            
            {/* Weekly Activity visual bar indicators */}
            <div className="bg-indigo-950 rounded-3xl p-6 text-white shadow-xl shadow-indigo-150 flex flex-col gap-4 shrink-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm uppercase tracking-widest text-indigo-200">Weekly Performance</h4>
                <span className="text-[10px] font-bold py-0.5 px-2 bg-indigo-800/60 rounded text-indigo-100 uppercase">Interactive Log Hist.</span>
              </div>
              <div className="flex justify-between items-end h-24 gap-1.5 mt-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                  const barH = weeklyHeights[idx] || 25;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-full bg-indigo-900/45 rounded-md h-24 relative overflow-hidden flex items-end">
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-b-md transition-all duration-300" 
                          style={{ height: `${barH}%` }} 
                        />
                      </div>
                      <span className="text-[10px] opacity-60 font-bold uppercase">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Reminders Scheduler widget */}
            <ReminderSettingsCard
              goals={goals}
              reminders={reminders}
              onSaveReminders={persistReminders}
              onTriggerTestReminder={triggerReminderNotification}
            />

            {/* AI Coach chat */}
            <AICoachCard goals={goals} />

          </div>
        </section>
      </main>

      {/* Goal creation modal */}
      <AnimatePresence>
        {showGoalModal && (
          <GoalModal
            onClose={() => setShowGoalModal(false)}
            onSaveGoal={handleAddNewGoal}
          />
        )}
      </AnimatePresence>

      {/* Real-time Simulated alerts triggers popup overlay modal */}
      <AnimatePresence>
        {triggeredOverlay && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative overflow-hidden text-center"
              id="alarm-trigger-overlay"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-5 animate-bounce">
                <Bell className="w-8 h-8 fill-amber-600" />
              </div>

              <span className="text-[10px] uppercase font-mono tracking-widest font-black text-amber-600 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
                Scheduled Trigger Interval Active
              </span>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-4">
                ⏰ Fitness Routine Alarm!
              </h2>
              <p className="text-indigo-600 font-mono text-lg font-bold mt-1">
                Time is {triggeredOverlay.reminder.time}
              </p>

              <div className="mt-6 bg-slate-50 border border-slate-150 p-5 rounded-2xl text-left relative min-h-24">
                <div className="absolute top-3.5 right-4 text-indigo-500">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-0.5">
                  Coach Titan Action Plan
                </h4>

                {triggeredOverlay.loadingTip ? (
                  <div className="mt-3 flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span className="text-slate-500 text-sm font-medium animate-pulse">Formulating personalized progressive tips via Gemini server api...</span>
                  </div>
                ) : (
                  <p className="text-slate-800 text-sm font-medium mt-2 leading-relaxed pr-2">
                    {triggeredOverlay.customCoachTip}
                  </p>
                )}
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  onClick={() => {
                    playTripleNoteChime();
                    setTriggeredOverlay(null);
                  }}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>I'm on it! Execute routine</span>
                </button>
                <button
                  onClick={() => setTriggeredOverlay(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors cursor-pointer"
                >
                  Dismiss Chime
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

