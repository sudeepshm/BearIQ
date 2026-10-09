# BearIQ backend

FastAPI service that converts ChatGPT exports into durable, evidence-backed memories. Gemini proposes candidates; backend rules validate provenance, score confidence, and control storage. PostgreSQL stores structured records and pgvector embeddings. The original project scaffold is retained, with no additional services or branches.

## Local setup

Python 3.12 and Docker (for PostgreSQL) are recommended. Commands below run from `backend/`.

```sh
python -m venv .venv
. .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
docker compose up -d
```

Set `GEMINI_API_KEY` in `.env`, or set `USE_VERTEX_AI=true`, `GOOGLE_CLOUD_PROJECT`, and Application Default Credentials. Models are configurable; use models available in your project/region. The Google integration uses the official [Google Gen AI SDK](https://googleapis.github.io/python-genai/), structured Pydantic responses and normalized 768-dimensional embeddings.

Generate an API token and its hash locally:

```sh
python -c 'import secrets, hashlib; t=secrets.token_urlsafe(32); print("Token:",t); print("SHA256:",hashlib.sha256(t.encode()).hexdigest())'
```

Set `API_KEY_HASHES={"<SHA256>":"your-user-id"}` in `.env`. Give the raw token only to that user's trusted application. Different users must have different tokens; multiple tokens may map to one user. This is an MVP service-token scheme, not a public sign-up/login system. Never place these tokens in public frontend code. Missing authentication configuration fails closed with 503.

```sh
python -m app.db.database
uvicorn app.main:app --reload
```

Visit `/docs` for interactive API documentation and use **Authorize** to enter the raw token. `/health` checks the process; `/ready` checks database/schema readiness. Schema creation is an explicit first-install step, not a startup side effect. Subsequent schema evolution requires a reviewed migration; `create_all` does not alter existing tables. Do not change embedding dimensions/model after importing without migrating/re-embedding existing records.

## API

All `/api/*` endpoints require `Authorization: Bearer <token>`. User identity comes exclusively from that token, never from a body `user_id`.

| Endpoint | Behavior |
| --- | --- |
| `POST /api/upload` | Multipart `file`; validate and process one ChatGPT export ZIP synchronously |
| `GET /api/memories` | List own memories; `status`, `limit`, `offset` supported |
| `GET /api/memories/{id}` | Memory plus original message/conversation evidence |
| `POST /api/memories` | Add an explicit durable user memory |
| `POST /api/memories/query` | Semantic search of active memories only |
| `PATCH /api/memories/{id}` | `action`: `accept`, `reject`, or `edit` (requires `content`) |
| `DELETE /api/memories/{id}` | Soft-delete from retrieval, retaining audit history |
| `POST /api/context` | Group retrieved memories by category for agent consumption |
| `POST /api/skills/generate` | Generate a traceable Markdown artifact from retrieved memories |
| `GET /api/skills` | List generated artifacts with pagination |

```sh
export BEARIQ_TOKEN='your-raw-token'
curl http://localhost:8000/api/upload \
  -H "Authorization: Bearer $BEARIQ_TOKEN" -F 'file=@export.zip'
curl http://localhost:8000/api/memories/query \
  -H "Authorization: Bearer $BEARIQ_TOKEN" -H 'Content-Type: application/json' \
  -d '{"query":"How should I design my backend?","limit":10}'
```

`POST /api/context` and `POST /api/skills/generate` take the same query fields; skill generation additionally accepts `title`. Sensitive memories are excluded by default; set `include_sensitive: true` explicitly to retrieve your own sensitive memories. An external agent can call `/api/context` with its current question and pass the returned data to its model as user context. The service itself does not generate the agent's answer.

## Import and memory rules

- ChatGPT `conversations.json` is the supported format. Only text parts on the selected `current_node` ancestry are imported. If `current_node` is absent, only an unambiguous single-leaf graph is accepted. Images/audio and alternate branches are not processed.
- Paths, encryption, symlinks, duplicate archive paths, compression ratios, entry counts, compressed/uncompressed size, and the export structure are checked. No archive files are extracted to disk. HTTP body size is bounded before multipart parsing. The selected JSON file is CRC checked while read; unused attachments are not decompressed.
- Defaults: 20 MiB upload, 100 MiB uncompressed archive, 10,000 entries, compression ratio 200, 200 chunks, 80 messages/24,000 content characters per chunk, overlap 8. Large messages are split while retaining their original ID. Limits can be lowered through environment variables.
- IDs are stable and scoped to user/platform/source conversation. Original messages are immutable. A changed message reusing the same source ID rejects the import rather than corrupting evidence.
- System/tool messages are excluded. Candidate evidence must reference user messages in the current chunk. Temporary, one-time, unknown-duration, low-confidence, and low-importance candidates are rejected.
- Rules classify obvious preferences/projects/goals. Otherwise category embedding prototypes are compared; ambiguous cases use Gemini classification. No custom ML training is involved.
- pgvector cosine search finds potential duplicates; Gemini checks semantic equivalence versus contradiction. Vector similarity alone never merges two different facts.
- Distinct source messages increase evidence count/confidence. Overlap/reimport cannot count the same message twice. Reimports still incur model calls; there is no import-result cache.
- Explicit candidates can become active after backend checks. Inferred, sensitive, and contradictory candidates are pending review. Model extraction and relation judgments remain probabilistic; evidence IDs are checked but the backend cannot mathematically prove that every generated sentence is entailed by its source. Users should review important memories.
- Accepting a contradiction supersedes its linked old memory without deleting its evidence. Edits create a new version. Rejected/deleted/superseded matches are suppressed on reimport. User writes are serialized with PostgreSQL advisory transaction locks.
- Skills are deterministic quotations of retrieved memories with source IDs, avoiding invented preferences. Editing, rejecting, deleting, or superseding a memory invalidates stored skills that use it. Already downloaded copies cannot be revoked.
- Query/context routes do not create memories. Query ranking combines semantic similarity, confidence and recency. Exact pgvector search is appropriate for the MVP; add and benchmark an ANN index when data size warrants it.

## Storage and failure semantics

Each import is one database transaction. Parsing, Gemini, or database failure rolls back conversations, messages, memories, and evidence together. Synchronous imports can be slow; lower `MAX_CHUNKS` for request latency/cost budgets. HTTP retries may repeat LLM costs but evidence remains idempotent. This MVP does not claim durable background processing or resumable jobs.

When `GCS_BUCKET` is unset, uploads are processed temporarily and not retained as ZIPs. When set, the original archive is uploaded under a hashed owner/content key after processing, before database commit. GCS and PostgreSQL do not share a transaction; a commit failure can leave an orphan object. Configure a private bucket with lifecycle deletion and uniform access control. Do not grant public access. An object URI returned by import is metadata, not a download credential.

`DELETE` is a reversible soft deletion from retrieval, **not** a GDPR-style erasure endpoint. Original chats, evidence and historical versions remain stored. Full account erasure, public-user identity onboarding, rate limiting, durable jobs, and an export-format adapter for Claude are future work, not implemented features.

## Tests

```sh
pytest -q
ruff check .
# Optional: use a dedicated disposable PostgreSQL database, never your real data.
TEST_DATABASE_URL='postgresql+psycopg://beariq:beariq@localhost:5432/beariq_test' pytest -q tests/test_pipeline.py
```

Default tests use SQLite and a deterministic provider fixture (no credentials/cost). PostgreSQL tests run the same API pipeline against real pgvector, advisory locks, and SQL types. GitHub Actions on `main` runs both. Tests cover imports, provenance, scope isolation, semantic-decision orchestration, review/versioning, rollback, repeat imports, query/context/skills, malformed archives and body limits. They do not measure Gemini model accuracy or perform live cloud deployment.

## Cloud Run deployment

1. Create a Google Cloud project and enable Cloud Run, Artifact Registry, Cloud SQL Admin, Secret Manager, and Vertex AI if using Vertex.
2. Provision a PostgreSQL Cloud SQL instance/database/user. Enable `vector` with an administrator once; runtime users should have only required schema/data permissions. Make the initial tables by running `python -m app.db.database` against that database using a migration/admin identity.
3. Create a dedicated Cloud Run service account with Cloud SQL Client, Secret Manager Secret Accessor on the specific secrets, Vertex AI User if applicable, and Storage Object User on the optional private upload bucket. Avoid project-wide Owner permissions.
4. Store `DATABASE_URL`, `API_KEY_HASHES`, and (for API-key mode) `GEMINI_API_KEY` in Secret Manager. Cloud Run can inject them as environment variables. For a Cloud SQL Unix socket, use a psycopg SQLAlchemy URL shaped like `postgresql+psycopg://USER:URL_ENCODED_PASSWORD@/DB?host=/cloudsql/PROJECT:REGION:INSTANCE`.
5. Build the supplied Dockerfile, push to Artifact Registry, and deploy with your project's settings. This example assumes the three secrets already exist and uses Gemini API-key mode:

```sh
# Replace these illustrative identifiers before running.
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT/REPOSITORY/beariq:0.1.0 .
gcloud run deploy beariq \
  --image REGION-docker.pkg.dev/PROJECT/REPOSITORY/beariq:0.1.0 \
  --region REGION --service-account beariq@PROJECT.iam.gserviceaccount.com \
  --add-cloudsql-instances PROJECT:REGION:INSTANCE \
  --set-secrets DATABASE_URL=beariq-database-url:latest,API_KEY_HASHES=beariq-api-key-hashes:latest,GEMINI_API_KEY=beariq-gemini-key:latest \
  --concurrency 4 --max-instances 3 --memory 1Gi --timeout 3600 \
  --no-allow-unauthenticated
```

6. Choose gateway/IAM access deliberately. The example is private. Because the app uses the Authorization header for its BearIQ token, an IAM-protected caller should provide the Google identity token separately in `X-Serverless-Authorization: Bearer <Google ID token>`. Public ingress, if explicitly enabled, still requires the app token; add gateway quotas/rate limits before opening this to untrusted users.
7. Verify `/ready`, import a small real export, inspect evidence, query from a second token to check isolation, and review Cloud Run logs without logging chat payloads or credentials. Live Gemini, Cloud SQL, GCS and Cloud Run verification requires your account configuration and is not replaced by fixture tests.

The repository does not contain credentials or provision paid cloud resources automatically.
