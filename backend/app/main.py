from fastapi import FastAPI
from app.api.routes import router
from app.core.config import settings
from app.db.init_db import init_db

app = FastAPI(title=settings.APP_NAME)


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "Bienvenue sur l'API de collecte des données généalogiques",
        "docs": "/docs",
    }
