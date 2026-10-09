from functools import lru_cache
import urllib.parse
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "postgresql+psycopg://beariq:beariq@localhost:5432/beariq"
    gemini_api_key: str | None = None
    google_cloud_project: str | None = None
    google_cloud_location: str = "us-central1"
    use_vertex_ai: bool = False
    gemini_model: str = "gemini-2.5-flash"
    embedding_model: str = "gemini-embedding-001"
    embedding_dimensions: int = Field(768, ge=128, le=2000)
    gcs_bucket: str | None = None
    max_upload_bytes: int = Field(20 * 1024 * 1024, gt=0)
    max_uncompressed_bytes: int = Field(100 * 1024 * 1024, gt=0)
    max_zip_entries: int = Field(10000, gt=0)
    max_compression_ratio: int = Field(200, gt=0)
    chunk_messages: int = Field(80, ge=2)
    chunk_overlap: int = Field(8, ge=0)
    chunk_characters: int = Field(24000, ge=1000)
    max_chunks: int = Field(200, gt=0)
    minimum_confidence: float = Field(0.65, ge=0, le=1)
    similarity_threshold: float = Field(0.78, ge=0, le=1)
    # Map SHA256(API token) to a user ID. Raw tokens are never persisted.
    api_key_hashes: dict[str, str] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_and_sanitize(self):
        if self.chunk_overlap >= self.chunk_messages:
            raise ValueError("chunk_overlap must be smaller than chunk_messages")

        # Fix unencoded '@' characters inside password in database_url
        if "://" in self.database_url:
            proto, rest = self.database_url.split("://", 1)
            if rest.count("@") > 1:
                user_pass, host_part = rest.rsplit("@", 1)
                if ":" in user_pass:
                    user, password = user_pass.split(":", 1)
                    encoded_password = urllib.parse.quote(urllib.parse.unquote(password), safe="")
                    rest = f"{user}:{encoded_password}@{host_part}"
            if proto in ("postgres", "postgresql"):
                proto = "postgresql+psycopg"
            self.database_url = f"{proto}://{rest}"

        return self


@lru_cache
def get_settings():
    return Settings()
