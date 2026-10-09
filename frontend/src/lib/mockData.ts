import { MemoryItem, MemoryDetail, SkillItem, MarketplaceSkill } from './types';

export const INITIAL_MOCK_MEMORIES: MemoryDetail[] = [
  {
    id: 'mem_01hqz8123',
    content: 'User prefers Python with FastAPI and strict Pydantic schemas over NodeJS for backend systems.',
    type: 'technical_preference',
    status: 'active',
    confidence: 0.98,
    importance: 0.9,
    temporality: 'permanent',
    source_type: 'explicit',
    created_at: '2026-10-08T18:24:00Z',
    last_seen: '2026-10-09T08:12:00Z',
    last_confirmed: '2026-10-09T09:00:00Z',
    evidence: [
      {
        message_id: 'msg_981a',
        source_message_id: 'chatgpt-conv-384',
        conversation_id: 'conv_110',
        platform: 'chatgpt',
        text: 'For my backend projects, I always prefer Python and FastAPI with strict Pydantic v2 validation rather than Node/Express.',
        timestamp: '2026-10-08T18:24:00Z'
      }
    ]
  },
  {
    id: 'mem_02hqz9456',
    content: 'User builds Next.js applications using TypeScript, Tailwind CSS, and App Router with modular directory architectures.',
    type: 'technical_preference',
    status: 'active',
    confidence: 0.95,
    importance: 0.85,
    temporality: 'permanent',
    source_type: 'explicit',
    created_at: '2026-10-08T19:30:00Z',
    last_seen: '2026-10-09T09:15:00Z',
    last_confirmed: '2026-10-09T09:20:00Z',
    evidence: [
      {
        message_id: 'msg_982b',
        source_message_id: 'chatgpt-conv-390',
        conversation_id: 'conv_112',
        platform: 'chatgpt',
        text: 'Keep the frontend in Next.js App Router with TypeScript and Tailwind. Do not use legacy Pages router.',
        timestamp: '2026-10-08T19:30:00Z'
      }
    ]
  },
  {
    id: 'mem_03hqza789',
    content: 'Working on BearIQ: a portable long-term memory system that lets users carry and sell their personal AI expertise layer.',
    type: 'project',
    status: 'active',
    confidence: 0.99,
    importance: 0.95,
    temporality: 'ongoing',
    source_type: 'explicit',
    created_at: '2026-10-07T14:10:00Z',
    last_seen: '2026-10-09T10:00:00Z',
    last_confirmed: '2026-10-09T10:00:00Z',
    evidence: [
      {
        message_id: 'msg_983c',
        source_message_id: 'chatgpt-conv-401',
        conversation_id: 'conv_114',
        platform: 'chatgpt',
        text: 'The vision of BearIQ is to turn conversation history into portable memory and reusable AI skills that can be sold on a marketplace.',
        timestamp: '2026-10-07T14:10:00Z'
      }
    ]
  },
  {
    id: 'mem_04hqzb012',
    content: 'Communication style: Direct, concise, technical, no pleasantries or generic filler summaries in answers.',
    type: 'communication_style',
    status: 'active',
    confidence: 0.94,
    importance: 0.8,
    temporality: 'permanent',
    source_type: 'inferred',
    created_at: '2026-10-08T11:00:00Z',
    last_seen: '2026-10-09T07:30:00Z',
    evidence: [
      {
        message_id: 'msg_984d',
        source_message_id: 'chatgpt-conv-405',
        conversation_id: 'conv_116',
        platform: 'chatgpt',
        text: 'Keep your responses concise, straight to code without verbose conversational fluff.',
        timestamp: '2026-10-08T11:00:00Z'
      }
    ]
  },
  {
    id: 'mem_05hqzc345',
    content: 'Requires SQLite / PostgreSQL with pgvector and strict schema validations for vector embeddings storage.',
    type: 'technical_preference',
    status: 'pending',
    confidence: 0.82,
    importance: 0.75,
    temporality: 'long_term',
    source_type: 'inferred',
    created_at: '2026-10-09T01:45:00Z',
    last_seen: '2026-10-09T01:45:00Z',
    conflict_id: 'mem_01hqz8123',
    evidence: [
      {
        message_id: 'msg_985e',
        source_message_id: 'chatgpt-conv-409',
        conversation_id: 'conv_119',
        platform: 'chatgpt',
        text: 'We should consider testing pgvector for semantic search if SQLite vector indexing hits bottleneck limits.',
        timestamp: '2026-10-09T01:45:00Z'
      }
    ]
  },
  {
    id: 'mem_06hqzd678',
    content: 'User previously experimented with LangChain but rejected it in favor of minimal, explicit provider clients.',
    type: 'fact',
    status: 'active',
    confidence: 0.91,
    importance: 0.7,
    temporality: 'permanent',
    source_type: 'explicit',
    created_at: '2026-10-06T16:20:00Z',
    last_seen: '2026-10-08T20:00:00Z',
    evidence: [
      {
        message_id: 'msg_986f',
        conversation_id: 'conv_102',
        platform: 'chatgpt',
        text: 'LangChain has too much abstraction overhead. I prefer writing direct REST calls or the official Google SDK.',
        timestamp: '2026-10-06T16:20:00Z'
      }
    ]
  }
];

export const INITIAL_MOCK_SKILLS: SkillItem[] = [
  {
    id: 'skill_python_arch',
    title: 'Python Backend Architecture Specialist',
    markdown: `# Python Backend Architecture Specialist

## Context & Principles
- **Framework**: FastAPI with async route execution and Pydantic v2 schemas.
- **Data Layer**: Clean repository pattern decoupling ORM models from HTTP controllers.
- **Safety**: Strict request validation, bounded body stream reading, and HMAC authentication tokens.

## Coding Style
- Write type-annotated, idiomatic Python 3.12+.
- Avoid excessive framework bloat; use direct SQL queries or minimal SQLAlchemy 2.0 select statements.
- Handle database transactions cleanly with dependency-injected sessions.`,
    memory_ids: ['mem_01hqz8123', 'mem_06hqzd678'],
    created_at: '2026-10-09T09:30:00Z'
  },
  {
    id: 'skill_concise_coder',
    title: 'High-Density Direct Coding Persona',
    markdown: `# High-Density Direct Coding Persona

## Persona Directive
- Produce immediate, working code implementations.
- Skip conversational apologies, restatements of the prompt, or generic pleasantries.
- Include concise architectural rationale only when non-obvious trade-offs are involved.`,
    memory_ids: ['mem_04hqzb012'],
    created_at: '2026-10-09T10:15:00Z'
  }
];

export const MARKETPLACE_CATALOG: MarketplaceSkill[] = [
  {
    id: 'mkt_python_fastapi',
    title: 'Production Python & FastAPI Architecture',
    tagline: 'Standardized enterprise microservice structure with SQLAlchemy 2.0 & Pydantic.',
    description: 'Trained on 400+ production API conversations. Enforces clean repository patterns, streaming upload bounds, and high-performance async database sessions.',
    creator: 'sudeep.shm',
    rating: 4.95,
    reviewsCount: 38,
    price: 19,
    category: 'Backend Development',
    tags: ['Python', 'FastAPI', 'Architecture', 'Clean Code'],
    version: '1.2.0',
    markdownPreview: `# Production Python & FastAPI Architecture\n- Use FastAPI routers scoped under /api\n- Enforce Pydantic v2 models for DTOs\n- Strict error boundary handling`
  },
  {
    id: 'mkt_editorial_ui',
    title: 'Editorial UI & Glassmorphism Design System',
    tagline: 'Refined warm-tone aesthetic, typography pairing, and procedural canvas visuals.',
    description: 'Transform standard dashboards into editorial developer tools. Curated color palettes with DM Sans + Manrope typography and subtle depth effects.',
    creator: 'design.intel',
    rating: 4.98,
    reviewsCount: 64,
    price: 29,
    category: 'Frontend & UI',
    tags: ['Design System', 'Tailwind', 'Next.js', 'Canvas'],
    version: '2.0.1',
    markdownPreview: `# Editorial UI System\n- Warm ivory & champagne backgrounds\n- Subtle radial lighting & canvas visualizer`
  },
  {
    id: 'mkt_tech_writing',
    title: 'High-Density Technical Specification Writer',
    tagline: 'Generate PRDs, API schemas, and architecture decision records without filler.',
    description: 'A sharp, zero-fluff technical writing persona that produces structured RFCs, database schema diagrams, and developer-facing endpoint specs.',
    creator: 'alex.eng',
    rating: 4.88,
    reviewsCount: 22,
    price: 15,
    category: 'Product & Writing',
    tags: ['Documentation', 'PRD', 'RFC', 'System Design'],
    version: '1.0.4',
    markdownPreview: `# Technical Specification Writer\n- Formats RFCs with Mermaid diagrams\n- Explicit API dependency graphs`
  },
  {
    id: 'mkt_startup_product',
    title: 'Startup Product Roadmap Planner',
    tagline: 'Prioritize feature dependencies, separate MVPs from extensions, and de-risk builds.',
    description: 'Framework to structure complex SaaS ideas into phase-by-phase dependencies, preventing UI built ahead of backend APIs.',
    creator: 'venture.flow',
    rating: 4.91,
    reviewsCount: 19,
    price: 24,
    category: 'Strategy & Ops',
    tags: ['Roadmap', 'MVP', 'Product Management'],
    version: '1.1.0',
    markdownPreview: `# Startup Product Planner\n- Dependency DAG planning\n- Core MVP vs expansion phases`
  }
];
