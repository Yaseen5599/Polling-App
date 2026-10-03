export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export type PollStatus = 'scheduled' | 'active' | 'ended';

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  createdAt: string;
  startsAt: string;
  endsAt: string;
  totalVotes: number;
  creatorIpOrId?: string;
}

export interface CreatePollInput {
  question: string;
  description?: string;
  options: string[];
  startsAt: string;
  endsAt: string;
}

export interface VoteRecord {
  pollId: string;
  optionId: string;
  votedAt: string;
}
