# Backend CV Analysis API

API FastAPI pour l'analyse de CV par intelligence artificielle.

## Installation

1. Créer un environnement virtuel Python :
```bash
python -m venv venv
```

2. Activer l'environnement virtuel :
- Sur Windows :
```bash
venv\Scripts\activate
```
- Sur Linux/Mac :
```bash
source venv/bin/activate
```

3. Installer les dépendances :
```bash
pip install -r requirements.txt
```

## Configuration

1. Créer un fichier `.env` à la racine du dossier `backend` :
```env
SECRET_KEY=votre-cle-secrete-tres-longue-et-aleatoire
DATABASE_URL=sqlite:///./cv_analysis.db
HUGGINGFACE_API_KEY=votre_cle_api_huggingface_optional
```

**Note sur Hugging Face API :**
- La clé API Hugging Face (`HUGGINGFACE_API_KEY`) est **optionnelle**
- Sans clé API, l'application fonctionne toujours mais avec des limites (30 000 requêtes/mois)
- Avec une clé API gratuite, vous obtenez plus de requêtes et de meilleures performances
- Pour obtenir une clé gratuite : https://huggingface.co/settings/tokens
- L'application utilise le modèle `sentence-transformers/all-MiniLM-L6-v2` pour l'analyse sémantique

Pour générer une clé secrète, vous pouvez utiliser :
```python
import secrets
print(secrets.token_urlsafe(32))
```

## Lancement

Pour lancer le serveur de développement :

```bash
uvicorn app.main:app --reload --port 8000
```

L'API sera accessible sur `http://localhost:8000`

## Documentation

Une fois le serveur lancé, vous pouvez accéder à :
- Documentation interactive : `http://localhost:8000/docs`
- Documentation alternative : `http://localhost:8000/redoc`

## Endpoints

### Authentification

- `POST /auth/register` - Inscription d'un nouvel utilisateur
- `POST /auth/login` - Connexion (retourne un token JWT)

### CV

- `POST /cv/upload` - Upload et analyse d'un CV
  - Body : `multipart/form-data`
    - `cv_file` : fichier PDF ou DOCX
    - `job_description` : description du poste (texte)

### Analyse

- `GET /analysis/{analysis_id}` - Récupérer les résultats d'une analyse

## Structure du projet

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # Application FastAPI principale
│   ├── database.py      # Configuration de la base de données
│   ├── models.py        # Modèles SQLAlchemy
│   ├── schemas.py       # Schémas Pydantic
│   ├── auth.py          # Fonctions d'authentification
│   ├── cv_analyzer.py   # Service d'analyse de CV
│   └── routes/
│       ├── __init__.py
│       ├── auth.py      # Routes d'authentification
│       ├── cv.py        # Routes pour l'upload de CV
│       └── analysis.py  # Routes pour récupérer les analyses
├── requirements.txt
├── README.md
└── .env                 # Variables d'environnement (à créer)
```

## Base de données

Par défaut, l'application utilise SQLite pour le développement. Les tables sont créées automatiquement au premier lancement.

Pour utiliser PostgreSQL en production, modifiez `DATABASE_URL` dans le fichier `.env` :
```env
DATABASE_URL=postgresql://user:password@localhost/cv_analysis
```

## Notes

- Les fichiers uploadés sont temporaires et supprimés après l'analyse
- Le système d'analyse est basique et peut être amélioré avec des modèles d'IA plus avancés
- Pour la production, configurez une base de données PostgreSQL et utilisez des variables d'environnement sécurisées


