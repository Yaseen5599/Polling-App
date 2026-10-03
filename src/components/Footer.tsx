import React from 'react';
import { pollService } from '../services/pollService';
import { useToast } from '../context/ToastContext';
import { RotateCcw, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { success } = useToast();

  const handleResetData = () => {
    if (window.confirm('Reset all demo polls and local votes to default state?')) {
      pollService.resetAllPollsToDefault();
      success('Sample polls and vote history restored to default.');
    }
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-auto py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span>PulsePoll &bull; Instant, Lightweight & Modern Polling App</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>Vercel Ready</span>
          </div>

          <button
            onClick={handleResetData}
            title="Reset sample polls and voting data"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
