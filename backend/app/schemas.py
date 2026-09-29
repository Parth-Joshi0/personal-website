from typing import Literal

from pydantic import BaseModel, Field

from app.difficulty import DIFFICULTY_MAP

Difficulty = Literal["beginner", "casual", "club", "expert"]


class MoveRequest(BaseModel):
    moves: list[str] = Field(default_factory=list, max_length=500)
    difficulty: Difficulty = "club"


class SearchInfoOut(BaseModel):
    depth: int
    seldepth: int
    score_cp: int | None
    score_mate: int | None
    nodes: int
    nps: int
    time_ms: int
    pv: list[str]


class MoveResponse(BaseModel):
    bestmove: str | None
    reason: str | None = None
    info: SearchInfoOut | None = None


assert set(DIFFICULTY_MAP) == {"beginner", "casual", "club", "expert"}
