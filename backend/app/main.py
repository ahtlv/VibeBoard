from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.routers import analytics, auth, board, checklist_item, column, health, task, time_entry, workspace


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # startup — engine создаётся при импорте, здесь ничего не нужно
    yield
    # shutdown — корректно закрываем все соединения пула
    await engine.dispose()


app = FastAPI(
    title="VibeBoard API",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── routers ───────────────────────────────────────────────────────────────────

API_PREFIX = "/api/v1"

app.include_router(health.router, prefix=API_PREFIX)
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(workspace.router, prefix=API_PREFIX)
app.include_router(board.router, prefix=API_PREFIX)
app.include_router(column.router, prefix=API_PREFIX)
app.include_router(task.router, prefix=API_PREFIX)
app.include_router(checklist_item.router, prefix=API_PREFIX)
app.include_router(time_entry.router, prefix=API_PREFIX)
app.include_router(analytics.router, prefix=API_PREFIX)
