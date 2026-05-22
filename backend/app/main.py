"""
app/main.py
────────────
ImperiumAI FastAPI application entry point.

Structure:
  app/
    main.py              ← this file
    core/
      config.py          ← Settings (pydantic-settings)
      container.py       ← Singleton services (DI container)
      logging.py         ← Logging setup
    agents/              ← 5 red-team agents
    llm/                 ← Multi-LLM router
    iot/                 ← IoT simulator
    security/            ← Policy engine
    scoring/             ← Risk engine
    memory/              ← SQLite attack memory
    api/routers/         ← FastAPI routers
    websocket_manager.py ← WS broadcast
    schemas/             ← Pydantic models
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import battle, defense, iot, llm, memory
from app.core.config import get_settings
from app.core.container import init_container
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    setup_logging(debug=settings.debug)

    # Initialise all singletons once
    container = init_container()

    import logging
    logger = logging.getLogger("imperiumai")
    logger.info("🚀 ImperiumAI %s started — LLM: %s", settings.app_version,
                container.llm_router.get_status()["active"])
    yield
    logger.info("ImperiumAI shutdown")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="AI-Based Red Teaming Framework for Smart Home IoT Security",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────
    cors_kwargs: dict = {
        "allow_origins": settings.cors_origins,
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
    if settings.cors_origin_regex:
        cors_kwargs["allow_origin_regex"] = settings.cors_origin_regex
    app.add_middleware(CORSMiddleware, **cors_kwargs)

    # ── WebSocket ─────────────────────────────────────────────────────────
    @app.websocket("/ws")
    async def ws_endpoint(websocket: WebSocket):
        from app.core.container import get_container
        c = get_container()
        await c.ws_manager.connect(websocket)
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            c.ws_manager.disconnect(websocket)

    # ── Routers ───────────────────────────────────────────────────────────
    app.include_router(battle.router)
    app.include_router(defense.router)
    app.include_router(llm.router)
    app.include_router(memory.router)
    app.include_router(iot.router)

    # ── Health check ──────────────────────────────────────────────────────
    @app.get("/health", tags=["system"])
    async def health() -> dict:
        from app.core.container import get_container
        c = get_container()
        return {
            "status": "ok",
            "version": settings.app_version,
            "llm": c.llm_router.get_status()["active"],
            "ws_connections": c.ws_manager.connection_count,
        }

    return app


app = create_app()