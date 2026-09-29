from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    resp = client.get("/api/chess/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_move_opening():
    resp = client.post("/api/chess/move", json={"moves": [], "difficulty": "beginner"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["bestmove"] is not None
    assert body["info"]["depth"] >= 1


def test_move_illegal():
    resp = client.post(
        "/api/chess/move", json={"moves": ["e2e5"], "difficulty": "beginner"}
    )
    assert resp.status_code == 400
    body = resp.json()
    assert body["error"] == "illegal_move"
    assert body["rejected"] == ["e2e5"]
