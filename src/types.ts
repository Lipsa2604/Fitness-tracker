/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GoalCategory = 'Cardio' | 'Strength' | 'Flexibility' | 'Nutrition' | 'Weight' | 'Lifestyle';

export interface ProgressLog {
  id: string;
  date: string; // ISO date format YYYY-MM-DD
  value: number; // Numerically logged value (e.g. 10000 steps, 3 liters water, 45 minutes)
  notes?: string; 
}

export interface FitnessGoal {
  id: string;
  title: string;
  category: GoalCategory;
  targetValue: number; // e.g., 10000 (steps), 500 (calories), 4 (times per week), 80 (kg)
  currentValue: number; // computed or initialized value
  unit: string; // e.g., 'steps', 'kcal', 'mins', 'liters', 'sessions', 'kg'
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  status: 'In Progress' | 'Completed' | 'Paused';
  logs: ProgressLog[];
  dailyFrequency: boolean; // true if it's a daily goal, false if it's overall target
  createdAt: string;
}

export interface ReminderSetting {
  id: string;
  time: string; // HH:MM
  enabled: boolean;
  days: string[]; // ['Mon', 'Tue', ...]
  goals: string[]; // Goal IDs linked with this reminder
  aiCoaching: boolean; // Whether to use Gemini to personalize this reminder
  lastTriggered?: string; // date of last trigger
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string; // Locale time
}

export interface DailyMotivation {
  quote: string;
  author: string;
  focusOfTheDay: string;
  wellnessTip: string;
}
