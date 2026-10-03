import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Poll } from '../types/poll';
import { pollService, subscribeToPollUpdates } from '../services/pollService';
import {
  getPollStatus,
  calculatePercentage,
  getTimeRemainingText,
} from '../utils/pollUtils';
import { StatusBadge } from '../components/StatusBadge';
import { ShareModal } from '../components/ShareModal';
import { useToast } from '../context/ToastContext';
import {
  Users,
  Trophy,
  Share2,
  ArrowLeft,
  CheckCircle2,
  PlusCircle,
  Copy,
  Clock,
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { success, error: toastError } = useToast();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [userVoteOptionId, setUserVoteOptionId] = useState<string | null>(null);

  const loadPollData = () => {
    if (!id) return;
    const found = pollService.getPoll(id);
    setPoll(found);

    const voteRecord = pollService.getUserVoteForPoll(id);
    if (voteRecord) {
      setUserVoteOptionId(voteRecord.optionId);
    }
  };

  useEffect(() => {
    loadPollData();
    const unsubscribe = subscribeToPollUpdates((updatedPollId) => {
      if (!updatedPollId || updatedPollId.toLowerCase() === id?.toLowerCase()) {
        loadPollData();
      }
    });
    return () => unsubscribe();
  }, [id]);

  if (!poll) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Poll Not Found
        </h2>
        <p className="text-sm text-slate-500">
          The requested poll #{id} does not exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Home</span>
        </Link>
      </div>
    );
  }

  const status = getPollStatus(poll);

  // Determine top vote count for leader badge
  const maxVotes = Math.max(...poll.options.map((o) => o.votes), 0);

  // Copy text breakdown to clipboard
  const handleCopySummary = async () => {
    let summary = `📊 Poll Results: "${poll.question}"\nTotal Votes: ${poll.totalVotes}\n\n`;
    poll.options.forEach((opt) => {
      const pct = calculatePercentage(opt.votes, poll.totalVotes);
      summary += `• ${opt.text}: ${opt.votes} votes (${pct}%)\n`;
    });
    summary += `\nVote or view live at: ${window.location.origin}/poll/${poll.id}`;

    try {
      await navigator.clipboard.writeText(summary);
      success('Results summary copied to clipboard!');
    } catch {
      toastError('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">
      {/* Top Nav actions */}
      <div className="flex items-center justify-between">
        <Link
          to={`/poll/${poll.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Voting</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Copy formatted text results to clipboard"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy Summary</span>
          </button>

          <button
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Poll</span>
          </button>
        </div>
      </div>

      {/* Main Results Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <StatusBadge status={status} />

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              {poll.totalVotes} {poll.totalVotes === 1 ? 'total vote' : 'total votes'}
            </span>

            {status === 'active' && (
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                Closes in {getTimeRemainingText(poll.endsAt)}
              </span>
            )}
          </div>
        </div>

        {/* Question Title & Description */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
            {poll.question}
          </h1>
          {poll.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {poll.description}
            </p>
          )}
        </div>

        {/* Option Breakdown List */}
        <div className="space-y-4 pt-2">
          {poll.options.map((option) => {
            const percentage = calculatePercentage(option.votes, poll.totalVotes);
            const isLeader = maxVotes > 0 && option.votes === maxVotes;
            const isUserPick = userVoteOptionId === option.id;

            return (
              <div
                key={option.id}
                className={`p-4 rounded-xl border transition-all ${
                  isLeader
                    ? 'border-blue-300 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20'
                }`}
              >
                {/* Option Header: Text, Votes & Percentage */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                      {option.text}
                    </span>

                    {isLeader && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        Leader
                      </span>
                    )}

                    {isUserPick && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Your Vote
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 shrink-0">
                    <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono">
                      {percentage}%
                    </span>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700/60 rounded-full h-3 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isLeader
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-500'
                        : 'bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-500 dark:to-slate-600'
                    }`}
                    style={{ width: `${Math.max(percentage, poll.totalVotes > 0 ? 1 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Live sync banner notice */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live updates enabled across open tabs and voters</span>
          </div>
          <span>Updated just now</span>
        </div>

        {/* Bottom Navigation & CTA */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {status === 'active' && (
              <Link
                to={`/poll/${poll.id}`}
                className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                {userVoteOptionId ? 'Change My Vote' : 'Cast a Vote'}
              </Link>
            )}

            <button
              onClick={() => setIsShareOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Share Link</span>
            </button>
          </div>

          <Link
            to="/create"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Another Poll</span>
          </Link>
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        pollId={poll.id}
        question={poll.question}
      />
    </div>
  );
};
