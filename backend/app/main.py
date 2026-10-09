from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.api import memories, upload, integration
from app.core.config import get_settings
from app.db.database import engine
from app.integrations.gemini import ProviderError

app = FastAPI(
    title="BearIQ", version="0.1.0", description="Portable, evidence-backed long-term memory for AI applications."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BodyLimit:
    """Bound the actual HTTP body before multipart parsing, even without Content-Length."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope["method"] not in ("POST", "PUT", "PATCH"):
            return await self.app(scope, receive, send)
        maximum = get_settings().max_upload_bytes + 1024 * 1024
        body = bytearray()
        while True:
            event = await receive()
            if event["type"] == "http.disconnect":
                return
            body.extend(event.get("body", b""))
            if len(body) > maximum:
                return await JSONResponse({"detail": "Request body exceeds limit"}, status_code=413)(
                    scope, receive, send
                )
            if not event.get("more_body", False):
                break
        sent = False

        async def replay():
            nonlocal sent
            if not sent:
                sent = True
                return {"type": "http.request", "body": bytes(body), "more_body": False}
            return await receive()

        await self.app(scope, replay, send)


app.add_middleware(BodyLimit)
app.include_router(upload.router, prefix="/api", tags=["Import"])
app.include_router(memories.router, prefix="/api", tags=["Memories"])
app.include_router(integration.router, prefix="/api", tags=["Integrations"])


@app.exception_handler(ProviderError)
async def provider_error(request, exc):
    return JSONResponse(status_code=502, content={"detail": "AI provider unavailable or invalid response; retry later"})


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/ready")
def ready():
    try:
        with engine().connect() as conn:
            conn.execute(text("SELECT 1 FROM users LIMIT 1"))
        return {"status": "ready"}
    except Exception:
        return JSONResponse(status_code=503, content={"status": "database unavailable or schema not initialized"})
