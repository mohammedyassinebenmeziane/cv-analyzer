# Guide de Démarrage Rapide - Backend

## Étapes pour démarrer le backend

### 1. Installer Python
Assurez-vous d'avoir Python 3.8 ou supérieur installé.

### 2. Créer un environnement virtuel
```bash
cd backend
python -m venv venv
```

### 3. Activer l'environnement virtuel

**Sur Windows :**
```bash
venv\Scripts\activate
```

**Sur Linux/Mac :**
```bash
source venv/bin/activate
```

### 4. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 5. Créer le fichier .env
Créez un fichier `.env` dans le dossier `backend` avec le contenu suivant :
```env
SECRET_KEY=votre-cle-secrete-tres-longue-et-aleatoire-changez-en-production
DATABASE_URL=sqlite:///./cv_analysis.db
```

**Pour générer une clé secrète sécurisée :**
```python
import secrets
print(secrets.token_urlsafe(32))
```

### 6. Démarrer le serveur

**Option 1 : Utiliser le script de démarrage**
- Sur Windows : double-cliquez sur `start.bat`
- Sur Linux/Mac : `chmod +x start.sh && ./start.sh`

**Option 2 : Commande manuelle**
```bash
uvicorn app.main:app --reload --port 8000
```

### 7. Vérifier que le serveur fonctionne
Ouvrez votre navigateur et allez sur :
- `http://localhost:8000` - Page d'accueil de l'API
- `http://localhost:8000/docs` - Documentation interactive Swagger
- `http://localhost:8000/redoc` - Documentation alternative

## Test rapide

Une fois le serveur démarré, vous pouvez tester l'API avec :

1. **Inscription** : `POST http://localhost:8000/auth/register`
   ```json
   {
     "email": "test@example.com",
     "password": "test123"
   }
   ```

2. **Connexion** : `POST http://localhost:8000/auth/login`
   ```json
   {
     "email": "test@example.com",
     "password": "test123"
   }
   ```

## Dépannage

### Erreur "Module not found"
- Vérifiez que vous avez activé l'environnement virtuel
- Réinstallez les dépendances : `pip install -r requirements.txt`

### Erreur de port déjà utilisé
- Changez le port dans la commande : `--port 8001`
- Ou arrêtez le processus qui utilise le port 8000

### Erreur de base de données
- Supprimez le fichier `cv_analysis.db` s'il existe et relancez le serveur
- Les tables seront recréées automatiquement

## Prochaines étapes

Une fois le backend démarré, vous pouvez :
1. Lancer le frontend (dans un autre terminal)
2. Tester l'application complète
3. Consulter la documentation complète dans `README.md`





