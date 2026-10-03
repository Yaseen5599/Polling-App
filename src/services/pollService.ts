import type { CreatePollInput, Poll, VoteRecord } from '../types/poll';
import { generateShortId, getPollStatus } from '../utils/pollUtils';

const STORAGE_KEY = 'pulsepoll_polls_v1';
const USER_VOTES_KEY = 'pulsepoll_user_votes_v1';

// Cross-tab synchronization
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('pulsepoll_sync');
  }
} catch {
  // BroadcastChannel not supported in some sandboxes
}

export function subscribeToPollUpdates(callback: (pollId?: string) => void): () => void {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type === 'POLL_UPDATED') {
      callback(event.data.pollId);
    }
  };

  window.addEventListener('storage', handleStorage);
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}

function notifyUpdate(pollId?: string) {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'POLL_UPDATED', pollId });
  }
}

// Seed sample data if empty
function getInitialSeedPolls(): Poll[] {
  const now = new Date();

  // Active poll
  const activeStart = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(); // started 2h ago
  const activeEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(); // ends in 48h

  // Scheduled poll
  const scheduledStart = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // starts tomorrow
  const scheduledEnd = new Date(now.getTime() + 96 * 60 * 60 * 1000).toISOString(); // ends in 4 days

  // Ended poll
  const endedStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const endedEnd = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(); // ended 1h ago

  return [
    {
      id: 'stack2026',
      question: 'What is your primary programming language in 2026?',
      description: 'Vote for the primary language you use for everyday software development.',
      createdAt: activeStart,
      startsAt: activeStart,
      endsAt: activeEnd,
      totalVotes: 100,
      options: [
        { id: 'opt_py', text: 'Python', votes: 50 },
        { id: 'opt_java', text: 'Java', votes: 30 },
        { id: 'opt_js', text: 'JavaScript / TypeScript', votes: 20 },
      ],
    },
    {
      id: 'deploy-infra',
      question: 'Next Platform Feature Roadmap Q4',
      description: 'Which major feature should the core engineering team prioritize next sprint?',
      createdAt: scheduledStart,
      startsAt: scheduledStart,
      endsAt: scheduledEnd,
      totalVotes: 0,
      options: [
        { id: 'opt_1', text: 'Real-time WebSocket Push', votes: 0 },
        { id: 'opt_2', text: 'Dark Mode & Custom Themes', votes: 0 },
        { id: 'opt_3', text: 'Export Reports (PDF / CSV)', votes: 0 },
        { id: 'opt_4', text: 'Multi-language Localizations', votes: 0 },
      ],
    },
    {
      id: 'framework-q3',
      question: 'Best Frontend Framework in Production?',
      description: 'Community poll comparing developer experience and performance.',
      createdAt: endedStart,
      startsAt: endedStart,
      endsAt: endedEnd,
      totalVotes: 142,
      options: [
        { id: 'opt_react', text: 'React & Next.js', votes: 78 },
        { id: 'opt_vue', text: 'Vue & Nuxt', votes: 36 },
        { id: 'opt_svelte', text: 'SvelteKit', votes: 28 },
      ],
    },
  ];
}

export const pollService = {
  getAllPolls(): Poll[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        const seeded = getInitialSeedPolls();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(data) as Poll[];
    } catch {
      return getInitialSeedPolls();
    }
  },

  getPoll(id: string): Poll | null {
    const polls = this.getAllPolls();
    const found = polls.find((p) => p.id.toLowerCase() === id.toLowerCase());
    return found || null;
  },

  createPoll(input: CreatePollInput): Poll {
    const validOptions = input.options
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);

    if (validOptions.length < 2) {
      throw new Error('A poll requires at least 2 options.');
    }

    const newPoll: Poll = {
      id: generateShortId(6),
      question: input.question.trim(),
      description: input.description?.trim() || undefined,
      createdAt: new Date().toISOString(),
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      totalVotes: 0,
      options: validOptions.map((text, idx) => ({
        id: `opt_${idx + 1}_${generateShortId(4)}`,
        text,
        votes: 0,
      })),
    };

    const polls = this.getAllPolls();
    polls.unshift(newPoll);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
    notifyUpdate(newPoll.id);

    return newPoll;
  },

  vote(pollId: string, optionId: string): { success: boolean; poll?: Poll; error?: string } {
    const polls = this.getAllPolls();
    const pollIndex = polls.findIndex((p) => p.id.toLowerCase() === pollId.toLowerCase());

    if (pollIndex === -1) {
      return { success: false, error: 'Poll not found.' };
    }

    const poll = polls[pollIndex];
    const status = getPollStatus(poll);

    if (status === 'scheduled') {
      return { success: false, error: 'Voting is not open yet. This poll is scheduled for later.' };
    }

    if (status === 'ended') {
      return { success: false, error: 'This poll has already ended. Voting is closed.' };
    }

    const option = poll.options.find((o) => o.id === optionId);
    if (!option) {
      return { success: false, error: 'Invalid option selected.' };
    }

    // Check if user already voted in this browser
    const userVotes = this.getUserVotes();
    const existingVote = userVotes.find((v) => v.pollId.toLowerCase() === pollId.toLowerCase());

    if (existingVote) {
      if (existingVote.optionId === optionId) {
        return { success: true, poll, error: 'You have already voted for this option.' };
      }
      // Re-allocating vote
      const prevOpt = poll.options.find((o) => o.id === existingVote.optionId);
      if (prevOpt && prevOpt.votes > 0) {
        prevOpt.votes -= 1;
      }
      option.votes += 1;
      existingVote.optionId = optionId;
      existingVote.votedAt = new Date().toISOString();
    } else {
      option.votes += 1;
      poll.totalVotes += 1;
      userVotes.push({
        pollId: poll.id,
        optionId,
        votedAt: new Date().toISOString(),
      });
    }

    poll.totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    polls[pollIndex] = poll;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
    localStorage.setItem(USER_VOTES_KEY, JSON.stringify(userVotes));
    notifyUpdate(poll.id);

    return { success: true, poll };
  },

  getUserVotes(): VoteRecord[] {
    try {
      const data = localStorage.getItem(USER_VOTES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getUserVoteForPoll(pollId: string): VoteRecord | undefined {
    const votes = this.getUserVotes();
    return votes.find((v) => v.pollId.toLowerCase() === pollId.toLowerCase());
  },

  resetAllPollsToDefault(): void {
    const seeded = getInitialSeedPolls();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    localStorage.removeItem(USER_VOTES_KEY);
    notifyUpdate();
  },
};
