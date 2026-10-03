import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Poll } from '../types/poll';
import { pollService, subscribeToPollUpdates } from '../services/pollService';
import { getPollStatus } from '../utils/pollUtils';
import { StatusBadge } from '../components/StatusBadge';
import { ShareModal } from '../components/ShareModal';
import {
  PlusCircle,
  BarChart3,
  Clock,
  Sparkles,
  Users,
  Share2,
  ArrowRight,
  Vote,
  CheckCircle2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [sharePoll, setSharePoll] = useState<Poll | null>(null);

  const loadPolls = () => {
    setPolls(pollService.getAllPolls());
  };

  useEffect(() => {
    loadPolls();
    const unsubscribe = subscribeToPollUpdates(() => {
      loadPolls();
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 text-center">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[500px] h-[300px] bg-gradient-to-tr from-blue-500/15 to-indigo-500/20 rounded-full blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold mb-6 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>No login required &bull; 100% Client-side & Instant</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight sm:leading-tight">
          Create & Share Polls with{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Real-Time Results
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Ask questions, set start and end time windows, share a unique link, and gather feedback instantly with clean SaaS visuals.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/create"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create a Poll</span>
          </Link>

          {polls.length > 0 && (
            <Link
              to={`/poll/${polls[0].id}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
            >
              <Vote className="w-5 h-5 text-indigo-500" />
              <span>Try Demo Poll</span>
            </Link>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
            Instant Share Links
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Generate clean `/poll/:id` URLs and mobile-friendly QR codes with a single click. Share everywhere.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
            Time-Window Control
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Schedule future polls or enforce deadlines. Voting is automatically locked before start or after end.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
            Visual Live Results
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Watch percentages, total vote tallies, and ranking progress bars update smoothly in real time.
          </p>
        </div>
      </section>

      {/* Explore Polls Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recent & Active Polls
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Browse available community and sample polls
            </p>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
          >
            <span>+ Create new poll</span>
          </Link>
        </div>

        {polls.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-slate-500">No polls created yet. Be the first to create one!</p>
            <Link
              to="/create"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl"
            >
              Create Poll
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {polls.map((poll) => {
              const status = getPollStatus(poll);
              const userVote = pollService.getUserVoteForPoll(poll.id);

              return (
                <div
                  key={poll.id}
                  className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Header: Status badge & ID */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <StatusBadge status={status} />
                      <div className="flex items-center gap-2">
                        {userVote && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Voted
                          </span>
                        )}
                        <span className="text-xs font-mono text-slate-400">
                          #{poll.id}
                        </span>
                      </div>
                    </div>

                    {/* Question */}
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                      <Link to={`/poll/${poll.id}`}>{poll.question}</Link>
                    </h3>

                    {poll.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {poll.description}
                      </p>
                    )}

                    {/* Options Preview */}
                    <div className="space-y-1.5 my-4">
                      {poll.options.slice(0, 3).map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800"
                        >
                          <span className="truncate pr-2">{opt.text}</span>
                          <span className="font-semibold text-slate-500 shrink-0">
                            {opt.votes} {opt.votes === 1 ? 'vote' : 'votes'}
                          </span>
                        </div>
                      ))}
                      {poll.options.length > 3 && (
                        <p className="text-[11px] text-slate-400 italic text-right">
                          +{poll.options.length - 3} more options
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer Meta & Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users className="w-3.5 h-3.5" />
                      <span>{poll.totalVotes} total votes</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSharePoll(poll)}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Share poll"
                        aria-label="Share poll"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <Link
                        to={`/poll/${poll.id}/results`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Results
                      </Link>

                      <Link
                        to={`/poll/${poll.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
                      >
                        <span>{status === 'active' ? 'Vote' : 'View'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Share Modal Dialog */}
      {sharePoll && (
        <ShareModal
          isOpen={!!sharePoll}
          onClose={() => setSharePoll(null)}
          pollId={sharePoll.id}
          question={sharePoll.question}
        />
      )}
    </div>
  );
};
