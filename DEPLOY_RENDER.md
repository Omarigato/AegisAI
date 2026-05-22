# Deploy Imperium AI to Render

End-to-end guide for running Imperium AI on **Render.com**, using your existing
Aiven PostgreSQL as the database.

The repo ships with a [`render.yaml`](./render.yaml) **Blueprint** so you can
spin up both services (FastAPI backend + Next.js frontend) with a single click.

---

## 0. Prerequisites

* GitHub account hosting this repo (push your latest commits first).
* Render account → <https://render.com> (free tier is enough for a demo).
* PostgreSQL connection string. You already have one from Aiven, in the form:
  ```
  postgres://avnadmin:AVNS_xxxxxxxx@pg-xxxx-NAME-NNNN.X.aivencloud.com:NNNNN/defaultdb?sslmode=require
  ```
* (Optional) any LLM API keys you want to use (Groq / Gemini / OpenAI / DeepSeek
  / OpenRouter). Without keys the backend runs in deterministic **Simulation**
  mode, which is enough for a demo.

---

## 1. Create the services from the Blueprint

1. In Render: **New → Blueprint**.
2. Connect this GitHub repo, select the `main` branch.
3. Render reads `render.yaml` and shows a preview of two services:
   * `imperium-ai-backend` (Python web service)
   * `imperium-ai-frontend` (Node web service)
4. Click **Apply**. Both services start building.

> Render will assign each service a public hostname:
>
>   * Backend  → `https://imperium-ai-backend.onrender.com`
>   * Frontend → `https://imperium-ai-frontend.onrender.com`
>
> If the names are taken, Render appends a random suffix. Note your real URLs —
> you'll paste them in the env vars below.

The first build will fail / 502 until you fill in the secrets in step 2.

---

## 2. Configure the **backend** environment

Open the `imperium-ai-backend` service → **Environment** tab → **Add Environment
Variable**.

| Key                          | Value                                                                                                                          | Required |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------|---------|
| `DATABASE_URL`               | Your full Aiven URI, e.g. `postgres://avnadmin:PASS@HOST:10912/defaultdb?sslmode=require`                                      | ✅      |
| `ALLOWED_ORIGINS`            | The full URL of your frontend on Render, e.g. `https://imperium-ai-frontend.onrender.com`                                      | ✅      |
| `ALLOWED_ORIGIN_REGEX`       | *(optional)* For preview deploys: `^https://imperium-ai-frontend(-[a-z0-9]+)?\.onrender\.com$`                                 | ⬜      |
| `GROQ_API_KEY`               | *(optional)* free key from <https://console.groq.com>                                                                          | ⬜      |
| `GEMINI_API_KEY`             | *(optional)* free key from <https://aistudio.google.com>                                                                       | ⬜      |
| `OPENROUTER_API_KEY`         | *(optional)* free key from <https://openrouter.ai>                                                                             | ⬜      |
| `OPENAI_API_KEY`             | *(optional)* paid                                                                                                              | ⬜      |
| `DEEPSEEK_API_KEY`           | *(optional)* paid                                                                                                              | ⬜      |

Click **Save Changes** → the service redeploys automatically.

### How to verify the backend
Open `https://imperium-ai-backend.onrender.com/health` — should return:
```json
{ "status": "ok", "version": "2.0.0", "llm": "simulation", "ws_connections": 0 }
```
And `https://imperium-ai-backend.onrender.com/docs` — interactive Swagger UI
with every API route.

In the live logs you should see:
```
INFO  | app.memory.attack_memory | AttackMemory bound to: postgresql+psycopg://***@host:port/defaultdb?sslmode=require
INFO  | imperiumai                  | 🚀 ImperiumAI 2.0.0 started — LLM: simulation
```

If you instead see `Falling back to local SQLite at data/attack_memory.db` —
double-check `DATABASE_URL` (host typo / port / `?sslmode=require` missing /
Aiven service paused).

---

## 3. Configure the **frontend** environment

Open `imperium-ai-frontend` service → **Environment** tab.

| Key                   | Value                                                                            | Required |
|-----------------------|----------------------------------------------------------------------------------|---------|
| `NEXT_PUBLIC_API_URL` | The **full URL** of the backend, e.g. `https://imperium-ai-backend.onrender.com` | ✅      |

Click **Save Changes**. The frontend rebuilds (this can take 2–5 min).

> ⚠️ It's `NEXT_PUBLIC_API_URL`, not `API_URL`. Anything baked into the page at
> build time must be prefixed with `NEXT_PUBLIC_` so Next.js ships it to the
> browser.

### How to verify the frontend
Open `https://imperium-ai-frontend.onrender.com`.

Check in DevTools → Network:
* `GET /api/llm/status` → `200`
* WebSocket upgrade `wss://imperium-ai-backend.onrender.com/ws` → `101`

Click **Start Battle** — you should see attack rounds streaming in real time.

---

## 4. Common issues & fixes

| Symptom                                                            | Cause / fix                                                                                                                                                                                                                          |
|--------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Frontend shows `Loading 3D scene…` forever / `ChunkLoadError`      | Hard reload (Ctrl+Shift+R) — Render's CDN is caching an old chunk hash. The page auto-reloads on first hit, you may need to refresh once.                                                                                            |
| Battle page can't connect (`Reconnecting…`)                        | `NEXT_PUBLIC_API_URL` has a typo, missing scheme, or the backend is sleeping (free tier). Open the backend's `/health` URL in another tab to wake it up, then refresh the frontend.                                                  |
| `CORS error: blocked by policy`                                    | Backend `ALLOWED_ORIGINS` doesn't list the exact frontend origin (with `https://`, no trailing slash). Update it in the dashboard and let the backend redeploy.                                                                       |
| `failed to resolve host …aivencloud.com`                          | Aiven service is suspended or the URL is wrong. Log into <https://console.aiven.io>, hit **Power on**, copy the fresh **Service URI** (it's a 5-digit port like `:10912`, never `:5432`), update `DATABASE_URL` in Render.            |
| Backend crashes on first request after idle                        | Free tier — first hit after 15 min idle takes 30–60 s to boot. Subsequent requests are instant.                                                                                                                                       |
| Want a custom domain                                               | Render → service → **Settings → Custom Domain** → add `imperium-ai.<yourdomain>`. Then add that origin to `ALLOWED_ORIGINS` and update `NEXT_PUBLIC_API_URL` to point at the backend's custom domain.                                  |

---

## 5. After-deploy smoke test

From your laptop:

```powershell
$BACKEND="https://imperium-ai-backend.onrender.com"

# 1. health
curl "$BACKEND/health"

# 2. agents + devices visible
curl "$BACKEND/api/status" | python -m json.tool

# 3. memory empty
curl "$BACKEND/api/memory" | python -m json.tool

# 4. simulate a battle
curl -X POST "$BACKEND/api/start-simulation"
sleep 15
curl "$BACKEND/api/memory" | python -m json.tool   # total_attacks > 0
```

Then open the frontend in a browser:

* Home page renders, "Imperium AI" badge, hero scene plays.
* `/agents`, `/attacks`, `/dashboard`, `/team`, `/documentation` all load.
* Language switcher (EN/RU/KZ) works on every page.
* Theme switcher (Dark/Light/B-W) repaints all pages.
* `/battle` connects via WebSocket and animates rounds.

---

## 6. Updating the deployment

Just push to `main`:

```bash
git add .
git commit -m "feat: …"
git push origin main
```

Both services auto-deploy (`autoDeploy: true` in `render.yaml`).
The backend rebuild takes ~2 min, the frontend ~3–5 min.
