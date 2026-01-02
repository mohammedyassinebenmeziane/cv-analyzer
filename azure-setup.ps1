# Script PowerShell pour créer les ressources Azure pour CV Analysis
# Usage: .\azure-setup.ps1

# Configuration
$RESOURCE_GROUP = "cv-analysis-rg"
$LOCATION = "francecentral"  # ou westeurope, northeurope
$TIMESTAMP = (Get-Date -Format "yyyyMMddHHmmss")

# Comptes de stockage (nom unique requis)
$STORAGE_ACCOUNT = "cvanalysisstorage$TIMESTAMP"
$COSMOS_ACCOUNT = "cv-analysis-cosmos-$TIMESTAMP"
$DOC_INTELLIGENCE_ACCOUNT = "cv-analysis-docintel-$TIMESTAMP"
$BACKEND_APP = "cv-analysis-api-$TIMESTAMP"
$FRONTEND_APP = "cv-analysis-web-$TIMESTAMP"
$FUNCTION_APP = "cv-analysis-func-$TIMESTAMP"

# Noms des plans
$BACKEND_PLAN = "cv-analysis-backend-plan"
$FRONTEND_PLAN = "cv-analysis-frontend-plan"

# Noms des ressources
$DATABASE_NAME = "cv-analysis-db"
$CONTAINER_NAME = "analyses"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuration Azure pour CV Analysis" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier la connexion Azure
Write-Host "[1/8] Vérification de la connexion Azure..." -ForegroundColor Yellow
$context = az account show 2>$null
if (-not $context) {
    Write-Host "❌ Non connecté à Azure. Exécutez 'az login'" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Connecté à Azure" -ForegroundColor Green
Write-Host ""

# Créer le groupe de ressources
Write-Host "[2/8] Création du groupe de ressources..." -ForegroundColor Yellow
az group create `
    --name $RESOURCE_GROUP `
    --location $LOCATION `
    --output none
Write-Host "✅ Groupe de ressources créé : $RESOURCE_GROUP" -ForegroundColor Green
Write-Host ""

# Créer le compte de stockage
Write-Host "[3/8] Création du compte de stockage..." -ForegroundColor Yellow
az storage account create `
    --resource-group $RESOURCE_GROUP `
    --name $STORAGE_ACCOUNT `
    --location $LOCATION `
    --sku Standard_LRS `
    --kind StorageV2 `
    --output none

$STORAGE_KEY = az storage account keys list `
    --resource-group $RESOURCE_GROUP `
    --account-name $STORAGE_ACCOUNT `
    --query "[0].value" -o tsv

# Créer les conteneurs Blob
az storage container create `
    --account-name $STORAGE_ACCOUNT `
    --account-key $STORAGE_KEY `
    --name cv-files `
    --public-access off `
    --output none

az storage container create `
    --account-name $STORAGE_ACCOUNT `
    --account-key $STORAGE_KEY `
    --name processed-cvs `
    --public-access off `
    --output none

# Créer la queue
az storage queue create `
    --account-name $STORAGE_ACCOUNT `
    --account-key $STORAGE_KEY `
    --name cv-analysis-queue `
    --output none

$STORAGE_CONNECTION_STRING = az storage account show-connection-string `
    --resource-group $RESOURCE_GROUP `
    --name $STORAGE_ACCOUNT `
    --query connectionString -o tsv

Write-Host "✅ Compte de stockage créé : $STORAGE_ACCOUNT" -ForegroundColor Green
Write-Host ""

# Créer Azure Cosmos DB
Write-Host "[4/8] Création d'Azure Cosmos DB..." -ForegroundColor Yellow
az cosmosdb create `
    --resource-group $RESOURCE_GROUP `
    --name $COSMOS_ACCOUNT `
    --locations regionName=$LOCATION failoverPriority=0 `
    --default-consistency-level Session `
    --output none

az cosmosdb sql database create `
    --resource-group $RESOURCE_GROUP `
    --account-name $COSMOS_ACCOUNT `
    --name $DATABASE_NAME `
    --output none

az cosmosdb sql container create `
    --resource-group $RESOURCE_GROUP `
    --account-name $COSMOS_ACCOUNT `
    --database-name $DATABASE_NAME `
    --name $CONTAINER_NAME `
    --partition-key-path "/user_id" `
    --throughput 400 `
    --output none

$COSMOS_CONNECTION_STRING = az cosmosdb keys list `
    --resource-group $RESOURCE_GROUP `
    --name $COSMOS_ACCOUNT `
    --type connection-strings `
    --query "connectionStrings[0].connectionString" -o tsv

Write-Host "✅ Cosmos DB créé : $COSMOS_ACCOUNT" -ForegroundColor Green
Write-Host ""

# Créer Azure Document Intelligence
Write-Host "[5/8] Création d'Azure Document Intelligence..." -ForegroundColor Yellow
az cognitiveservices account create `
    --resource-group $RESOURCE_GROUP `
    --name $DOC_INTELLIGENCE_ACCOUNT `
    --location $LOCATION `
    --kind FormRecognizer `
    --sku S0 `
    --output none

$DOC_INTELLIGENCE_KEY = az cognitiveservices account keys list `
    --resource-group $RESOURCE_GROUP `
    --name $DOC_INTELLIGENCE_ACCOUNT `
    --query key1 -o tsv

$DOC_INTELLIGENCE_ENDPOINT = az cognitiveservices account show `
    --resource-group $RESOURCE_GROUP `
    --name $DOC_INTELLIGENCE_ACCOUNT `
    --query properties.endpoint -o tsv

Write-Host "✅ Document Intelligence créé : $DOC_INTELLIGENCE_ACCOUNT" -ForegroundColor Green
Write-Host ""

# Créer les App Service Plans
Write-Host "[6/8] Création des App Service Plans..." -ForegroundColor Yellow
az appservice plan create `
    --resource-group $RESOURCE_GROUP `
    --name $BACKEND_PLAN `
    --location $LOCATION `
    --sku B1 `
    --is-linux `
    --output none

az appservice plan create `
    --resource-group $RESOURCE_GROUP `
    --name $FRONTEND_PLAN `
    --location $LOCATION `
    --sku B1 `
    --is-linux `
    --output none

Write-Host "✅ App Service Plans créés" -ForegroundColor Green
Write-Host ""

# Créer les App Services
Write-Host "[7/8] Création des App Services..." -ForegroundColor Yellow
az webapp create `
    --resource-group $RESOURCE_GROUP `
    --plan $BACKEND_PLAN `
    --name $BACKEND_APP `
    --runtime "PYTHON:3.11" `
    --output none

az webapp create `
    --resource-group $RESOURCE_GROUP `
    --plan $FRONTEND_PLAN `
    --name $FRONTEND_APP `
    --runtime "NODE:18-lts" `
    --output none

Write-Host "✅ App Services créés" -ForegroundColor Green
Write-Host ""

# Créer Azure Functions
Write-Host "[8/8] Création d'Azure Functions..." -ForegroundColor Yellow
az functionapp create `
    --resource-group $RESOURCE_GROUP `
    --consumption-plan-location $LOCATION `
    --runtime python `
    --runtime-version 3.11 `
    --functions-version 4 `
    --name $FUNCTION_APP `
    --storage-account $STORAGE_ACCOUNT `
    --output none

Write-Host "✅ Azure Functions créé : $FUNCTION_APP" -ForegroundColor Green
Write-Host ""

# Générer une clé secrète JWT
Write-Host "[Bonus] Génération de la clé secrète JWT..." -ForegroundColor Yellow
$SECRET_KEY = python -c "import secrets; print(secrets.token_urlsafe(32))"
if (-not $SECRET_KEY) {
    # Fallback si Python n'est pas disponible
    $SECRET_KEY = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
}

# Configurer les variables d'environnement pour le backend
Write-Host "Configuration des variables d'environnement du backend..." -ForegroundColor Yellow
az webapp config appsettings set `
    --resource-group $RESOURCE_GROUP `
    --name $BACKEND_APP `
    --settings `
        SECRET_KEY="$SECRET_KEY" `
        DATABASE_URL="cosmosdb_sql" `
        COSMOS_CONNECTION_STRING="$COSMOS_CONNECTION_STRING" `
        COSMOS_DATABASE_NAME="$DATABASE_NAME" `
        COSMOS_CONTAINER_NAME="$CONTAINER_NAME" `
        STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" `
        STORAGE_CONTAINER_NAME="cv-files" `
        DOC_INTELLIGENCE_ENDPOINT="$DOC_INTELLIGENCE_ENDPOINT" `
        DOC_INTELLIGENCE_KEY="$DOC_INTELLIGENCE_KEY" `
        QUEUE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" `
        QUEUE_NAME="cv-analysis-queue" `
        FUNCTION_APP_URL="https://$FUNCTION_APP.azurewebsites.net" `
        CORS_ORIGINS="https://$FRONTEND_APP.azurewebsites.net" `
    --output none

# Configurer les variables pour Azure Functions
az functionapp config appsettings set `
    --resource-group $RESOURCE_GROUP `
    --name $FUNCTION_APP `
    --settings `
        COSMOS_CONNECTION_STRING="$COSMOS_CONNECTION_STRING" `
        COSMOS_DATABASE_NAME="$DATABASE_NAME" `
        COSMOS_CONTAINER_NAME="$CONTAINER_NAME" `
        DOC_INTELLIGENCE_ENDPOINT="$DOC_INTELLIGENCE_ENDPOINT" `
        DOC_INTELLIGENCE_KEY="$DOC_INTELLIGENCE_KEY" `
        STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" `
    --output none

Write-Host "✅ Variables d'environnement configurées" -ForegroundColor Green
Write-Host ""

# Afficher le résumé
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ressources créées :" -ForegroundColor Yellow
Write-Host "  - Groupe de ressources : $RESOURCE_GROUP" -ForegroundColor White
Write-Host "  - Compte de stockage : $STORAGE_ACCOUNT" -ForegroundColor White
Write-Host "  - Cosmos DB : $COSMOS_ACCOUNT" -ForegroundColor White
Write-Host "  - Document Intelligence : $DOC_INTELLIGENCE_ACCOUNT" -ForegroundColor White
Write-Host "  - Backend API : $BACKEND_APP" -ForegroundColor White
Write-Host "  - Frontend Web : $FRONTEND_APP" -ForegroundColor White
Write-Host "  - Azure Functions : $FUNCTION_APP" -ForegroundColor White
Write-Host ""
Write-Host "URLs des applications :" -ForegroundColor Yellow
Write-Host "  - Backend : https://$BACKEND_APP.azurewebsites.net" -ForegroundColor Cyan
Write-Host "  - Frontend : https://$FRONTEND_APP.azurewebsites.net" -ForegroundColor Cyan
Write-Host "  - Functions : https://$FUNCTION_APP.azurewebsites.net" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes :" -ForegroundColor Yellow
Write-Host "  1. Adapter le code pour utiliser les services Azure (voir AZURE_DEPLOYMENT_GUIDE.md)" -ForegroundColor White
Write-Host "  2. Déployer le backend vers $BACKEND_APP" -ForegroundColor White
Write-Host "  3. Déployer le frontend vers $FRONTEND_APP" -ForegroundColor White
Write-Host "  4. Déployer les Azure Functions vers $FUNCTION_APP" -ForegroundColor White
Write-Host ""
Write-Host "Consultez AZURE_DEPLOYMENT_GUIDE.md pour le guide complet de déploiement." -ForegroundColor Cyan
Write-Host ""

# Sauvegarder les informations dans un fichier
$outputFile = "azure-resources-$TIMESTAMP.json"
$resources = @{
    resource_group = $RESOURCE_GROUP
    location = $LOCATION
    storage_account = $STORAGE_ACCOUNT
    cosmos_account = $COSMOS_ACCOUNT
    doc_intelligence_account = $DOC_INTELLIGENCE_ACCOUNT
    backend_app = $BACKEND_APP
    frontend_app = $FRONTEND_APP
    function_app = $FUNCTION_APP
    backend_url = "https://$BACKEND_APP.azurewebsites.net"
    frontend_url = "https://$FRONTEND_APP.azurewebsites.net"
    function_url = "https://$FUNCTION_APP.azurewebsites.net"
    storage_connection_string = $STORAGE_CONNECTION_STRING
    cosmos_connection_string = $COSMOS_CONNECTION_STRING
    doc_intelligence_endpoint = $DOC_INTELLIGENCE_ENDPOINT
    doc_intelligence_key = $DOC_INTELLIGENCE_KEY
} | ConvertTo-Json -Depth 10

$resources | Out-File -FilePath $outputFile -Encoding UTF8
Write-Host "📄 Informations sauvegardées dans : $outputFile" -ForegroundColor Green
Write-Host "⚠️  Ce fichier contient des informations sensibles. Ne le commitez pas !" -ForegroundColor Red
Write-Host ""

