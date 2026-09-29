export type Difficulty = "beginner" | "casual" | "club" | "expert";

export interface EngineInfo {
  depth: number;
  seldepth: number;
  score_cp: number | null;
  score_mate: number | null;
  nodes: number;
  nps: number;
  time_ms: number;
  pv: string[];
}

export interface EngineMoveResult {
  bestmove: string | null;
  reason?: string | null;
  info?: EngineInfo | null;
}

export class ChessApiError extends Error {
  constructor(public kind: "illegal_move" | "timeout" | "crashed" | "network", public rejected?: string[]) {
    super(kind);
  }
}

const API_BASE =
  import.meta.env.PUBLIC_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:8000" : "https://api.parth-joshi0.com");

export async function prewarmEngine(): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  try {
    await fetch(`${API_BASE}/api/chess/health`, { signal: controller.signal });
  } catch {
    // Best-effort only: if this fails, the first real move request will just eat
    // the cold-start latency itself.
  } finally {
    clearTimeout(timeout);
  }
}

export async function getEngineMove(
  moves: string[],
  difficulty: Difficulty
): Promise<EngineMoveResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/chess/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moves, difficulty }),
      signal: controller.signal,
    });
  } catch {
    throw new ChessApiError("network");
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 400) {
    const body = await response.json();
    throw new ChessApiError("illegal_move", body.rejected);
  }
  if (response.status === 504) {
    throw new ChessApiError("timeout");
  }
  if (response.status === 502) {
    throw new ChessApiError("crashed");
  }
  if (!response.ok) {
    throw new ChessApiError("network");
  }

  return response.json();
}
