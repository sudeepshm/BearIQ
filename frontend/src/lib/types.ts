export type MemoryStatus = 'active' | 'pending' | 'superseded' | 'rejected' | 'deleted';

export type MemoryCategory = 
  | 'fact' 
  | 'preference' 
  | 'goal' 
  | 'project' 
  | 'skill' 
  | 'habit' 
  | 'communication_style' 
  | 'technical_preference' 
  | 'other';

export interface MemoryItem {
  id: string;
  content: string;
  type: string;
  status: MemoryStatus;
  confidence: number;
  importance: number;
  temporality: 'permanent' | 'long_term' | 'ongoing' | string;
  source_type: 'explicit' | 'inferred' | string;
  created_at: string;
  last_seen: string;
  last_confirmed?: string | null;
  supersedes_id?: string | null;
  conflict_id?: string | null;
  similarity?: number;
}

export interface MemoryEvidence {
  message_id: string;
  source_message_id?: string;
  conversation_id: string;
  source_conversation_id?: string;
  platform?: string;
  text: string;
  timestamp: string;
}

export interface MemoryDetail extends MemoryItem {
  evidence: MemoryEvidence[];
}

export interface ImportResult {
  conversations: number;
  messages: number;
  candidates: number;
  created: number;
  merged: number;
  rejected: number;
  pending: number;
  archive_uri?: string | null;
}

export interface SkillItem {
  id: string;
  title: string;
  markdown: string;
  memory_ids: string[];
  created_at?: string;
}

export interface MarketplaceSkill {
  id: string;
  title: string;
  tagline: string;
  description: string;
  creator: string;
  rating: number;
  reviewsCount: number;
  price: number;
  category: string;
  markdownPreview: string;
  tags: string[];
  version: string;
}

export interface AuthUser {
  id: string;
  email: string;
  token: string;
  isMock: boolean;
}
