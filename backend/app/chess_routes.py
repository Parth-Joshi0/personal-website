from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.engine_client import (
    EngineCrashedError,
    EngineTimeoutError,
    IllegalMoveError,
    get_engine_move,
)
from app.schemas import MoveRequest, MoveResponse, SearchInfoOut

router = APIRouter(prefix="/api/chess")


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/move", response_model=MoveResponse)
def move(request: MoveRequest):
    try:
        result = get_engine_move(request.moves, request.difficulty)
    except IllegalMoveError as exc:
        return JSONResponse(
            status_code=400,
            content={"error": "illegal_move", "rejected": exc.rejected},
        )
    except EngineTimeoutError:
        return JSONResponse(status_code=504, content={"error": "engine_timeout"})
    except EngineCrashedError:
        return JSONResponse(status_code=502, content={"error": "engine_crashed"})

    if result.bestmove is None:
        return MoveResponse(bestmove=None, reason="no_legal_moves")

    info_out = (
        SearchInfoOut(
            depth=result.info.depth,
            seldepth=result.info.seldepth,
            score_cp=result.info.score_cp,
            score_mate=result.info.score_mate,
            nodes=result.info.nodes,
            nps=result.info.nps,
            time_ms=result.info.time_ms,
            pv=result.info.pv,
        )
        if result.info is not None
        else None
    )
    return MoveResponse(bestmove=result.bestmove, info=info_out)
