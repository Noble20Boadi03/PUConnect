import app.db.base
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core import config

settings = config.get_settings()

app = FastAPI(title="PU Connect API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://10.234.34.10"],  # Added phone IP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to PU Connect API"}
