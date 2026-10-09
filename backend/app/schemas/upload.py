from pydantic import BaseModel


class ImportResult(BaseModel):
    conversations: int
    messages: int
    candidates: int
    created: int
    merged: int
    rejected: int
    pending: int
    archive_uri: str | None = None
