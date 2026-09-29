# Deployment

Two independently deployed halves, both behind `parth-joshi0.com` (registered on Cloudflare):

- **Frontend** (`frontend/`, Astro): Cloudflare Pages, serving the apex domain.
- **Backend** (`backend/`, FastAPI): Render free web service, serving `api.parth-joshi0.com`.

## Backend — Render

1. New **Web Service** on Render, connect this GitHub repo.
2. Root directory: `backend`.
3. **Enable Git submodules** in the service's build settings (the chess engine is vendored as a submodule at `backend/vendor/chess-game-engine`).
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Once deployed, add a custom domain in Render's dashboard: `api.parth-joshi0.com`. Render gives you a CNAME target (`<something>.onrender.com`).
7. On Cloudflare DNS for `parth-joshi0.com`, add:
   - `CNAME api → <render-target>.onrender.com`, proxy status **DNS only** (grey cloud) at first, so Render can issue its TLS cert. Switch to **Proxied** (orange cloud) afterward if you want Cloudflare's edge/DDoS protection in front of it too — verify the cert still resolves after switching.

Render's free tier sleeps the service after 15 minutes idle; the next request wakes it in ~30-60s. The frontend fires a pre-warm `GET /api/chess/health` call when the chess page mounts to absorb this before the visitor's first move. If cold starts prove annoying in practice, Render's paid Starter tier (~$7/mo) removes the sleep — no code changes needed to switch.

## Frontend — Cloudflare Pages

1. New Pages project, connect this GitHub repo.
2. Root directory: `frontend`.
3. Framework preset: **Astro**. Build command: `npm run build`. Output directory: `dist`.
4. Environment variable: `PUBLIC_API_BASE_URL=https://api.parth-joshi0.com`.
5. In the Pages project's **Custom domains** tab, attach `parth-joshi0.com` and `www.parth-joshi0.com` — since the domain is already on Cloudflare, this manages the apex/CNAME records automatically.

## CORS

`backend/app/main.py` allows `https://parth-joshi0.com`, `https://www.parth-joshi0.com`, any `*.pages.dev` preview deployment, and `http://localhost:4321` for local dev. Update the regex there if the domain or preview setup changes.

## Local development

```bash
# backend
cd backend
git submodule update --init --recursive
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn app.main:app --reload --port 8000

# frontend (separate terminal)
cd frontend
npm install
cp .env.example .env   # set PUBLIC_API_BASE_URL=http://localhost:8000
npm run dev
```
