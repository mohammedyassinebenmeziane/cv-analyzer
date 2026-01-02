from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# URL de la base de données (SQLite par défaut pour le développement)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cv_analysis.db")

# Configuration pour éviter les blocages
connect_args = {}
pool_config = {}

if "sqlite" in DATABASE_URL:
    # Configuration spécifique pour SQLite
    connect_args = {
        "check_same_thread": False,
        "timeout": 10.0  # Timeout réduit à 10 secondes pour éviter les blocages
    }
    # SQLite utilise NullPool par défaut, mais on peut configurer un pool
    # pour améliorer les performances avec plusieurs requêtes
    pool_config = {
        "poolclass": None,  # NullPool pour SQLite (pas de pool)
        "pool_pre_ping": False,  # Pas nécessaire pour SQLite
    }
else:
    # Configuration pour PostgreSQL/MySQL (production)
    pool_config = {
        "pool_size": 5,  # Nombre de connexions maintenues dans le pool
        "max_overflow": 10,  # Nombre maximum de connexions supplémentaires
        "pool_timeout": 30,  # Timeout en secondes pour obtenir une connexion du pool
        "pool_recycle": 3600,  # Recycler les connexions après 1 heure
        "pool_pre_ping": True,  # Vérifier que les connexions sont vivantes avant utilisation
    }

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    **pool_config
)

# Pour SQLite, activer WAL mode pour améliorer les performances concurrentes
if "sqlite" in DATABASE_URL:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        """Active le mode WAL pour SQLite afin d'améliorer les performances concurrentes"""
        cursor = dbapi_conn.cursor()
        try:
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA synchronous=NORMAL")
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA busy_timeout=10000")  # 10 secondes de timeout pour les verrous
            cursor.execute("PRAGMA wal_autocheckpoint=1000")  # Optimiser les checkpoints WAL
        except Exception as e:
            print(f"Erreur lors de la configuration SQLite: {e}")
        finally:
            cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Générateur de session de base de données avec gestion automatique de la fermeture"""
    db = SessionLocal()
    try:
        yield db
        # NE PAS faire de commit automatique - laisser les routes gérer leurs propres commits
    except Exception:
        # En cas d'erreur, faire un rollback avant de fermer
        db.rollback()
        raise
    finally:
        # Fermer la session de manière explicite
        db.close()




