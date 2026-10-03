import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import type { Poll } from '../types/poll';
import { pollService, subscribeToPollUpdates } from '../services/pollService';
import {
  getPollStatus,
  getTimeRemainingText,
  formatDateTime,
} from '../utils/pollUtils';
import { StatusBadge } from '../components/StatusBadge';
import { ShareModal } from '../components/ShareModal';
import { useToast } from '../context/ToastContext';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Share2,
  BarChart2,
  ArrowLeft,
  Calendar,
  Lock,
  Vote as VoteIcon,
} from 'lucide-react';

export const VotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [userVoteRecord, setUserVoteRecord] = useState<{ optionId: string; votedAt: string } | null>(null);

  const loadPollData = () => {
    if (!id) return;
    const found = pollService.getPoll(id);
    setPoll(found);

    const voteRecord = pollService.getUserVoteForPoll(id);
    if (voteRecord) {
      setUserVoteRecord({ optionId: voteRecord.optionId, votedAt: voteRecord.votedAt });
      setSelectedOptionId(voteRecord.optionId);
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
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Poll Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The poll #{id} does not exist or may have been removed.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const status = getPollStatus(poll);
  const canVote = status === 'active';

  const handleVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOptionId) {
      toastError('Please choose an option to vote.');
      return;
    }

    if (status === 'scheduled') {
      toastError('This poll has not started yet. Voting is closed.');
      return;
    }

    if (status === 'ended') {
      toastError('This poll has ended. Voting is closed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = pollService.vote(poll.id, selectedOptionId);
      if (result.success && result.poll) {
        setPoll(result.poll);
        setUserVoteRecord({ optionId: selectedOptionId, votedAt: new Date().toISOString() });
        success('Your vote has been recorded successfully!');

        // Trigger celebratory confetti
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });

        // Navigate to results after brief delay so user sees selection confirmed
        setTimeout(() => {
          navigate(`/poll/${poll.id}/results`);
        }, 1200);
      } else {
        toastError(result.error || 'Failed to submit vote.');
      }
    } catch (err: any) {
      toastError(err.message || 'Error recording vote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 space-y-6">
      {/* Top navigation & Share button */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Polls</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Share Poll</span>
          </button>

          <Link
            to={`/poll/${poll.id}/results`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>View Results</span>
          </Link>
        </div>
      </div>

      {/* Main Poll Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        {/* Status and timing banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <StatusBadge status={status} />

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {status === 'active' && (
              <span>Closes in {getTimeRemainingText(poll.endsAt)}</span>
            )}
            {status === 'scheduled' && (
              <span>Opens in {getTimeRemainingText(poll.startsAt, true)}</span>
            )}
            {status === 'ended' && <span>Ended on {formatDateTime(poll.endsAt)}</span>}
          </div>
        </div>

        {/* Question Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
            {poll.question}
          </h1>
          {poll.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {poll.description}
            </p>
          )}
        </div>

        {/* Voting Status Alerts */}
        {status === 'scheduled' && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-amber-800 dark:text-amber-200 text-xs sm:text-sm">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Voting Has Not Started Yet</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                This poll is scheduled to open on {formatDateTime(poll.startsAt)}. Check back soon to cast your vote!
              </p>
            </div>
          </div>
        )}

        {status === 'ended' && (
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
            <Lock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Poll Has Ended</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Voting closed on {formatDateTime(poll.endsAt)}. Check the final results below.
              </p>
            </div>
          </div>
        )}

        {userVoteRecord && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                You already voted in this poll. You may change your choice below or view results.
              </span>
            </div>
            <Link
              to={`/poll/${poll.id}/results`}
              className="font-bold underline shrink-0 hover:text-emerald-600"
            >
              Results &rarr;
            </Link>
          </div>
        )}

        {/* Voting Form */}
        <form onSubmit={handleVoteSubmit} className="space-y-4">
          <div className="space-y-2.5">
            {poll.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isUserChoice = userVoteRecord?.optionId === option.id;

              return (
                <label
                  key={option.id}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-150 select-none ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20'
                  } ${!canVote ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Custom Radio Circle */}
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    <span className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">
                      {option.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isUserChoice && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Your Pick
                      </span>
                    )}

                    <input
                      type="radio"
                      name={`poll_${poll.id}`}
                      value={option.id}
                      checked={isSelected}
                      disabled={!canVote}
                      onChange={() => setSelectedOptionId(option.id)}
                      className="sr-only"
                    />
                  </div>
                </label>
              );
            })}
          </div>

          {/* Submit Vote Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={!canVote || !selectedOptionId || isSubmitting}
              className={`w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white transition-all shadow-md active:scale-[0.99] ${
                canVote && selectedOptionId
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20 cursor-pointer'
                  : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <VoteIcon className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? 'Submitting Vote...'
                  : userVoteRecord
                  ? 'Update My Vote'
                  : 'Submit Vote'}
              </span>
            </button>

            <Link
              to={`/poll/${poll.id}/results`}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold text-center transition-colors"
            >
              View Results
            </Link>
          </div>
        </form>

        {/* Voting Window Metadata Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Opens: {formatDateTime(poll.startsAt)}</span>
          </div>
          <div>
            <span>Closes: {formatDateTime(poll.endsAt)}</span>
          </div>
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
