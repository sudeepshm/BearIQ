import { 
  MemoryItem, 
  MemoryDetail, 
  ImportResult, 
  SkillItem, 
  MemoryStatus 
} from './types';
import { INITIAL_MOCK_MEMORIES, INITIAL_MOCK_SKILLS } from './mockData';

class ApiClient {
  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('beariq_api_url');
      if (stored) return stored.replace(/\/+$/, '');
    }
    return (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('beariq_auth_token') || 'dev-token-beariq';
    }
    return null;
  }

  public isMockMode(): boolean {
    if (typeof window !== 'undefined') {
      const mode = localStorage.getItem('beariq_mock_mode');
      if (mode === 'false') return false;
      if (mode === 'true') return true;
    }
    // Default to true in client browser until user explicitly enables live backend or verifies connection
    return false;
  }

  public setMockMode(enabled: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('beariq_mock_mode', String(enabled));
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.getBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let detail = `Request failed with status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.detail) {
            detail = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch {
          // Keep default message
        }
        throw new Error(detail);
      }

      if (response.status === 204) {
        return null as unknown as T;
      }

      return await response.json();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      // If network fails (e.g. backend server is not running on localhost:8000), provide actionable diagnostic
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        throw new Error(`Cannot connect to BearIQ backend at ${this.getBaseUrl()}. Ensure FastAPI backend is running or switch to Demo Mode in Settings.`);
      }
      throw new Error(message);
    }
  }

  // --- Upload Export ---
  async uploadExport(file: File): Promise<ImportResult> {
    if (this.isMockMode()) {
      await new Promise(r => setTimeout(r, 1200));
      return {
        conversations: 28,
        messages: 312,
        candidates: 16,
        created: 11,
        merged: 3,
        rejected: 2,
        pending: 0,
        archive_uri: `file:///storage/archives/export_${Date.now()}.zip`
      };
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.request<ImportResult>('/api/upload', {
      method: 'POST',
      body: formData,
    });
  }

  // --- Memories API ---
  async listMemories(status: MemoryStatus = 'active', limit = 50, offset = 0): Promise<{ memories: MemoryItem[] }> {
    if (this.isMockMode()) {
      await new Promise(r => setTimeout(r, 300));
      const filtered = INITIAL_MOCK_MEMORIES.filter(m => m.status === status);
      return { memories: filtered.slice(offset, offset + limit) };
    }

    return this.request<{ memories: MemoryItem[] }>(`/api/memories?status=${status}&limit=${limit}&offset=${offset}`);
  }

  async getMemory(id: string): Promise<MemoryDetail> {
    if (this.isMockMode()) {
      await new Promise(r => setTimeout(r, 200));
      const found = INITIAL_MOCK_MEMORIES.find(m => m.id === id);
      if (!found) throw new Error('Memory not found');
      return found;
    }

    return this.request<MemoryDetail>(`/api/memories/${id}`);
  }

  async reviewMemory(id: string, action: 'confirm' | 'reject' | 'edit', content?: string): Promise<MemoryItem> {
    if (this.isMockMode()) {
      await new Promise(r => setTimeout(r, 300));
      const mem = INITIAL_MOCK_MEMORIES.find(m => m.id === id);
      if (!mem) throw new Error('Memory not found');
      if (action === 'confirm') {
        mem.status = 'active';
        mem.confidence = 1.0;
        mem.last_confirmed = new Date().toISOString();
      } else if (action === 'reject') {
        mem.status = 'rejected';
      } else if (action === 'edit' && content) {
        mem.content = content;
        mem.last_confirmed = new Date().toISOString();
      }
      return mem;
    }

    return this.request<MemoryItem>(`/api/memories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action, content }),
    });
  }

  async deleteMemory(id: string): Promise<void> {
    if (this.isMockMode()) {
      await new Promise(r => setTimeout(r, 200));
      const mem = INITIAL_MOCK_MEMORIES.find(m => m.id === id);
      if (mem) mem.status = 'deleted';
      return;
    }

    await this.request<void>(`/api/memories/${id}`, {
      method: 'DELETE',
    });
  }

  async queryMemories(query: string, limit = 10): Promise<{ memories: MemoryItem[] }> {
    if (this.isMockMode()) {
      await new Promise(r => setTimeout(r, 450));
      const q = query.toLowerCase();
      const scored = INITIAL_MOCK_MEMORIES
        .map(m => {
          let score = 0.65;
          if (m.content.toLowerCase().includes(q) || q.split(' ').some(w => m.content.toLowerCase().includes(w))) {
            score = 0.88;
          }
          return { ...m, similarity: score };
        })
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
      return { memories: scored.slice(0, limit) };
    }

    return this.request<{ memories: MemoryItem[] }>('/api/memories/query', {
      method: 'POST',
      body: JSON.stringify({ query, limit }),
    });
  }

  // --- Context API ---
  async getContext(query: string): Promise<string> {
    if (this.isMockMode()) {
      await new Promise(r => setTimeout(r, 400));
      return `### User Context Profile
- **Technical Preference**: User prefers Python with FastAPI and strict Pydantic schemas over NodeJS for backend systems.
- **Frontend Stack**: Next.js App Router, TypeScript, Tailwind CSS with modular architecture.
- **Active Project**: BearIQ portable long-term memory system.
- **Communication Directives**: Direct, concise, technical answers with zero generic pleasantries.`;
    }

    const res = await this.request<string | { context: string }>('/api/context', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });

    if (typeof res === 'string') return res;
    if (res && typeof res.context === 'string') return res.context;
    return JSON.stringify(res, null, 2);
  }

  // --- Skills API ---
  async listSkills(limit = 50, offset = 0): Promise<{ skills: SkillItem[] }> {
    if (this.isMockMode()) {
      await new Promise(r => setTimeout(r, 200));
      return { skills: INITIAL_MOCK_SKILLS.slice(offset, offset + limit) };
    }

    return this.request<{ skills: SkillItem[] }>(`/api/skills?limit=${limit}&offset=${offset}`);
  }

  async generateSkill(title: string, query: string): Promise<SkillItem> {
    if (this.isMockMode()) {
      await new Promise(r => setTimeout(r, 900));
      const newSkill: SkillItem = {
        id: `skill_${Date.now()}`,
        title: title || 'Custom Intelligence Skill',
        markdown: `# ${title || 'Custom Intelligence Skill'}

## Persona & Domain Knowledge
Derived from validated long-term memory query "${query}":
- Enforces strict adherence to user development principles.
- Automates project workflows according to user habits.

## Operational Directives
1. Ground decisions in evidence-backed memories.
2. Produce reusable modular components.`,
        memory_ids: ['mem_01hqz8123', 'mem_02hqz9456'],
        created_at: new Date().toISOString()
      };
      INITIAL_MOCK_SKILLS.unshift(newSkill);
      return newSkill;
    }

    const res = await this.request<{ id: string; markdown: string; memory_ids: string[] }>('/api/skills/generate', {
      method: 'POST',
      body: JSON.stringify({ title, query }),
    });

    return {
      id: res.id,
      title: title,
      markdown: res.markdown,
      memory_ids: res.memory_ids,
      created_at: new Date().toISOString(),
    };
  }

  // --- Health Check ---
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/memories?limit=1`, {
        headers: { Authorization: `Bearer ${this.getToken() || 'dev'}` }
      });
      return res.status !== 500 && res.status !== 502 && res.status !== 503;
    } catch {
      return false;
    }
  }
}

export const api = new ApiClient();
