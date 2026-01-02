# ⚡ Déploiement Azure Rapide - CV Analysis

Guide rapide et efficace pour déployer l'application sur Azure avec un minimum de modifications.

## 🎯 Approche : MVP d'abord, amélioration ensuite

**Stratégie en 2 phases :**
1. **Phase 1 (MVP - 2-3h)** : Déployer l'app actuelle avec minimum de changements
2. **Phase 2 (Optimisation - optionnel)** : Migrer vers architecture cloud-native complète

---

## 🚀 Phase 1 : Déploiement MVP (Minimum Viable Product)

### Objectif
Déployer l'application **telle qu'elle est** sur Azure avec un minimum de modifications.

### Services utilisés (simplifié)
- ✅ **Azure App Service** : Backend FastAPI + Frontend React
- ✅ **Azure Database for PostgreSQL** : Remplace SQLite (plus simple que Cosmos DB)
- ✅ **Azure Storage Account** : Stockage des fichiers CV (optionnel, peut rester local temporairement)

### Avantages
- ✅ Migration rapide (2-3h)
- ✅ Code existant fonctionne presque tel quel
- ✅ Coût réduit (~30-50€/mois)
- ✅ Test en production rapidement

---

## 📋 Étapes rapides

### Étape 1 : Créer les ressources Azure (10 min)

```powershell
# Se connecter à Azure
az login

# Variables
$RESOURCE_GROUP = "cv-analysis-rg"
$LOCATION = "francecentral"
$BACKEND_APP = "cv-analysis-api-$(Get-Random)"
$FRONTEND_APP = "cv-analysis-web-$(Get-Random)"
$DB_SERVER = "cv-analysis-db-$(Get-Random)"
$DB_NAME = "cvanalysis"
$DB_USER = "cvadmin"
$DB_PASSWORD = "VotreMotDePasse123!"  # Changez-le !

# Créer le groupe de ressources
az group create --name $RESOURCE_GROUP --location $LOCATION

# Créer PostgreSQL (plus simple que Cosmos DB)
az postgres flexible-server create `
    --resource-group $RESOURCE_GROUP `
    --name $DB_SERVER `
    --location $LOCATION `
    --admin-user $DB_USER `
    --admin-password $DB_PASSWORD `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --version 14 `
    --storage-size 32

# Créer la base de données
az postgres flexible-server db create `
    --resource-group $RESOURCE_GROUP `
    --server-name $DB_SERVER `
    --database-name $DB_NAME

# Créer App Service Plan (Linux)
az appservice plan create `
    --resource-group $RESOURCE_GROUP `
    --name "cv-analysis-plan" `
    --location $LOCATION `
    --sku B1 `
    --is-linux

# Créer Backend App Service
az webapp create `
    --resource-group $RESOURCE_GROUP `
    --plan "cv-analysis-plan" `
    --name $BACKEND_APP `
    --runtime "PYTHON:3.11"

# Créer Frontend App Service (pour React)
az webapp create `
    --resource-group $RESOURCE_GROUP `
    --plan "cv-analysis-plan" `
    --name $FRONTEND_APP `
    --runtime "NODE:18-lts"
```

### Étape 2 : Configurer la base de données (5 min)

```powershell
# Récupérer la chaîne de connexion PostgreSQL
$POSTGRES_URL = "postgresql://$DB_USER`:$DB_PASSWORD@$DB_SERVER.postgres.database.azure.com/$DB_NAME?sslmode=require"

# Générer SECRET_KEY
$SECRET_KEY = python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Étape 3 : Préparer le backend (15 min)

#### 3.1 Créer `backend/startup.sh`
```bash
#!/bin/bash
gunicorn app.main:app --bind 0.0.0.0:8000 --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

#### 3.2 Mettre à jour `backend/requirements.txt`
```txt
# Ajouter gunicorn pour production
gunicorn==21.2.0
psycopg2-binary==2.9.9  # Driver PostgreSQL
```

#### 3.3 Créer `backend/.deployment`
```
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

#### 3.4 Modifier `backend/app/database.py` (minimal)

Remplacer la ligne :
```python
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cv_analysis.db")
```

Par (déjà fait, mais vérifier) :
```python
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cv_analysis.db")
# SQLAlchemy gère automatiquement PostgreSQL si DATABASE_URL commence par postgresql://
```

✅ **C'est tout ! SQLAlchemy gère automatiquement PostgreSQL.**

### Étape 4 : Déployer le backend (15 min)

```powershell
cd backend

# Installer gunicorn localement (pour tester)
pip install gunicorn psycopg2-binary

# Créer startup.sh
@"
#!/bin/bash
gunicorn app.main:app --bind 0.0.0.0:8000 --workers 4 --worker-class uvicorn.workers.UvicornWorker
"@ | Out-File -FilePath startup.sh -Encoding utf8

# Configurer App Service
az webapp config set `
    --resource-group $RESOURCE_GROUP `
    --name $BACKEND_APP `
    --startup-file "startup.sh"

# Configurer les variables d'environnement
az webapp config appsettings set `
    --resource-group $RESOURCE_GROUP `
    --name $BACKEND_APP `
    --settings `
        SECRET_KEY="$SECRET_KEY" `
        DATABASE_URL="$POSTGRES_URL" `
        CORS_ORIGINS="https://$FRONTEND_APP.azurewebsites.net"

# Déployer (méthode ZIP - rapide)
Compress-Archive -Path * -DestinationPath deploy.zip -Force
az webapp deployment source config-zip `
    --resource-group $RESOURCE_GROUP `
    --name $BACKEND_APP `
    --src deploy.zip

# Vérifier le déploiement
az webapp log tail --resource-group $RESOURCE_GROUP --name $BACKEND_APP
```

### Étape 5 : Préparer le frontend (10 min)

#### 5.1 Mettre à jour `src/api/axios.js`

Remplacer :
```javascript
const API_URL = 'http://localhost:8000';
```

Par :
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://YOUR_BACKEND_APP.azurewebsites.net';
```

#### 5.2 Créer `.env.production`
```
VITE_API_URL=https://YOUR_BACKEND_APP.azurewebsites.net
```

#### 5.3 Build le frontend
```powershell
cd ..
npm install
npm run build
```

### Étape 6 : Déployer le frontend (10 min)

#### Option A : Azure Static Web Apps (RECOMMANDÉ - plus simple)

```powershell
# Installer SWA CLI
npm install -g @azure/static-web-apps-cli

# Créer Static Web App
az staticwebapp create `
    --name cv-analysis-web `
    --resource-group $RESOURCE_GROUP `
    --location $LOCATION `
    --sku Free

# Note: Vous obtiendrez un deployment token
# Déployer
swa deploy ./dist --deployment-token "VOTRE_TOKEN"
```

#### Option B : Azure App Service (si Option A ne fonctionne pas)

```powershell
# Créer web.config pour SPA routing
@"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
"@ | Out-File -FilePath dist/web.config -Encoding utf8

# Déployer
Compress-Archive -Path dist/* -DestinationPath frontend-deploy.zip -Force
az webapp deployment source config-zip `
    --resource-group $RESOURCE_GROUP `
    --name $FRONTEND_APP `
    --src frontend-deploy.zip
```

### Étape 7 : Initialiser la base de données (5 min)

```powershell
# Les tables seront créées automatiquement au premier démarrage
# Mais vous pouvez aussi forcer la création :

# Se connecter à la base et exécuter le script de création
# Option 1 : Via Azure Portal > PostgreSQL > Query editor
# Option 2 : Via psql localement si installé
```

✅ **Les tables SQLAlchemy seront créées automatiquement au premier appel de l'API !**

### Étape 8 : Tester (5 min)

```powershell
# Backend
curl https://$BACKEND_APP.azurewebsites.net/health

# Frontend
# Ouvrir https://$FRONTEND_APP.azurewebsites.net dans le navigateur
```

---

## ✅ Checklist rapide

- [ ] Créer les ressources Azure (script ci-dessus)
- [ ] Configurer DATABASE_URL (PostgreSQL)
- [ ] Ajouter gunicorn aux requirements.txt
- [ ] Créer startup.sh
- [ ] Déployer le backend
- [ ] Mettre à jour l'URL API dans le frontend
- [ ] Build le frontend
- [ ] Déployer le frontend (Static Web Apps ou App Service)
- [ ] Tester l'application

**Temps total estimé : 2-3 heures**

---

## 🔧 Stockage des fichiers (Optionnel pour MVP)

Pour le MVP, vous pouvez garder le stockage local sur App Service (limité à 1GB).
Pour plus d'espace plus tard :

```powershell
# Créer Storage Account
$STORAGE_ACCOUNT = "cvanalysisstorage$(Get-Random)"
az storage account create `
    --resource-group $RESOURCE_GROUP `
    --name $STORAGE_ACCOUNT `
    --location $LOCATION `
    --sku Standard_LRS

# Créer conteneur
$STORAGE_KEY = (az storage account keys list --resource-group $RESOURCE_GROUP --account-name $STORAGE_ACCOUNT --query "[0].value" -o tsv)
az storage container create --name cv-files --account-name $STORAGE_ACCOUNT --account-key $STORAGE_KEY
```

---

## 💰 Coûts MVP (par mois)

- **App Service Plan B1** : ~13€/mois
- **PostgreSQL Flexible Server (B1ms)** : ~15€/mois
- **Static Web Apps (Free tier)** : 0€
- **Stockage local App Service** : Inclus (1GB)
- **Total** : ~28€/mois

---

## 🚀 Phase 2 : Optimisation (optionnel, plus tard)

Une fois le MVP déployé et testé, vous pouvez migrer progressivement vers :

1. **Azure Blob Storage** pour les fichiers CV
2. **Azure Queue Storage + Functions** pour le traitement asynchrone
3. **Azure Document Intelligence** pour une meilleure extraction
4. **Azure Cosmos DB** si vous avez besoin de scalabilité NoSQL

Voir `AZURE_DEPLOYMENT_GUIDE.md` pour les détails complets.

---

## ⚠️ Points importants

### Fichiers uploadés (temporaire pour MVP)
- Les fichiers sont stockés localement sur App Service (`/home/site/wwwroot/uploads`)
- Limite : 1GB d'espace
- **Solution temporaire** : Ça fonctionne pour tester, migrer vers Blob Storage ensuite

### Base de données
- PostgreSQL remplace SQLite
- SQLAlchemy gère automatiquement le changement
- Les tables sont créées automatiquement au premier démarrage

### CORS
- Configuré automatiquement via `CORS_ORIGINS` dans les App Settings
- Ajouter d'autres domaines si nécessaire

### Secrets
- Ne jamais commiter les mots de passe
- Utiliser les App Settings d'Azure (déjà sécurisées)

---

## 🔍 Dépannage rapide

### Le backend ne démarre pas
```powershell
# Voir les logs
az webapp log tail --resource-group $RESOURCE_GROUP --name $BACKEND_APP

# Vérifier les variables d'environnement
az webapp config appsettings list --resource-group $RESOURCE_GROUP --name $BACKEND_APP
```

### Erreur de connexion à la base
- Vérifier que le firewall PostgreSQL autorise les connexions Azure
```powershell
az postgres flexible-server firewall-rule create `
    --resource-group $RESOURCE_GROUP `
    --name $DB_SERVER `
    --rule-name AllowAzureServices `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0
```

### Le frontend ne charge pas
- Vérifier que `web.config` est présent dans `dist/` (pour App Service)
- Vérifier l'URL de l'API dans `.env.production`

---

## 📝 Script tout-en-un (pour les pressés)

Créer `quick-deploy.ps1` :

```powershell
# Variables
$RESOURCE_GROUP = "cv-analysis-rg"
$LOCATION = "francecentral"
$BACKEND_APP = "cv-api-$(Get-Random)"
$FRONTEND_APP = "cv-web-$(Get-Random)"
$DB_SERVER = "cv-db-$(Get-Random)"
$DB_NAME = "cvanalysis"
$DB_USER = "cvadmin"
$DB_PASSWORD = "ChangeMe123!"

# ... (copier toutes les commandes ci-dessus)
```

Puis exécuter : `.\quick-deploy.ps1`

---

**Cette approche MVP vous permet de déployer rapidement et d'itérer ensuite !** 🚀

