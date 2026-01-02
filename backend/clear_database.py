"""
Script pour supprimer toutes les données de la base de données
"""
from app.database import SessionLocal, engine
from app.models import User, Analysis

def clear_all_data():
    """Supprime toutes les données des tables"""
    db = SessionLocal()
    try:
        # Supprimer toutes les analyses
        deleted_analyses = db.query(Analysis).delete()
        print(f"[OK] {deleted_analyses} analyses supprimees")
        
        # Supprimer tous les utilisateurs
        deleted_users = db.query(User).delete()
        print(f"[OK] {deleted_users} utilisateurs supprimes")
        
        # Commit les changements
        db.commit()
        print("\n[OK] Toutes les donnees ont ete supprimees avec succes!")
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Erreur lors de la suppression: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Suppression de toutes les donnees de la base de donnees...")
    print("-" * 50)
    clear_all_data()

