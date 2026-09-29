from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.chess_routes import router as chess_router

app = FastAPI(title="parth-joshi0.com API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://(www\.)?parth-joshi0\.com|https://.*\.pages\.dev|http://localhost:4321",
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(chess_router)
