/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Dumbbell, Sparkles, User, RefreshCw, MessageSquare } from 'lucide-react';
import { FitnessGoal, CoachMessage } from '../types';

interface AICoachCardProps {
  goals: FitnessGoal[];
}

export default function AICoachCard({ goals }: AICoachCardProps) {
  const [messages, setMessages] = useState<CoachMessage[]>(() => {
    const saved = localStorage.getItem('coach_chat_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'initial_welcome',
        sender: 'coach',
        text: "Hey Athlete! I am Coach Titan, your server-backed AI training & conditioning advisor. Ask me for customized workout schedules, dietary adjustments, or corrective form advice geared around your current goals!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('coach_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMsgText = inputMessage.trim();
    setInputMessage('');

    const newMsg: CoachMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, newMsg];
    setMessages(updatedHistory);
    setLoading(true);

    try {
      // Expose the context to the AI coach endpoint
      const response = await fetch('/api/gemini/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageHistory: updatedHistory.slice(-10), // Send last 10 messages for context window
          activeGoals: goals,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const coachMsg: CoachMessage = {
          id: 'msg_reply_' + Date.now(),
          sender: 'coach',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, coachMsg]);
      } else {
        throw new Error('Failed to reach AI Coach');
      }
    } catch (error) {
      console.error('Error talking to coach:', error);
      const errorMsg: CoachMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'coach',
        text: "I experienced a brief stamina loss trying to reach my servers. Check your internet connection or verify your API configuration! I am still here to help you log progress.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear your chat history with Coach Titan?")) {
      setMessages([
        {
          id: 'initial_welcome',
          sender: 'coach',
          text: "Let's kick off a brand new fitness regimen! How can I assist you with your fitness targets today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  };

  return (
    <div 
      className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col h-[520px] relative overflow-hidden"
      id="ai-coach-card"
    >
      {/* Glow */}
      <div className="absolute top-0 left-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-2xl">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-lg flex items-center gap-1.5 leading-none">
              Coach Titan
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-indigo-500/15 text-indigo-300 font-bold tracking-widest rounded-md">
                Active AI
              </span>
            </h3>
            <p className="text-slate-400 text-xs mt-1 leading-none">Your server-backed sports specialist</p>
          </div>
        </div>

        <button 
          onClick={clearChat}
          className="p-1 px-2.5 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-xl transition-all cursor-pointer"
          title="Clear History"
          id="clear-chat-btn"
        >
          Reset Chat
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 select-text">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isCoach = m.sender === 'coach';
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-3 max-w-[85%] ${isCoach ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                  isCoach 
                    ? 'bg-slate-800 border-slate-700 text-indigo-400' 
                    : 'bg-indigo-600 border-indigo-500 text-white'
                }`}>
                  {isCoach ? <Dumbbell className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div className={`p-3.5 rounded-2xl relative ${
                    isCoach 
                      ? 'bg-slate-850 text-slate-100 border border-slate-800 rounded-tl-sm font-sans' 
                      : 'bg-indigo-600 text-white rounded-tr-sm font-medium'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  </div>
                  <span className={`text-[9px] text-slate-500 block ${isCoach ? 'text-left pl-1' : 'text-right pr-1'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex gap-3 max-w-[80%]"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-800 border border-slate-705 text-indigo-400">
              <Dumbbell className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-850 text-slate-300 border border-slate-800 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-slate-400 font-medium pl-1">Analyzing physical stats...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="shrink-0 flex items-center gap-2 border-t border-slate-800 pt-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={loading}
          placeholder={loading ? "Titan is typing..." : "Ask about routine, diet, stretching, posture..."}
          className="flex-1 bg-slate-850 hover:bg-slate-800 focus:bg-slate-850 text-slate-100 border border-slate-800 rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:border-indigo-500 font-medium transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl shadow-lg transition-all cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
