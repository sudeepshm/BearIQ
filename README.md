# BearIQ

**Give AI a memory it can carry.**

🚀 **Live Demo:** <https://bear-iq-two.vercel.app/>

BearIQ is a portable memory layer that turns historical AI conversations
into structured, evidence-backed, reusable memories. AI applications and
agents can retrieve relevant context instead of starting from scratch
every time.

> **Prototype status:** This README describes the intended architecture
> and selected stack. Before submission, verify every feature and
> integration against the code. Do not claim a service is working or
> deployed unless reviewers can verify it.

## Visual Demonstration

### Demo flow

1.  Upload a ChatGPT export ZIP containing `conversations.json`.
2.  Parse conversations and extract user messages.
3.  Extract, classify, validate, and deduplicate candidate memories.
4.  Review saved memories and their source evidence.
5.  Query memories to retrieve relevant context.
6.  Generate a reusable `skills.md` file from approved memories.

### Screenshots or recording

Commit screenshots to `docs/images/` and replace these placeholders with
the actual filenames before submission.

  -------------------------------------------------------------------------------------
  Import chats                           Review memories
  -------------------------------------- ----------------------------------------------
  ![Import                               ![Memory
  Chats](docs/images/import-chats.png)   Dashboard](docs/images/memory-dashboard.png)

  -------------------------------------------------------------------------------------

  --------------------------------------------------------------------------------
  Query context                          Generated skill
  -------------------------------------- -----------------------------------------
  ![Memory                               ![Generated
  Query](docs/images/memory-query.png)   Skill](docs/images/generated-skill.png)

  --------------------------------------------------------------------------------

**Suggested demo recording:** show ZIP upload, import results, extracted
memories and evidence, a memory query with returned context, and skill
generation/export. Do not show planned features as working features.

## Architecture Blueprints

### System architecture

```mermaid mermaid
flowchart TD
    A[ChatGPT Export ZIP] --> B[ZIP Validation]
    B --> C[Conversation Parser]
    C --> D[Conversation Chunker]
    D --> E[Memory Candidate Extraction]
    E --> F[Hybrid Classification]
    F --> G[Deduplication]
    G --> H[Validation and Conflict Resolution]
    H --> I[(PostgreSQL + pgvector)]
    I --> J[Memory Query Engine]
    J --> K[Context Builder]
    K --> L[AI Application / Agent]
    I --> M[Skill Generator]
    M --> N[Reusable skills.md]
```

### Import sequence

```mermaid mermaid
sequenceDiagram
    actor User
    participant UI as BearIQ UI
    participant API as FastAPI
    participant Parser as ZIP Validator / Parser
    participant AI as Gemini via Google Gen AI SDK, if configured
    participant DB as PostgreSQL + pgvector

    User->>UI: Upload ChatGPT export ZIP
    UI->>API: Submit archive
    API->>Parser: Validate and parse
    Parser-->>API: Normalized conversations
    API->>AI: Extract candidate memories, if configured
    AI-->>API: Structured candidates
    API->>API: Classify, deduplicate, validate
    API->>DB: Store memories and evidence
    API-->>UI: Import status
```

**Design principle:** the model proposes candidate memories; backend
logic validates candidates, resolves duplicates/conflicts, tracks
evidence, and controls what is stored. Request-specific context and
reusable skills are separate outputs.

## Tech Stack Breakdown

The table below describes the selected stack. Mark each technology as
implemented, planned, or not used based on the submitted repository.

  -----------------------------------------------------------------------
  Area                    Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Backend language        Python                  API and
                                                  memory-processing
                                                  pipeline

  API framework           FastAPI                 REST API

  Data validation         Pydantic                Typed request/response
                                                  schemas

  Frontend                Next.js, React,         Web application
                          TypeScript              

  Styling                 Tailwind CSS            Responsive UI

  UI / icons              Lucide; shadcn/ui if    Interface components
                          installed               

  Database                PostgreSQL              Users, conversations,
                                                  messages, memories,
                                                  evidence

  Vector search           pgvector                Embedding storage and
                                                  similarity search

  LLM                     Google Gemini API or    Memory extraction and
                          Vertex AI, depending on skill generation
                          configured integration  

  Embeddings              Google embedding        Semantic retrieval and
                          API/model, if           duplicate detection
                          configured              

  Containerization        Docker                  Reproducible packaging

  Deployment target       Google Cloud Run        Backend hosting

  Managed database target Google Cloud SQL for    Hosted PostgreSQL
                          PostgreSQL              

  Object storage target   Google Cloud Storage,   Persistent uploaded
                          if needed               archive storage

  Secrets target          Google Cloud Secret     Production secrets
                          Manager                 

  Local configuration     Environment variables   Local development
                          and `.env`              settings

  Testing                 pytest and frontend     Automated checks
                          test tools, if          
                          configured              
  -----------------------------------------------------------------------

### Google technology / integration disclosure

For hackathon bonus-point verification, list only integrations actually
present in the submitted code or demonstrable deployment.

-   **Implemented and working:** `[List verified Google integrations]`
-   **Partially configured:** `[List partial integrations]`
-   **Planned only:** Gemini/Vertex AI, Google embeddings, Cloud Run,
    Cloud SQL, Cloud Storage, and Secret Manager unless the repository
    proves otherwise.

A dependency or environment-variable name alone does not prove a working
integration. Include configuration instructions, the relevant code path,
and a demo/deployment link where possible.

## Google Technologies and Integrations

BearIQ's AI workflow can use Google's tools where applicable. Be precise about what is actually integrated in the submitted code:

- **Gemini API + Google Gen AI SDK (`google-genai`)** — structured memory extraction, ambiguous classification, and skill generation, if called by the backend.
- **Gemini Embedding** — semantic retrieval and similarity-based deduplication, if implemented.
- **Vertex AI** — Google Cloud option for managed Gemini and embedding access.
- **Google Cloud Run** — optional backend deployment target; the frontend demo is hosted at Vercel.
- **Cloud SQL for PostgreSQL + pgvector** — optional managed database.
- **Cloud Storage** — optional persistent storage for uploaded archives.
- **Secret Manager** — optional production storage for API credentials.

**Submission status (fill this in accurately):**
- **Implemented and working:** `[List Google services actually called by the code]`
- **Partially configured:** `[List partial integrations]`
- **Planned only:** `[List services not yet connected]`

Do not claim a Google integration based only on a dependency, environment variable, or planned architecture. Link the relevant code and demonstrate it working.

Official references: [Google Gen AI SDK](https://cloud.google.com/vertex-ai/generative-ai/docs/sdks/overview), [Gemini on Vertex AI quickstart](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart), [Text embeddings](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/embeddings/get-text-embeddings).

## Step-by-Step Code Execution Instructions

These commands assume the repository contains `backend/` and
`frontend/`. Adjust paths to match the actual repository.

### Prerequisites

-   Git
-   Python 3.11 or the version specified by the project
-   Node.js LTS and npm
-   PostgreSQL with pgvector if vector columns are used
-   Gemini API key if the current code calls Gemini

### 1. Clone the repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd BearIQ
```

Replace `<YOUR_REPOSITORY_URL>` with the submitted repository URL. If
already cloned, open the project root.

### 2. Configure the backend

``` bash
cd backend
python -m venv .venv
```

Activate the environment:

**Linux / macOS**

``` bash
source .venv/bin/activate
```

**Windows PowerShell**

``` powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

``` bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If the backend uses Google's Gemini API through the official Python SDK and it is not already included in `requirements.txt`, install:

```bash
pip install google-genai
```

If `.env.example` exists, copy it:

``` bash
cp .env.example .env
```

On Windows, copy `.env.example` to `.env` with File Explorer or
`Copy-Item`. Set the exact variable names required by the code. Example
values might look like:

``` dotenv
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/beariq
GEMINI_API_KEY=your_key_here  # only if the code uses the Gemini Developer API key
```

Do not commit `.env`, API keys, or database credentials. Omit optional
provider keys if the current demo path does not require them.

### 3. Prepare the database

Create a PostgreSQL database named `beariq`:

``` sql
CREATE DATABASE beariq;
```

Connect to it and enable pgvector if the schema uses vector columns:

``` sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Run the migration/initialization command used by the project. If Alembic
is installed and migrations exist, that may be:

``` bash
alembic upgrade head
```

Only run commands supported by the repository's actual setup.

### 4. Start the backend

If `backend/app/main.py` exports a FastAPI object named `app`, run from
`backend/`:

``` bash
uvicorn app.main:app --reload
```

The API is typically at `http://127.0.0.1:8000`. If enabled, inspect the
API docs at `http://127.0.0.1:8000/docs`.

### 5. Start the frontend

In a second terminal:

``` bash
cd frontend
npm install
```

Create `frontend/.env.local` with the API URL expected by the frontend.
Example:

``` dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Use this name only if the frontend code reads it. Never place secrets in
`NEXT_PUBLIC_*` variables.

Start the UI:

``` bash
npm run dev
```

Open `http://localhost:3000`.

### 6. Import the sample archive

On the Import Chats page, upload a ZIP containing `conversations.json`
at the archive root. The JSON should be an array of ChatGPT-export-style
conversation objects with `id`, `title`, and a `mapping` object. Each
message should provide `author.role` and `content.parts`.

Use the synthetic `dummy_chatgpt_export.zip` fixture if it is available
in the project handoff. Do not use real private conversations for a
public demo.

### 7. Verify the prototype

-   [ ] Backend starts without errors.
-   [ ] Frontend loads and reaches the backend.
-   [ ] Valid sample ZIP is accepted.
-   [ ] Malformed ZIP returns a clear error.
-   [ ] User messages are parsed correctly.
-   [ ] Memory extraction works when its provider is configured.
-   [ ] Duplicate preferences are handled as expected.
-   [ ] Source evidence is shown where implemented.
-   [ ] Memory queries return relevant results where implemented.
-   [ ] Skill generation/export works if implemented.

### 8. Run tests

Use only commands configured in the repository. Common examples:

**Backend**

``` bash
cd backend
pytest
```

**Frontend**

``` bash
cd frontend
npm run lint
npm run build
```

If a command is not configured, add the required script/dependency or
remove that command from the submission instructions.

## Core Features

-   ChatGPT export ZIP validation and parsing
-   Structured memory candidate extraction
-   Hybrid classification using rules, semantic similarity, and an LLM
    fallback where configured
-   Deduplication and conflict handling
-   Evidence links from memories to source conversations/messages
-   Semantic memory retrieval and request-specific context building
-   Reusable `skills.md` generation and export
-   Optional future feature: explicit skill publishing and marketplace

Clearly label incomplete features as planned.

## API Overview

The backend's OpenAPI docs are the source of truth. The intended API
surface may include:

  Operation              Purpose
  ---------------------- ---------------------------------------------------
  Import conversations   Validate and import a ChatGPT ZIP
  Manage memories        List, edit, confirm, archive, or delete memories
  Query memories         Retrieve memories relevant to a query
  Build context          Return structured context for an AI request
  Generate skills        Generate/export a reusable skill
  Integrations           Manage API keys or connected apps, if implemented

Verify actual routes at `/docs`; this table is not a claim that every
endpoint already exists.

## Security and Privacy

-   Treat uploaded conversations as private user data.
-   Never publish memories or skills without explicit user action.
-   Keep API keys and database credentials out of source control and
    frontend bundles.
-   Validate ZIP contents and enforce upload-size limits.
-   Avoid logging raw conversation text or secrets unnecessarily.
-   Describe export/deletion controls and any limitations honestly.

## Roadmap

1.  Reliable import and parsing
2.  Memory review, evidence, editing, and deletion
3.  Querying and context building
4.  Skill generation and export
5.  Developer API and agent integrations
6.  Optional skill marketplace with explicit publishing and payment
    support

## Team / Submission

-   **Project:** BearIQ
-   **Hackathon / track:** `[Add event and track]`
-   **Team:** `[Add team name and members]`
-   **Repository:** `[Add repository URL]`
-   **Live demo:** `[Add deployed URL or write “Local prototype”]`
-   **Demo video:** `[Add recording URL]`
-   **Contact:** `[Add contact details]`

## License

Add the license selected for this project before public distribution.
