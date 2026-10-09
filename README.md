# BearIQ

Portable long-term memory for AI applications: import historical conversations, extract durable facts/preferences, preserve evidence, and retrieve relevant context through an API.

The backend uses **FastAPI, Gemini, PostgreSQL and pgvector**, with optional Google Cloud Storage and a Cloud Run container. See [backend setup and API documentation](backend/README.md).

Development uses **`main` only**, as requested. The frontend directory is reserved; this implementation follows the supplied backend specification.
