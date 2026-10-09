from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

MemoryType = Literal[
    "fact",
    "preference",
    "goal",
    "project",
    "skill",
    "habit",
    "communication_style",
    "technical_preference",
    "relationship",
    "other",
]
Temporality = Literal["permanent", "long_term", "ongoing", "temporary", "one_time", "unknown"]


class MemoryInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    content: str = Field(min_length=3, max_length=2000)
    type: MemoryType = "fact"
    importance: float = Field(0.7, ge=0, le=1)
    confidence: float = Field(0.8, ge=0, le=1)
    temporality: Temporality = "long_term"
    source_type: Literal["explicit", "inferred"] = "explicit"
    sensitivity: Literal["public", "personal", "sensitive"] = "personal"


class Candidate(MemoryInput):
    message_ids: list[str] = Field(min_length=1, max_length=20)


class Extraction(BaseModel):
    candidates: list[Candidate] = Field(default_factory=list, max_length=50)


class Classification(BaseModel):
    type: MemoryType


class Relation(BaseModel):
    relation: Literal["same", "contradiction", "different"]


class Review(BaseModel):
    model_config = ConfigDict(extra="forbid")
    action: Literal["accept", "edit", "reject"]
    content: str | None = Field(None, min_length=3, max_length=2000)
