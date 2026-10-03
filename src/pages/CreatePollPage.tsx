import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollService } from '../services/pollService';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Eye,
} from 'lucide-react';

export const CreatePollPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const formatInputDateTime = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const now = new Date();
  const defaultStart = formatInputDateTime(now);
  const defaultEnd = formatInputDateTime(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '']);
  const [startsAt, setStartsAt] = useState<string>(defaultStart);
  const [endsAt, setEndsAt] = useState<string>(defaultEnd);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createdPoll, setCreatedPoll] = useState<{ id: string; question: string } | null>(null);

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);

    if (errors[`option_${index}`]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[`option_${index}`];
      setErrors(updatedErrors);
    }
  };

  const handleAddOption = () => {
    if (options.length >= 10) {
      toastError('Maximum 10 options allowed per poll.');
      return;
    }
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      toastError('A poll requires at least 2 options.');
      return;
    }
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  const handleQuickDuration = (hours: number) => {
    const startDate = new Date(startsAt);
    const endDate = new Date(startDate.getTime() + hours * 60 * 60 * 1000);
    setEndsAt(formatInputDateTime(endDate));
  };

  const handleSetStartNow = () => {
    const current = new Date();
    setStartsAt(formatInputDateTime(current));
    const endDate = new Date(endsAt);
    if (endDate.getTime() <= current.getTime()) {
      setEndsAt(formatInputDateTime(new Date(current.getTime() + 24 * 60 * 60 * 1000)));
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!question.trim()) {
      newErrors.question = 'Poll question is required.';
    } else if (question.trim().length < 5) {
      newErrors.question = 'Question should be at least 5 characters.';
    }

    const filledOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (filledOptions.length < 2) {
      newErrors.options = 'Please provide at least 2 non-empty options.';
    }

    const uniqueOptions = new Set(filledOptions.map((o) => o.toLowerCase()));
    if (uniqueOptions.size < filledOptions.length) {
      newErrors.options = 'Poll options must be unique.';
    }

    const startTime = new Date(startsAt).getTime();
    const endTime = new Date(endsAt).getTime();

    if (isNaN(startTime)) {
      newErrors.startsAt = 'Valid start date & time is required.';
    }

    if (isNaN(endTime)) {
      newErrors.endsAt = 'Valid end date & time is required.';
    } else if (endTime <= startTime) {
      newErrors.endsAt = 'End date & time must be strictly after the start time.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toastError('Please fix the validation errors before creating the poll.');
      return;
    }

    setIsSubmitting(true);

    try {
      const validOptions = options.map((o) => o.trim()).filter(Boolean);
      const newPoll = pollService.createPoll({
        question: question.trim(),
        description: description.trim() || undefined,
        options: validOptions,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      });

      success('Poll created successfully! You can now share it.');
      setCreatedPoll({ id: newPoll.id, question: newPoll.question });
    } catch (err: any) {
      toastError(err.message || 'Failed to create poll.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create a New Poll
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Set up your question, choices, and scheduled voting duration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Creation Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
            {/* Question */}
            <div>
              <label
                htmlFor="poll-question"
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1"
              >
                Poll Question <span className="text-rose-500">*</span>
              </label>
              <input
                id="poll-question"
                type="text"
                placeholder="e.g. Which design system should we adopt for v2?"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (errors.question) {
                    const updated = { ...errors };
                    delete updated.question;
                    setErrors(updated);
                  }
                }}
                className={`w-full px-4 py-2.5 rounded-xl border text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all ${
                  errors.question
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              />
              {errors.question && (
                <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.question}</p>
              )}
            </div>

            {/* Optional Description */}
            <div>
              <label
                htmlFor="poll-desc"
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1"
              >
                Context or Description{' '}
                <span className="text-xs text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="poll-desc"
                rows={2}
                placeholder="Add any extra background context or guidelines for voters..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm resize-none"
              />
            </div>

            {/* Options Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Poll Options <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Minimum 2 options required. Single-choice voting.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {options.filter((o) => o.trim()).length} filled
                </span>
              </div>

              {errors.options && (
                <p className="text-xs font-medium text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
                  {errors.options}
                </p>
              )}

              <div className="space-y-2.5">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <span className="w-6 text-center text-xs font-bold text-slate-400">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (index === options.length - 1) {
                            handleAddOption();
                          }
                        }
                      }}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      disabled={options.length <= 2}
                      className={`p-2 rounded-xl transition-colors ${
                        options.length <= 2
                          ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                      }`}
                      title={options.length <= 2 ? 'Minimum 2 options required' : 'Remove option'}
                      aria-label="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddOption}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 text-xs font-semibold hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Option</span>
              </button>
            </div>

            {/* Schedule & Duration */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Voting Window & Scheduling
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date & Time */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="start-time"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Start Date & Time <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSetStartNow}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Start Now
                    </button>
                  </div>
                  <input
                    id="start-time"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => {
                      setStartsAt(e.target.value);
                      if (errors.startsAt) {
                        const updated = { ...errors };
                        delete updated.startsAt;
                        setErrors(updated);
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all ${
                      errors.startsAt
                        ? 'border-rose-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  {errors.startsAt && (
                    <p className="mt-1 text-xs text-rose-500">{errors.startsAt}</p>
                  )}
                </div>

                {/* End Date & Time */}
                <div>
                  <label
                    htmlFor="end-time"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    End Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="end-time"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => {
                      setEndsAt(e.target.value);
                      if (errors.endsAt) {
                        const updated = { ...errors };
                        delete updated.endsAt;
                        setErrors(updated);
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all ${
                      errors.endsAt
                        ? 'border-rose-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  {errors.endsAt && (
                    <p className="mt-1 text-xs text-rose-500">{errors.endsAt}</p>
                  )}
                </div>
              </div>

              {/* Quick Presets for Duration */}
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Quick Duration Presets:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '1 Hour', hours: 1 },
                    { label: '6 Hours', hours: 6 },
                    { label: '24 Hours', hours: 24 },
                    { label: '3 Days', hours: 72 },
                    { label: '7 Days', hours: 168 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleQuickDuration(preset.hours)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      +{preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isSubmitting ? 'Creating Poll...' : 'Create Poll & Generate Link'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Live Preview Card */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-blue-500" />
            <span>Live Voter Preview</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sticky top-24">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Preview Mode</span>
            </div>

            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {question.trim() || 'Your poll question will appear here'}
            </h3>

            {description.trim() && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {description.trim()}
              </p>
            )}

            <div className="space-y-2 pt-2">
              {options
                .map((opt) => opt.trim())
                .filter(Boolean)
                .map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center" />
                    <span className="truncate">{opt}</span>
                  </div>
                ))}
              {options.filter((o) => o.trim()).length === 0 && (
                <div className="text-xs text-slate-400 italic text-center py-4">
                  Add at least 2 options above to see them here
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Single-choice selection</span>
              <span>0 votes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share / Created Success Modal */}
      {createdPoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                Poll Created Successfully!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your shareable link is ready to distribute
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono break-all text-center">
              {`${window.location.origin}/poll/${createdPoll.id}`}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/poll/${createdPoll.id}`);
                  success('Poll link copied to clipboard!');
                }}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
              >
                Copy Share Link
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate(`/poll/${createdPoll.id}`)}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Go to Poll
                </button>
                <button
                  onClick={() => navigate(`/poll/${createdPoll.id}/results`)}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  View Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
