# Script de déploiement rapide Azure pour CV Analysis (MVP)
# Usage: .\quick-deploy.ps1

param(
    [string]$ResourceGroup = "cv-analysis-rg",
    [string]$Location = "francecentral",
    [string]$DbPassword = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Déploiement rapide Azure - CV Analysis" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier la connexion Azure
Write-Host "[1/7] Vérification de la connexion Azure..." -ForegroundColor Yellow
$context = az account show 2>$null
if (-not $context) {
    Write-Host "❌ Non connecté à Azure. Exécutez 'az login'" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Connecté à Azure" -ForegroundColor Green
Write-Host ""

# Générer des noms uniques
$TIMESTAMP = Get-Random
$BACKEND_APP = "cv-api-$TIMESTAMP"
$FRONTEND_APP = "cv-web-$TIMESTAMP"
$DB_SERVER = "cv-db-$TIMESTAMP"
$DB_NAME = "cvanalysis"
$DB_USER = "cvadmin"

# Générer un mot de passe si non fourni
if ([string]::IsNullOrEmpty($DbPassword)) {
    $DbPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | ForEach-Object {[char]$_})
}

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  - Groupe de ressources: $ResourceGroup" -ForegroundColor White
Write-Host "  - Location: $Location" -ForegroundColor White
Write-Host "  - Backend: $BACKEND_APP" -ForegroundColor White
Write-Host "  - Frontend: $FRONTEND_APP" -ForegroundColor White
Write-Host "  - Database: $DB_SERVER" -ForegroundColor White
Write-Host ""

# Créer le groupe de ressources
Write-Host "[2/7] Création du groupe de ressources..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none
Write-Host "✅ Groupe de ressources créé" -ForegroundColor Green
Write-Host ""

# Créer PostgreSQL
Write-Host "[3/7] Création de PostgreSQL (cela peut prendre 5-10 minutes)..." -ForegroundColor Yellow
az postgres flexible-server create `
    --resource-group $ResourceGroup `
    --name $DB_SERVER `
    --location $Location `
    --admin-user $DB_USER `
    --admin-password $DbPassword `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --version 14 `
    --storage-size 32 `
    --output none

az postgres flexible-server db create `
    --resource-group $ResourceGroup `
    --server-name $DB_SERVER `
    --database-name $DB_NAME `
    --output none

# Autoriser les connexions Azure
az postgres flexible-server firewall-rule create `
    --resource-group $ResourceGroup `
    --name $DB_SERVER `
    --rule-name AllowAzureServices `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0 `
    --output none

$POSTGRES_URL = "postgresql://$DB_USER`:$DbPassword@$DB_SERVER.postgres.database.azure.com/$DB_NAME?sslmode=require"
Write-Host "✅ PostgreSQL créé" -ForegroundColor Green
Write-Host ""

# Créer App Service Plan
Write-Host "[4/7] Création de l'App Service Plan..." -ForegroundColor Yellow
az appservice plan create `
    --resource-group $ResourceGroup `
    --name "cv-analysis-plan" `
    --location $Location `
    --sku B1 `
    --is-linux `
    --output none
Write-Host "✅ App Service Plan créé" -ForegroundColor Green
Write-Host ""

# Créer Backend App Service
Write-Host "[5/7] Création du Backend App Service..." -ForegroundColor Yellow
az webapp create `
    --resource-group $ResourceGroup `
    --plan "cv-analysis-plan" `
    --name $BACKEND_APP `
    --runtime "PYTHON:3.11" `
    --output none

# Générer SECRET_KEY
$SECRET_KEY = python -c "import secrets; print(secrets.token_urlsafe(32))" 2>$null
if (-not $SECRET_KEY) {
    $SECRET_KEY = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
}

# Configurer startup.sh
$startupScript = @"
#!/bin/bash
gunicorn app.main:app --bind 0.0.0.0:8000 --workers 4 --worker-class uvicorn.workers.UvicornWorker
"@
$startupScript | Out-File -FilePath "startup.sh" -Encoding utf8 -NoNewline

az webapp config set `
    --resource-group $ResourceGroup `
    --name $BACKEND_APP `
    --startup-file "startup.sh" `
    --output none

# Configurer les variables d'environnement
az webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $BACKEND_APP `
    --settings `
        SECRET_KEY="$SECRET_KEY" `
        DATABASE_URL="$POSTGRES_URL" `
        CORS_ORIGINS="https://$FRONTEND_APP.azurewebsites.net" `
    --output none

Write-Host "✅ Backend App Service créé" -ForegroundColor Green
Write-Host ""

# Créer Frontend App Service
Write-Host "[6/7] Création du Frontend App Service..." -ForegroundColor Yellow
az webapp create `
    --resource-group $ResourceGroup `
    --plan "cv-analysis-plan" `
    --name $FRONTEND_APP `
    --runtime "NODE:18-lts" `
    --output none
Write-Host "✅ Frontend App Service créé" -ForegroundColor Green
Write-Host ""

# Afficher les instructions de déploiement
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Ressources Azure créées !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Déployer le backend:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   pip install gunicorn psycopg2-binary" -ForegroundColor White
Write-Host "   Compress-Archive -Path * -DestinationPath deploy.zip -Force" -ForegroundColor White
Write-Host "   az webapp deployment source config-zip \`" -ForegroundColor White
Write-Host "     --resource-group $ResourceGroup \`" -ForegroundColor White
Write-Host "     --name $BACKEND_APP \`" -ForegroundColor White
Write-Host "     --src deploy.zip" -ForegroundColor White
Write-Host ""
Write-Host "2. Préparer le frontend:" -ForegroundColor Cyan
Write-Host "   - Modifier src/api/axios.js:" -ForegroundColor White
Write-Host "     const API_URL = 'https://$BACKEND_APP.azurewebsites.net';" -ForegroundColor Gray
Write-Host "   - Build: npm run build" -ForegroundColor White
Write-Host ""
Write-Host "3. Déployer le frontend (Static Web Apps recommandé):" -ForegroundColor Cyan
Write-Host "   npm install -g @azure/static-web-apps-cli" -ForegroundColor White
Write-Host "   az staticwebapp create \`" -ForegroundColor White
Write-Host "     --name cv-analysis-web \`" -ForegroundColor White
Write-Host "     --resource-group $ResourceGroup \`" -ForegroundColor White
Write-Host "     --location $Location \`" -ForegroundColor White
Write-Host "     --sku Free" -ForegroundColor White
Write-Host "   # Puis utiliser le deployment token fourni" -ForegroundColor White
Write-Host "   swa deploy ./dist --deployment-token <TOKEN>" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "  - Backend: https://$BACKEND_APP.azurewebsites.net" -ForegroundColor Cyan
Write-Host "  - Frontend: https://$FRONTEND_APP.azurewebsites.net (ou Static Web Apps)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Informations de connexion:" -ForegroundColor Yellow
Write-Host "  - Database: $DB_SERVER.postgres.database.azure.com" -ForegroundColor White
Write-Host "  - Database Name: $DB_NAME" -ForegroundColor White
Write-Host "  - Database User: $DB_USER" -ForegroundColor White
Write-Host "  - Database Password: $DbPassword" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Sauvegardez le mot de passe de la base de données !" -ForegroundColor Red
Write-Host ""

# Sauvegarder les informations
$info = @{
    resource_group = $ResourceGroup
    location = $Location
    backend_app = $BACKEND_APP
    frontend_app = $FRONTEND_APP
    database_server = $DB_SERVER
    database_name = $DB_NAME
    database_user = $DB_USER
    database_password = $DbPassword
    backend_url = "https://$BACKEND_APP.azurewebsites.net"
    frontend_url = "https://$FRONTEND_APP.azurewebsites.net"
    postgres_url = $POSTGRES_URL
} | ConvertTo-Json -Depth 10

$infoFile = "azure-deployment-info.json"
$info | Out-File -FilePath $infoFile -Encoding UTF8
Write-Host "📄 Informations sauvegardées dans: $infoFile" -ForegroundColor Green
Write-Host "⚠️  Ce fichier contient des secrets. Ne le commitez pas !" -ForegroundColor Red
Write-Host ""

