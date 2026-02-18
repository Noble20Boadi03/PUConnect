import app.db.base
from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core import config

settings = config.get_settings()

app = FastAPI(title="PU Connect API")

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to PU Connect API"}
