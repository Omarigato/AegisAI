from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ─────────────────────────────────────────────────────────────────
    app_name: str = "ImperiumAI"
    app_version: str = "2.0.0"
    debug: bool = False

    # ── Server ──────────────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = False

    # ── CORS ────────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins (full URLs with scheme).
    # Defaults to localhost so the API isn't open to the world before the
    # operator has configured the deployment.
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Optional Python regex that any *additional* origin is matched against.
    # Useful for Render preview deployments, e.g.:
    #   ALLOWED_ORIGIN_REGEX=^https://imperium-ai-frontend(-[a-z0-9]+)?\.onrender\.com$
    allowed_origin_regex: str = Field(default="", alias="ALLOWED_ORIGIN_REGEX")

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def cors_origin_regex(self) -> str | None:
        v = (self.allowed_origin_regex or "").strip()
        return v or None

    # ── LLM API Keys (all optional — falls back to simulation) ──────────────
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    deepseek_api_key: str = Field(default="", alias="DEEPSEEK_API_KEY")
    groq_api_key: str = Field(default="", alias="GROQ_API_KEY")
    openrouter_api_key: str = Field(default="", alias="OPENROUTER_API_KEY")

    # ── Database ─────────────────────────────────────────────────────────────
    # Two ways to configure storage:
    #   1) DATABASE_URL   — full SQLAlchemy URL (preferred for prod/Postgres).
    #                       e.g. postgresql+psycopg://user:pass@host:5432/imperiumai
    #   2) DB_PATH        — local SQLite file (default, used when DATABASE_URL is empty).
    database_url: str = Field(default="", alias="DATABASE_URL")
    db_path: Path = Path("data/attack_memory.db")

    @property
    def resolved_database_url(self) -> str:
        """SQLAlchemy URL — uses DATABASE_URL if set, else local SQLite file."""
        if self.database_url:
            url = self.database_url.strip()
            # SQLAlchemy 2.x prefers explicit driver; older URLs use 'postgres://'.
            if url.startswith("postgres://"):
                url = "postgresql+psycopg://" + url[len("postgres://"):]
            elif url.startswith("postgresql://"):
                url = "postgresql+psycopg://" + url[len("postgresql://"):]
            return url
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{self.db_path.as_posix()}"

    # ── Battle Tuning ────────────────────────────────────────────────────────
    max_rounds: int = 10
    risk_win_threshold: int = 95
    consecutive_success_win: int = 3
    consecutive_block_win: int = 4
    round_delay_s: float = 1.0

    # ── WebSocket ────────────────────────────────────────────────────────────
    ws_max_connections: int = 50


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()