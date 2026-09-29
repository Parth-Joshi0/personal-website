# parth-joshi0.com

Personal portfolio site for Parth Joshi — a chalkboard-themed showcase of his
projects, with a real, playable chess engine at its center.

## Structure

- `frontend/` — Astro + Tailwind + React (chess island only). Deploys to Cloudflare
  Pages.
- `backend/` — FastAPI service that shells out to the vendored `chess-game-engine`
  repo's `uci.py` over stdin/stdout to answer each move. Deploys to Render.
- `docs/deployment.md` — full deployment + local dev instructions.

## Quick start

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
cp .env.example .env
npm run dev
```

Then open http://localhost:4321.

See [docs/deployment.md](docs/deployment.md) for the full deployment guide.
