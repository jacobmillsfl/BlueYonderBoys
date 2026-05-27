import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.routers import auth, bio, links, motto, photos, shows
from app.migrate import migrate_schema
from app.seed import seed_database

app = FastAPI(title="Blue Yonder Boys API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(bio.router)
app.include_router(motto.router)
app.include_router(shows.router)
app.include_router(links.router)
app.include_router(photos.router)


@app.on_event("startup")
def on_startup():
    settings = get_settings()
    os.makedirs(settings.database_dir, exist_ok=True)
    os.makedirs(settings.uploads_dir, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    migrate_schema(engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/")
def health():
    return {"status": "ok"}
