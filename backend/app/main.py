from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from . import database
from .routes import auth, cv, analysis

# Créer les tables de la base de données
database.Base.metadata.create_all(bind=database.engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    # Startup
    yield
    # Shutdown - nettoyer les ressources
    from .routes.cv import _shared_executor
    if _shared_executor is not None:
        _shared_executor.shutdown(wait=False)  # Ne pas bloquer au shutdown

app = FastAPI(
    title="CV Analysis API",
    description="API pour l'analyse de CV par intelligence artificielle",
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS pour permettre les requêtes depuis le frontend
# Support des URLs multiples (localhost pour dev + Vercel pour production)
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    frontend_url
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex="https://cv-analyzer-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(auth.router)
app.include_router(cv.router)
app.include_router(analysis.router)

@app.get("/")
async def root():
    return {"message": "CV Analysis API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}





