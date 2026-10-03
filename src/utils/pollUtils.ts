import type { Poll, PollStatus } from '../types/poll';

export function getPollStatus(poll: Poll): PollStatus {
  const now = new Date().getTime();
  const start = new Date(poll.startsAt).getTime();
  const end = new Date(poll.endsAt).getTime();

  if (now < start) {
    return 'scheduled';
  }
  if (now > end) {
    return 'ended';
  }
  return 'active';
}

export function calculatePercentage(votes: number, total: number): number {
  if (total <= 0) return 0;
  const percentage = (votes / total) * 100;
  return Math.round(percentage * 10) / 10;
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function getTimeRemainingText(targetIso: string, isScheduled: boolean = false): string {
  const diff = new Date(targetIso).getTime() - new Date().getTime();
  if (diff <= 0) {
    return isScheduled ? 'Starting soon' : 'Poll ended';
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  }
  if (hours > 0) {
    const remMinutes = minutes % 60;
    return `${hours}h ${remMinutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m remaining`;
  }
  return 'Less than 1 minute';
}

export function generateShortId(length = 6): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getStatusMeta(status: PollStatus) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        dotClass: 'bg-emerald-500 animate-pulse',
        badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      };
    case 'scheduled':
      return {
        label: 'Scheduled',
        dotClass: 'bg-amber-500',
        badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    case 'ended':
      return {
        label: 'Ended',
        dotClass: 'bg-slate-400',
        badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      };
  }
}
