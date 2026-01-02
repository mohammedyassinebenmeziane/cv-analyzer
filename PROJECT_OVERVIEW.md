# 📊 Vue d'ensemble du projet CV Analysis

## 🎯 Objectif du projet

**CV Analysis** est une plateforme web complète d'analyse de CV par intelligence artificielle qui permet aux recruteurs et aux professionnels RH d'évaluer automatiquement la correspondance entre un CV et une description de poste.

### Problème résolu
- Évaluation manuelle longue et subjective des CVs
- Difficulté à identifier rapidement les candidats les plus qualifiés
- Manque de standardisation dans le processus de sélection

### Solution apportée
- Analyse automatique basée sur l'IA
- Score de correspondance objectif (0-100%)
- Extraction structurée des compétences et expériences
- Traitement en masse pour gagner du temps

---

## 🏗️ Architecture actuelle

### Stack technologique

#### Frontend
- **Framework** : React 18
- **Build tool** : Vite
- **Styling** : Tailwind CSS
- **Routing** : React Router DOM v6
- **HTTP Client** : Axios
- **État** : Context API (AuthContext)

#### Backend
- **Framework** : FastAPI (Python 3.11)
- **ORM** : SQLAlchemy
- **Base de données** : SQLite (dev) / PostgreSQL (production)
- **Authentification** : JWT (JSON Web Tokens) + bcrypt
- **Traitement fichiers** : PyPDF2, python-docx
- **Analyse IA** : Algorithmes locaux de similarité sémantique

#### Infrastructure actuelle
- **Développement local** :
  - Frontend : `localhost:3000` (Vite dev server)
  - Backend : `localhost:8000` (Uvicorn)
  - Base de données : Fichier SQLite local
  - Stockage fichiers : Système de fichiers local (`backend/app/uploads/`)

---

## 📁 Structure du projet

```
CV ANALYSIS/
├── backend/                      # API FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Point d'entrée FastAPI
│   │   ├── database.py          # Configuration SQLAlchemy
│   │   ├── models.py            # Modèles de données (User, Analysis)
│   │   ├── schemas.py           # Schémas Pydantic (validation)
│   │   ├── auth.py              # Logique d'authentification
│   │   ├── cv_analyzer.py       # 🧠 Cœur de l'analyse IA
│   │   ├── routes/
│   │   │   ├── auth.py          # Routes: /auth/register, /auth/login
│   │   │   ├── cv.py            # Routes: /cv/upload, /cv/bulk-upload
│   │   │   └── analysis.py      # Routes: /analysis/, /analysis/{id}
│   │   └── uploads/             # Stockage temporaire des CVs
│   ├── requirements.txt         # Dépendances Python
│   ├── cv_analysis.db           # Base de données SQLite
│   └── README.md
│
├── src/                          # Frontend React
│   ├── api/
│   │   └── axios.js             # Configuration Axios + intercepteurs
│   ├── auth/
│   │   ├── AuthContext.jsx      # Contexte d'authentification
│   │   └── PrivateRoute.jsx     # Protection des routes
│   ├── components/
│   │   ├── Navbar.jsx           # Navigation principale
│   │   ├── CandidateProfile.jsx # Affichage du profil structuré
│   │   ├── Loading.jsx          # Composant de chargement
│   │   └── ...
│   ├── pages/
│   │   ├── Dashboard.jsx        # Page d'accueil
│   │   ├── Login.jsx            # Connexion
│   │   ├── Register.jsx         # Inscription
│   │   ├── UploadCV.jsx         # Upload CV simple
│   │   ├── BulkUpload.jsx       # Upload multiple
│   │   ├── History.jsx          # Historique des analyses
│   │   └── Results.jsx          # Résultats détaillés
│   ├── App.jsx                  # Composant racine + routing
│   └── main.jsx                 # Point d'entrée React
│
├── package.json                 # Dépendances Node.js
├── vite.config.js              # Configuration Vite
├── tailwind.config.js          # Configuration Tailwind
└── README.md
```

---

## 🔄 Flux de données

### 1. Authentification
```
User → Frontend (Login/Register)
    → Backend (/auth/login ou /auth/register)
    → Génération JWT Token
    → Stockage token dans localStorage
    → Redirection vers Dashboard
```

### 2. Upload et analyse de CV

#### Upload simple
```
User → UploadCV.jsx
    → Sélection fichier PDF/DOCX + description poste
    → POST /cv/upload (multipart/form-data)
    → Backend:
        ├─ Sauvegarde fichier temporaire
        ├─ Extraction texte (PyPDF2/docx)
        ├─ Analyse CV (cv_analyzer.py)
        │   ├─ Extraction compétences
        │   ├─ Extraction expériences
        │   ├─ Extraction formations
        │   ├─ Calcul score correspondance
        │   └─ Génération recommandations
        ├─ Sauvegarde résultats en DB
        └─ Suppression fichier temporaire
    → Retour analysis_id
    → Redirection → Results.jsx
```

#### Bulk Upload
```
User → BulkUpload.jsx
    → Sélection multiple fichiers (max 10)
    → POST /cv/bulk-upload
    → Backend:
        ├─ Traitement parallèle (asyncio.gather)
        ├─ Analyse chaque CV (même processus)
        └─ Retour liste d'analyses (triée par score)
    → Affichage résultats (table/cartes)
    → Filtrage (score ≥ 70%)
```

### 3. Consultation des résultats
```
User → Results.jsx ou History.jsx
    → GET /analysis/{id}
    → Backend:
        ├─ Récupération analyse depuis DB
        ├─ Recalcul score (si nécessaire)
        └─ Retour données complètes
    → Affichage profil structuré
```

---

## 🧠 Fonctionnalités d'analyse IA

### Extraction de données
1. **Texte brut** : Conversion PDF/DOCX → texte
2. **Identité** : Email, localisation, LinkedIn
3. **Compétences techniques** : Technologies, langages, outils
4. **Expériences professionnelles** :
   - Intitulé poste, entreprise, dates
   - Missions détaillées
   - Durée d'expérience
5. **Formation** : Diplômes, établissements, dates
6. **Langues** : Langues et niveaux
7. **Certifications** : Titres et dates
8. **Soft skills** : Compétences comportementales

### Calcul de score
Le score de correspondance (0-100%) est calculé en combinant :

1. **Similarité sémantique** (35-65% du poids) :
   - Comparaison IA entre résumé CV et description poste
   - Algorithmes locaux optimisés (pas d'appel API externe)

2. **Correspondance de compétences** (20-60% du poids) :
   - Compétences requises vs compétences du CV
   - Matching exact, partiel et sémantique

3. **Pertinence des expériences** (20% du poids) :
   - Expériences alignées avec le poste

4. **Formation et certifications** (10% du poids)

5. **Bonuses/Pénalités** :
   - Bonus si excellente correspondance compétences
   - Pénalités si faible compatibilité globale

---

## 📊 Modèle de données

### Table `users`
```sql
id              INTEGER PRIMARY KEY
email           VARCHAR (unique, indexed)
hashed_password VARCHAR
created_at      TIMESTAMP
```

### Table `analyses`
```sql
id                   INTEGER PRIMARY KEY
user_id              INTEGER (FK → users.id)
cv_filename          VARCHAR
job_description      TEXT
score                FLOAT
missing_skills       TEXT (JSON string)
relevant_experience  TEXT (JSON string)
irrelevant_experience TEXT (JSON string)
recommendations      TEXT (JSON string)
languages            TEXT (JSON string)
candidate_profile    TEXT (JSON string)  -- Profil structuré complet
created_at           TIMESTAMP
```

### Structure `candidate_profile` (JSON)
```json
{
  "identite": {
    "email": "...",
    "localisation": "...",
    "linkedin": "..."
  },
  "resume_professionnel": {
    "resume": "...",
    "domaine": "..."
  },
  "competences_techniques": {
    "Langages": [...],
    "Frameworks": [...],
    "Outils": [...]
  },
  "experiences_professionnelles": [
    {
      "intitule_poste": "...",
      "entreprise": "...",
      "dates": "...",
      "missions": [...]
    }
  ],
  "formation": [
    {
      "diplome": "...",
      "etablissement": "...",
      "dates": "..."
    }
  ],
  "certifications": [...],
  "langues": [...],
  "soft_skills": [...],
  "score_correspondance": 85.5
}
```

---

## 🔌 API Endpoints

### Authentification
- `POST /auth/register` - Inscription
  - Body: `{email, password}`
  - Response: `{access_token, token_type}`

- `POST /auth/login` - Connexion
  - Body: `{email, password}`
  - Response: `{access_token, token_type}`

### CV
- `POST /cv/upload` - Upload CV simple
  - Headers: `Authorization: Bearer {token}`
  - Body: `multipart/form-data` (cv_file, job_description)
  - Response: `{analysis_id}`

- `POST /cv/bulk-upload` - Upload multiple
  - Headers: `Authorization: Bearer {token}`
  - Body: `multipart/form-data` (cv_files[], job_description)
  - Response: `{analyses: [...], total, successful, failed}`

### Analyse
- `GET /analysis/` - Liste des analyses
  - Headers: `Authorization: Bearer {token}`
  - Response: `[{id, cv_filename, score, created_at}, ...]`

- `GET /analysis/{id}` - Détails d'une analyse
  - Headers: `Authorization: Bearer {token}`
  - Response: `{id, score, missing_skills, relevant_experience, candidate_profile, ...}`

---

## 🎨 Interface utilisateur

### Pages principales

1. **Dashboard** (`/`)
   - Vue d'ensemble avec cartes d'action
   - Liens vers Upload, Bulk Upload, Historique
   - Affichage des fonctionnalités

2. **Login/Register** (`/login`, `/register`)
   - Formulaires d'authentification
   - Validation en temps réel

3. **Upload CV** (`/upload`)
   - Zone drag & drop
   - Champ description de poste
   - Validation fichiers (PDF, DOCX, max 10MB)

4. **Bulk Upload** (`/bulk-upload`)
   - Upload multiple (max 10 fichiers)
   - Filtrage par score (≥ 70%)
   - Vue cartes ou tableau
   - Tri par score

5. **Historique** (`/history`)
   - Liste de toutes les analyses
   - Affichage en cartes
   - Navigation vers détails

6. **Résultats** (`/results/{id}`)
   - Score de correspondance (gradient animé)
   - Profil candidat structuré
   - Compétences, expériences, formations
   - Recommandations

### Design
- **Style** : Moderne, cartes avec ombres et gradients
- **Couleurs** : Palette bleu/indigo/purple
- **Responsive** : Adapté mobile, tablette, desktop
- **Animations** : Transitions fluides, hover effects

---

## 🚀 Performance et optimisations

### Backend
- **ThreadPoolExecutor partagé** : Réutilisation pour analyses parallèles
- **Semaphore** : Limite 3 analyses simultanées
- **Mode rapide** : Algorithmes locaux (pas d'appel API externe)
- **SQLite WAL mode** : Amélioration performances concurrentes
- **Gestion sessions DB** : Fermeture explicite, pas de leaks

### Frontend
- **Code splitting** : Lazy loading des routes
- **Optimisation images** : SVG pour icônes
- **Cache Axios** : Réutilisation connexions HTTP

---

## 🔒 Sécurité

### Authentification
- **JWT** : Tokens signés avec secret
- **bcrypt** : Hashage passwords (salt rounds 12)
- **Expiration tokens** : 30 minutes (configurable)

### Validation
- **Pydantic** : Validation automatique des données
- **File validation** : Type et taille de fichiers
- **SQL injection** : Protection via SQLAlchemy ORM

### CORS
- Origines autorisées : localhost (dev) + domaines production

---

## 📈 Métriques et statistiques

### Utilisation actuelle
- Analyse d'un CV : ~5-10 secondes
- Bulk upload (10 CVs) : ~30-60 secondes
- Score de correspondance : 0-100%
- Formats supportés : PDF, DOCX

### Limites
- Taille fichier max : 10MB
- Bulk upload max : 10 fichiers
- Analyses simultanées : 3 maximum

---

## 🔄 Migration vers Azure (objectif)

### Services cibles
1. **Azure App Service** : Hébergement frontend + backend
2. **Azure Blob Storage** : Stockage des CVs
3. **Azure Queue Storage** : Jobs d'analyse
4. **Azure Functions** : Traitement serverless
5. **Azure Document Intelligence** : OCR + extraction
6. **Azure Cosmos DB** : Base de données NoSQL

### Avantages
- **Scalabilité** : Auto-scaling selon la charge
- **Disponibilité** : SLA 99.95%
- **Performance** : CDN pour frontend
- **Coûts** : Pay-as-you-go
- **Maintenance** : Services managés

Voir `AZURE_DEPLOYMENT_GUIDE.md` pour le guide complet de migration.

---

## 🛠️ Développement local

### Prérequis
- Python 3.11+
- Node.js 18+
- pip, npm

### Installation
```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Frontend
cd ..
npm install
```

### Démarrage
```bash
# Backend (port 8000)
cd backend
uvicorn app.main:app --reload

# Frontend (port 3000)
npm run dev
```

### Tests
- API docs : http://localhost:8000/docs
- Frontend : http://localhost:3000

---

## 📝 Notes importantes

### Fichiers générés
- `backend/cv_analysis.db` : Base de données SQLite
- `backend/cv_analysis.db-wal` : Fichier WAL (temporaire)
- `backend/cv_analysis.db-shm` : Fichier shared memory (temporaire)
- `backend/app/uploads/*.pdf` : Fichiers CV uploadés (temporaires)

### Fichiers ignorés (.gitignore)
- `__pycache__/`, `*.pyc` : Fichiers Python compilés
- `*.db-wal`, `*.db-shm` : Fichiers SQLite temporaires
- `backend/app/uploads/*` : Fichiers uploadés
- `node_modules/`, `venv/` : Dépendances

---

## 🎯 Prochaines étapes

1. ✅ **Fonctionnel** : Analyse de CV, scoring, bulk upload
2. ✅ **Interface** : Dashboard moderne, historique, résultats
3. 🔄 **En cours** : Migration vers Azure
4. ⏳ **À venir** :
   - Export PDF des résultats
   - Intégration LinkedIn
   - API publique
   - Dashboard analytics
   - Notifications email

---

**Dernière mise à jour** : 2024

