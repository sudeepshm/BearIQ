from pydantic import BaseModel, ConfigDict, Field


class Query(BaseModel):
    model_config = ConfigDict(extra="forbid")
    query: str = Field(min_length=1, max_length=4000)
    limit: int = Field(10, ge=1, le=50)
    include_sensitive: bool = False


class SkillRequest(Query):
    title: str = Field("Personal context", min_length=1, max_length=100)
