# ⚔ Imperium AI — Interactive AI Red Teaming Battle Simulator

> formerly **Imperium AI**

Imperium AI is a real-time browser-based simulator where five adversarial AI agents attack a simulated smart-home IoT system. Every attack flows through Groq / Gemini / OpenAI / DeepSeek (or a deterministic offline simulator), a policy engine, and a risk scorer — all visualised live with WebSockets, Three.js, and Framer Motion.

> **Diploma project:** *Development of an AI-Based Red Teaming Framework for Testing LLMs Integrated into Smart Home and IoT Systems*
> Разработка фреймворка красной команды на основе ИИ для тестирования больших языковых моделей (LLM), интегрированных в системы умного дома и Интернета вещей.

## Quick links

* 🚀 **Deploy on Render:** [`DEPLOY_RENDER.md`](./DEPLOY_RENDER.md) — one-click Blueprint via [`render.yaml`](./render.yaml).
* 🐳 **Local Docker:** `docker compose up --build`  (FastAPI + PostgreSQL + Next.js).
* 🛠️ **Local dev (no Docker):** `cd backend && uvicorn main:app --reload` + `cd frontend && npm run dev`.

---

## Architecture

```
┌──────────────────────────────┐     WebSocket / REST      ┌──────────────────────────────┐
│  Frontend  (Next.js + React) │◄─────────────────────────►│  Backend (FastAPI + Python)  │
│                              │                            │                              │
│  pages/index.jsx             │                            │  main.py                     │
│  pages/battle.jsx            │                            │  agents/  (5 red-team agents)│
│  pages/dashboard.jsx         │                            │  llm/multi_client.py         │
│  pages/batch.jsx             │                            │  iot/simulator.py            │
│  components/SmartHome3D.jsx  │                            │  security/policy_engine.py   │
│  components/RiskMeter.jsx    │                            │  scoring/risk_engine.py      │
│  components/LiveLogs.jsx     │                            │  memory/attack_memory.py     │
│  components/AgentAvatar.jsx  │                            │  websocket_manager.py        │
│  components/BattleResult.jsx │                            │                              │
└──────────────────────────────┘                            └──────────────────────────────┘
```

### Red Team Agents

| Agent | Colour | Speciality | Tactics |
|---|---|---|---|
| **ShadowInjector** | 🔴 Red | Prompt injection | direct_injection, nested_injection, instruction_override, delimiter_confusion, **chain_of_thought_exploit** |
| **ContextPhantom** | 🟣 Purple | Context & role manipulation | context_hijack, role_confusion, memory_poisoning, false_authority |
| **PrivilegeReaper** | 🟠 Orange | Privilege escalation & token forgery | admin_impersonation, token_forgery, sudo_injection, permission_bypass, **multi_step_attack** |
| **SilentEscalator** | 🔵 Cyan | Stealthy incremental boundary erosion | incremental_trust, semantic_drift, boundary_erosion, context_normalization, **jailbreak_roleplay** |
| **NetworkPhantom** | 🟢 Green | Network-layer MITM & traffic injection | dns_spoofing, mitm_interception, traffic_injection, packet_sniffing, **arp_poisoning** |

### IoT Devices simulated
`front_door` · `camera_system` · `lights` · `thermostat` · `security_panel` · `alarm` · `router`

---

## Quick Start

### 1 — Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt

# Copy env and add your Gemini API key (optional — demo mode works without one)
cp .env.example .env

uvicorn main:app --reload --port 8000
```

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

### 3 — Run a battle

1. Open **http://localhost:3000**
2. Click **START BATTLE**
3. Watch the five red-team agents attack the smart home in real time
4. Use **🛡 RAISE SHIELD** to block the next 3 attacks interactively
5. Use **🔄 COUNTERMEASURES** to reduce the risk score
6. View analytics at **http://localhost:3000/dashboard**
7. Run statistical batch tests at **http://localhost:3000/batch**
8. Try natural-language smart-home control at **http://localhost:3000/iot-lab**

---

## WebSocket Events

| Event | Description |
|---|---|
| `attack_launched` | Agent selects a target and tactic |
| `llm_response` | LLM returns its decision |
| `policy_check` | Policy engine evaluates violations |
| `iot_result` | IoT device state updated or blocked |
| `risk_update` | Global risk score changed |
| `round_complete` | Round summary |
| `battle_end` | Battle over with winner, stats, and agent learning summary |
| `shield_activated` | Defense shield raised (blocks next 3 attacks) |
| `shield_active` | Shield still active — rounds remaining |
| `shield_expired` | Shield has run out |
| `log` | Colour-coded log message |

---

## Interactive Defense Controls

During a live battle you can intervene:

| Button | Endpoint | Effect |
|---|---|---|
| 🛡 RAISE SHIELD | `POST /api/defense/shield` | Forces next 3 attacks to be blocked by the policy engine |
| 🔄 COUNTERMEASURES | `POST /api/defense/reset-risk` | Deploys emergency countermeasures — reduces risk score by 20 pts |

---

## Batch Battles (Statistical Testing)

`POST /api/batch-battles` — runs N independent simulations (1–10) in a single request and returns per-battle stats plus aggregate summary. Use the **Batch Test** page to visualise results with charts.

---

## Data Persistence

Attack learning history is persisted in SQLite (`backend/data/attack_memory.db`). Agents adapt their tactic selection based on historical success rates — tactics blocked 3+ consecutive times are avoided. This persists across restarts.

---

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key (optional — falls back to simulation) |
| `OPENAI_API_KEY` | OpenAI GPT-4o API key (optional) |
| `DEEPSEEK_API_KEY` | DeepSeek API key (optional) |

---

## Tech Stack

**Backend:** Python · FastAPI · uvicorn · google-generativeai · openai · pydantic · python-dotenv · SQLite

**Frontend:** Next.js 14 · React 18 · Three.js · @react-three/fiber · @react-three/drei · Framer Motion · Recharts · Tailwind CSS
