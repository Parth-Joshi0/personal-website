"""Difficulty tiers exposed to the frontend, mapped to a UCI `movetime` budget.

"expert" gives the engine its full quoted strength (~1800-2000 Elo per its own
README); the others just shrink the time budget so casual visitors don't get
stomped on move one.
"""

DIFFICULTY_MAP = {
    "beginner": {"movetime_ms": 200},
    "casual": {"movetime_ms": 600},
    "club": {"movetime_ms": 1500},
    "expert": {"movetime_ms": 3000},
}

DEFAULT_DIFFICULTY = "club"
