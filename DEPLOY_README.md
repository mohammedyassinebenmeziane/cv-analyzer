# 🚀 Guide de déploiement Azure - Résumé

## 📚 Documents disponibles

1. **`QUICK_DEPLOY_AZURE.md`** ⚡ **← COMMENCEZ ICI !**
   - Guide rapide et efficace (2-3h)
   - Approche MVP (Minimum Viable Product)
   - Moins de modifications de code
   - Coût réduit (~28€/mois)

2. **`AZURE_DEPLOYMENT_GUIDE.md`** 📖
   - Guide complet et détaillé
   - Architecture cloud-native complète
   - Tous les services Azure (Functions, Cosmos DB, etc.)
   - Plus de temps (~1-2 jours) mais architecture optimale

3. **`PROJECT_OVERVIEW.md`** 📊
   - Vue d'ensemble du projet actuel
   - Architecture, fonctionnalités, structure

4. **`DEPLOYMENT_SUMMARY.md`** 📋
   - Résumé et checklist

## ⚡ Déploiement rapide (recommandé)

### Étape 1 : Créer les ressources Azure (10 min)

```powershell
# Exécuter le script automatisé
.\quick-deploy.ps1
```

Ce script crée automatiquement :
- ✅ Groupe de ressources
- ✅ PostgreSQL (base de données)
- ✅ App Service Plan
- ✅ Backend App Service (FastAPI)
- ✅ Frontend App Service (React)
- ✅ Configuration des variables d'environnement

### Étape 2 : Préparer le backend (15 min)

```powershell
cd backend

# Ajouter gunicorn aux requirements.txt (déjà fait si vous suivez le guide)
# Créer startup.sh (déjà créé par le script)

# Installer les dépendances
pip install gunicorn psycopg2-binary

# Déployer
Compress-Archive -Path * -DestinationPath deploy.zip -Force -Exclude @("venv", "__pycache__", "*.pyc", "cv_analysis.db*")
az webapp deployment source config-zip `
    --resource-group cv-analysis-rg `
    --name <BACKEND_APP_NAME> `
    --src deploy.zip
```

### Étape 3 : Préparer le frontend (10 min)

```powershell
cd ..

# L'URL de l'API est maintenant gérée via variable d'environnement
# Créer .env.production
echo "VITE_API_URL=https://<BACKEND_APP_NAME>.azurewebsites.net" > .env.production

# Build
npm run build
```

### Étape 4 : Déployer le frontend (10 min)

**Option A : Azure Static Web Apps (GRATUIT - recommandé)**

```powershell
npm install -g @azure/static-web-apps-cli

az staticwebapp create `
    --name cv-analysis-web `
    --resource-group cv-analysis-rg `
    --location francecentral `
    --sku Free

# Utiliser le deployment token fourni
swa deploy ./dist --deployment-token <TOKEN>
```

**Option B : Azure App Service**

```powershell
# Créer web.config pour le routing SPA
# (Voir QUICK_DEPLOY_AZURE.md pour le contenu)

Compress-Archive -Path dist/* -DestinationPath frontend-deploy.zip -Force
az webapp deployment source config-zip `
    --resource-group cv-analysis-rg `
    --name <FRONTEND_APP_NAME> `
    --src frontend-deploy.zip
```

### Étape 5 : Tester (5 min)

```powershell
# Backend health check
curl https://<BACKEND_APP_NAME>.azurewebsites.net/health

# Ouvrir le frontend dans le navigateur
start https://<FRONTEND_APP_NAME>.azurewebsites.net
```

## ✅ Avantages de l'approche rapide

- ⚡ **2-3 heures** de travail
- 💰 **~28€/mois** seulement
- 🔧 **Minimum de modifications** de code
- ✅ **Test rapide** en production
- 📈 **Évolutif** : amélioration progressive possible

## 🔄 Après le MVP

Une fois déployé et testé, vous pouvez migrer progressivement vers :
- Azure Blob Storage (stockage fichiers)
- Azure Functions (traitement asynchrone)
- Azure Document Intelligence (OCR amélioré)
- Azure Cosmos DB (si besoin NoSQL)

Voir `AZURE_DEPLOYMENT_GUIDE.md` pour les détails.

## 📝 Checklist rapide

- [ ] Exécuter `quick-deploy.ps1`
- [ ] Noter les noms des ressources créées
- [ ] Déployer le backend
- [ ] Créer `.env.production` avec l'URL du backend
- [ ] Build le frontend
- [ ] Déployer le frontend (Static Web Apps recommandé)
- [ ] Tester l'application
- [ ] Sauvegarder les informations de connexion

## 💡 Astuce

Les noms des ressources sont sauvegardés dans `azure-deployment-info.json` (ne pas commiter !)

## 🆘 Besoin d'aide ?

Consultez :
- `QUICK_DEPLOY_AZURE.md` pour le guide détaillé rapide
- `AZURE_DEPLOYMENT_GUIDE.md` pour l'architecture complète
- Logs Azure : `az webapp log tail --resource-group cv-analysis-rg --name <APP_NAME>`

