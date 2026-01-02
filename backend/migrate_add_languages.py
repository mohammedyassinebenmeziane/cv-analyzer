"""
Script de migration pour ajouter la colonne 'languages' à la table 'analyses'
"""
import sqlite3
import os

def migrate():
    db_path = "cv_analysis.db"
    
    if not os.path.exists(db_path):
        print("Base de données non trouvée. Elle sera créée automatiquement au prochain démarrage.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Vérifier si la colonne existe déjà
        cursor.execute("PRAGMA table_info(analyses)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'languages' in columns:
            print("La colonne 'languages' existe déjà. Aucune migration nécessaire.")
        else:
            # Ajouter la colonne languages
            cursor.execute("ALTER TABLE analyses ADD COLUMN languages TEXT")
            conn.commit()
            print("[OK] Colonne 'languages' ajoutee avec succes a la table 'analyses'.")
    except Exception as e:
        print(f"[ERREUR] Erreur lors de la migration: {str(e)}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()

