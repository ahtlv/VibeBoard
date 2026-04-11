from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import text

from app.core.database import engine

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    status: str
    version: str
    database: str


@router.get("", response_model=HealthResponse)
async def health_check() -> JSONResponse:
    db_status = "ok"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception:
        db_status = "unavailable"

    overall = "ok" if db_status == "ok" else "degraded"
    http_status = 200 if overall == "ok" else 503

    body = HealthResponse(status=overall, version="0.1.0", database=db_status)
    return JSONResponse(status_code=http_status, content=body.model_dump())
