"""
Script de migration pour ajouter la colonne 'candidate_profile' a la table 'analyses'
"""
import sqlite3
import os

def migrate():
    db_path = "cv_analysis.db"
    
    if not os.path.exists(db_path):
        print("Base de donnees non trouvee. Elle sera creee automatiquement au prochain demarrage.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Verifier si la colonne existe deja
        cursor.execute("PRAGMA table_info(analyses)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'candidate_profile' in columns:
            print("La colonne 'candidate_profile' existe deja. Aucune migration necessaire.")
        else:
            # Ajouter la colonne candidate_profile
            cursor.execute("ALTER TABLE analyses ADD COLUMN candidate_profile TEXT")
            conn.commit()
            print("[OK] Colonne 'candidate_profile' ajoutee avec succes a la table 'analyses'.")
    except Exception as e:
        print(f"[ERREUR] Erreur lors de la migration: {str(e)}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()




