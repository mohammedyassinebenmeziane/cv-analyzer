# Guide de déploiement sur Azure - CV Analysis

## 📋 Vue d'ensemble du projet

### Architecture actuelle

**CV Analysis** est une application web complète pour l'analyse de CV par intelligence artificielle, composée de :

#### Frontend (React + Vite)
- **Technologies** : React 18, Vite, Tailwind CSS, React Router, Axios
- **Fonctionnalités** :
  - Authentification (inscription/connexion)
  - Upload de CV (simple et bulk)
  - Visualisation des résultats d'analyse
  - Historique des analyses
  - Dashboard avec statistiques

#### Backend (FastAPI)
- **Technologies** : FastAPI, SQLAlchemy, JWT, bcrypt
- **Base de données** : SQLite (dev) / PostgreSQL (production prévu)
- **Fonctionnalités** :
  - API REST pour l'authentification
  - Upload et stockage de fichiers CV (PDF, DOCX)
  - Analyse de CV avec extraction de compétences, expériences, formations
  - Calcul de score de correspondance avec description de poste
  - Gestion d'historique d'analyses

#### Fonctionnalités principales
1. **Analyse de CV unique** : Upload d'un CV + description de poste → Score de correspondance
2. **Bulk Upload** : Upload de 10 CVs maximum → Analyse parallèle → Filtrage par score
3. **Extraction structurée** : Compétences, expériences, formations, langues, certifications
4. **Score intelligent** : Basé sur similarité sémantique et correspondance de compétences
5. **Historique** : Conservation de toutes les analyses avec accès rapide

---

## 🏗️ Architecture cible sur Azure

### Vue d'ensemble de l'architecture cloud

```
┌─────────────────────────────────────────────────────────────────┐
│                        Utilisateurs                              │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              Azure App Service (Frontend React)                  │
│              https://cv-analysis.azurewebsites.net               │
└──────────────────────────────┬──────────────────────────────────┘
                               │ API Calls
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              Azure App Service (Backend FastAPI)                 │
│              https://cv-analysis-api.azurewebsites.net           │
└──────┬───────────────────────┬───────────────────────┬──────────┘
       │                       │                       │
       │ Upload CV             │ Queue Job             │ Store Results
       ▼                       ▼                       ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Azure Blob   │      │ Azure Queue  │      │ Azure        │
│ Storage      │      │ Storage      │      │ Cosmos DB    │
│ (CV Files)   │      │ (Jobs)       │      │ (Results)    │
└──────┬───────┘      └──────┬───────┘      └──────────────┘
       │                     │
       │ Trigger             │ Process
       ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              Azure Functions (Serverless)                        │
│  - Trigger: Blob upload                                          │
│  - Traitement: Analyse de CV                                     │
│  - Services utilisés:                                            │
│    • Azure Document Intelligence (OCR + Extraction)              │
│    • Azure AI Services (Similarité sémantique)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Services Azure utilisés

1. **Azure App Service** (2 instances)
   - Frontend React (static website)
   - Backend FastAPI (Python runtime)

2. **Azure Blob Storage**
   - Stockage des fichiers CV uploadés
   - Conteneurs : `cv-files`, `processed-cvs`

3. **Azure Queue Storage**
   - Gestion des jobs d'analyse
   - Files d'attente : `cv-analysis-queue`

4. **Azure Functions**
   - Traitement serverless des CVs
   - Triggers : Blob upload, Queue message
   - Runtime : Python 3.11

5. **Azure Document Intelligence (Form Recognizer)**
   - OCR et extraction structurée de documents
   - Modèle pré-entraîné pour CVs

6. **Azure Cosmos DB**
   - Base de données NoSQL pour résultats d'analyse
   - API : SQL (compatible avec MongoDB)

---

## 📦 Prérequis et préparation

### 1. Compte Azure
- Compte Azure actif (essai gratuit ou payant)
- Azure CLI installé : https://docs.microsoft.com/cli/azure/install-azure-cli
- Azure Functions Core Tools : https://docs.microsoft.com/azure/azure-functions/functions-run-local

### 2. Outils locaux
```bash
# Vérifier l'installation
az --version
func --version
python --version  # Python 3.11+
node --version    # Node.js 18+
```

### 3. Authentification Azure CLI
```bash
az login
az account set --subscription "Votre-Subscription-ID"
```

---

## 🚀 Étape 1 : Créer les ressources Azure

### 1.1 Créer un groupe de ressources
```bash
# Définir les variables
RESOURCE_GROUP="cv-analysis-rg"
LOCATION="francecentral"  # ou westeurope, northeurope

# Créer le groupe de ressources
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```

### 1.2 Créer un compte de stockage (Blob + Queue)
```bash
STORAGE_ACCOUNT="cvanalysisstorage$(date +%s)"  # Nom unique

# Créer le compte de stockage
az storage account create \
  --resource-group $RESOURCE_GROUP \
  --name $STORAGE_ACCOUNT \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2

# Récupérer la clé de connexion
STORAGE_KEY=$(az storage account keys list \
  --resource-group $RESOURCE_GROUP \
  --account-name $STORAGE_ACCOUNT \
  --query "[0].value" -o tsv)

# Créer les conteneurs Blob
az storage container create \
  --account-name $STORAGE_ACCOUNT \
  --account-key $STORAGE_KEY \
  --name cv-files \
  --public-access off

az storage container create \
  --account-name $STORAGE_ACCOUNT \
  --account-key $STORAGE_KEY \
  --name processed-cvs \
  --public-access off

# Créer la queue
az storage queue create \
  --account-name $STORAGE_ACCOUNT \
  --account-key $STORAGE_KEY \
  --name cv-analysis-queue
```

### 1.3 Créer Azure Cosmos DB
```bash
COSMOS_ACCOUNT="cv-analysis-cosmos"
DATABASE_NAME="cv-analysis-db"
CONTAINER_NAME="analyses"

# Créer le compte Cosmos DB
az cosmosdb create \
  --resource-group $RESOURCE_GROUP \
  --name $COSMOS_ACCOUNT \
  --locations regionName=$LOCATION failoverPriority=0 \
  --default-consistency-level Session

# Créer la base de données
az cosmosdb sql database create \
  --resource-group $RESOURCE_GROUP \
  --account-name $COSMOS_ACCOUNT \
  --name $DATABASE_NAME

# Créer le conteneur (collection)
az cosmosdb sql container create \
  --resource-group $RESOURCE_GROUP \
  --account-name $COSMOS_ACCOUNT \
  --database-name $DATABASE_NAME \
  --name $CONTAINER_NAME \
  --partition-key-path "/user_id" \
  --throughput 400
```

### 1.4 Créer Azure Document Intelligence
```bash
DOC_INTELLIGENCE_ACCOUNT="cv-analysis-docintel"

# Créer la ressource Document Intelligence
az cognitiveservices account create \
  --resource-group $RESOURCE_GROUP \
  --name $DOC_INTELLIGENCE_ACCOUNT \
  --location $LOCATION \
  --kind FormRecognizer \
  --sku S0
```

### 1.5 Créer Azure App Service Plans
```bash
# Plan pour le backend (Python)
BACKEND_PLAN="cv-analysis-backend-plan"
az appservice plan create \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_PLAN \
  --location $LOCATION \
  --sku B1 \
  --is-linux

# Plan pour le frontend (ou utiliser Static Web Apps)
FRONTEND_PLAN="cv-analysis-frontend-plan"
az appservice plan create \
  --resource-group $RESOURCE_GROUP \
  --name $FRONTEND_PLAN \
  --location $LOCATION \
  --sku B1 \
  --is-linux
```

### 1.6 Créer les App Services
```bash
# Backend API
BACKEND_APP="cv-analysis-api-$(date +%s)"
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $BACKEND_PLAN \
  --name $BACKEND_APP \
  --runtime "PYTHON:3.11"

# Frontend (optionnel : utiliser Azure Static Web Apps à la place)
FRONTEND_APP="cv-analysis-web-$(date +%s)"
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $FRONTEND_PLAN \
  --name $FRONTEND_APP \
  --runtime "NODE:18-lts"
```

### 1.7 Créer Azure Functions App
```bash
FUNCTION_APP="cv-analysis-functions-$(date +%s)"

# Créer le plan Functions (Consumption)
az functionapp create \
  --resource-group $RESOURCE_GROUP \
  --consumption-plan-location $LOCATION \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4 \
  --name $FUNCTION_APP \
  --storage-account $STORAGE_ACCOUNT
```

---

## 🔧 Étape 2 : Configurer les variables d'environnement

### 2.1 Récupérer les chaînes de connexion
```bash
# Stockage
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
  --resource-group $RESOURCE_GROUP \
  --name $STORAGE_ACCOUNT \
  --query connectionString -o tsv)

# Cosmos DB
COSMOS_CONNECTION_STRING=$(az cosmosdb keys list \
  --resource-group $RESOURCE_GROUP \
  --name $COSMOS_ACCOUNT \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" -o tsv)

# Document Intelligence
DOC_INTELLIGENCE_KEY=$(az cognitiveservices account keys list \
  --resource-group $RESOURCE_GROUP \
  --name $DOC_INTELLIGENCE_ACCOUNT \
  --query key1 -o tsv)

DOC_INTELLIGENCE_ENDPOINT=$(az cognitiveservices account show \
  --resource-group $RESOURCE_GROUP \
  --name $DOC_INTELLIGENCE_ACCOUNT \
  --query properties.endpoint -o tsv)
```

### 2.2 Configurer les App Settings pour le backend
```bash
# Générer une clé secrète JWT
SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")

# Configurer les variables d'environnement du backend
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP \
  --settings \
    SECRET_KEY="$SECRET_KEY" \
    DATABASE_URL="cosmosdb_sql" \
    COSMOS_CONNECTION_STRING="$COSMOS_CONNECTION_STRING" \
    COSMOS_DATABASE_NAME="$DATABASE_NAME" \
    COSMOS_CONTAINER_NAME="$CONTAINER_NAME" \
    STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" \
    STORAGE_CONTAINER_NAME="cv-files" \
    DOC_INTELLIGENCE_ENDPOINT="$DOC_INTELLIGENCE_ENDPOINT" \
    DOC_INTELLIGENCE_KEY="$DOC_INTELLIGENCE_KEY" \
    QUEUE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" \
    QUEUE_NAME="cv-analysis-queue" \
    FUNCTION_APP_URL="https://$FUNCTION_APP.azurewebsites.net" \
    CORS_ORIGINS="https://$FRONTEND_APP.azurewebsites.net,https://cv-analysis.azurestaticapps.net"
```

### 2.3 Configurer les App Settings pour Azure Functions
```bash
az functionapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $FUNCTION_APP \
  --settings \
    COSMOS_CONNECTION_STRING="$COSMOS_CONNECTION_STRING" \
    COSMOS_DATABASE_NAME="$DATABASE_NAME" \
    COSMOS_CONTAINER_NAME="$CONTAINER_NAME" \
    DOC_INTELLIGENCE_ENDPOINT="$DOC_INTELLIGENCE_ENDPOINT" \
    DOC_INTELLIGENCE_KEY="$DOC_INTELLIGENCE_KEY" \
    STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING"
```

---

## 📝 Étape 3 : Adapter le code pour Azure

### 3.1 Modifications du backend

#### 3.1.1 Nouveau fichier : `backend/app/storage/azure_blob.py`
```python
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.core.exceptions import ResourceExistsError
import os
from typing import Optional

class AzureBlobStorage:
    def __init__(self, connection_string: str, container_name: str):
        self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        self.container_name = container_name
        self._ensure_container_exists()
    
    def _ensure_container_exists(self):
        try:
            container_client = self.blob_service_client.get_container_client(self.container_name)
            container_client.create_container()
        except ResourceExistsError:
            pass
    
    def upload_file(self, file_content: bytes, blob_name: str) -> str:
        """Upload un fichier et retourne l'URL du blob"""
        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name,
            blob=blob_name
        )
        blob_client.upload_blob(file_content, overwrite=True)
        return blob_client.url
    
    def download_file(self, blob_name: str) -> bytes:
        """Télécharge un fichier"""
        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name,
            blob=blob_name
        )
        return blob_client.download_blob().readall()
    
    def delete_file(self, blob_name: str):
        """Supprime un fichier"""
        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name,
            blob=blob_name
        )
        blob_client.delete_blob()
    
    def get_file_url(self, blob_name: str) -> str:
        """Retourne l'URL d'un fichier"""
        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name,
            blob=blob_name
        )
        return blob_client.url
```

#### 3.1.2 Nouveau fichier : `backend/app/storage/azure_queue.py`
```python
from azure.storage.queue import QueueClient
from azure.core.exceptions import ResourceExistsError
import json

class AzureQueueStorage:
    def __init__(self, connection_string: str, queue_name: str):
        self.queue_client = QueueClient.from_connection_string(
            connection_string,
            queue_name
        )
        self._ensure_queue_exists()
    
    def _ensure_queue_exists(self):
        try:
            self.queue_client.create_queue()
        except ResourceExistsError:
            pass
    
    def send_message(self, message: dict):
        """Envoie un message dans la queue"""
        message_text = json.dumps(message)
        self.queue_client.send_message(message_text)
    
    def receive_message(self, visibility_timeout: int = 300):
        """Reçoit un message de la queue"""
        messages = self.queue_client.receive_messages(visibility_timeout=visibility_timeout)
        if messages:
            message = messages[0]
            return json.loads(message.content), message
        return None, None
    
    def delete_message(self, message):
        """Supprime un message de la queue"""
        self.queue_client.delete_message(message)
```

#### 3.1.3 Nouveau fichier : `backend/app/database/cosmos_db.py`
```python
from azure.cosmos import CosmosClient, PartitionKey, exceptions
from typing import Dict, List, Optional
import os

class CosmosDBClient:
    def __init__(self, connection_string: str, database_name: str, container_name: str):
        self.client = CosmosClient.from_connection_string(connection_string)
        self.database = self.client.get_database_client(database_name)
        self.container = self.database.get_container_client(container_name)
    
    def create_item(self, item: Dict):
        """Crée un nouvel élément"""
        return self.container.create_item(item)
    
    def get_item(self, item_id: str, partition_key: str):
        """Récupère un élément par ID"""
        return self.container.read_item(item_id, partition_key)
    
    def query_items(self, query: str, parameters: Optional[List] = None):
        """Exécute une requête"""
        if parameters:
            items = self.container.query_items(query=query, parameters=parameters)
        else:
            items = self.container.query_items(query=query)
        return list(items)
    
    def update_item(self, item: Dict):
        """Met à jour un élément"""
        return self.container.replace_item(item['id'], item)
    
    def delete_item(self, item_id: str, partition_key: str):
        """Supprime un élément"""
        self.container.delete_item(item_id, partition_key)
```

#### 3.1.4 Modifier `backend/app/database.py`
```python
import os
from azure.cosmos import CosmosClient, PartitionKey
from .database.cosmos_db import CosmosDBClient

# Utiliser Cosmos DB au lieu de SQLAlchemy
COSMOS_CONNECTION_STRING = os.getenv("COSMOS_CONNECTION_STRING")
COSMOS_DATABASE_NAME = os.getenv("COSMOS_DATABASE_NAME", "cv-analysis-db")
COSMOS_CONTAINER_NAME = os.getenv("COSMOS_CONTAINER_NAME", "analyses")

# Client Cosmos DB global
cosmos_client = None

def get_cosmos_client():
    global cosmos_client
    if cosmos_client is None and COSMOS_CONNECTION_STRING:
        cosmos_client = CosmosDBClient(
            COSMOS_CONNECTION_STRING,
            COSMOS_DATABASE_NAME,
            COSMOS_CONTAINER_NAME
        )
    return cosmos_client
```

#### 3.1.5 Modifier `backend/app/routes/cv.py`
```python
# Au début du fichier, ajouter
from ..storage.azure_blob import AzureBlobStorage
from ..storage.azure_queue import AzureQueueStorage
import os

# Initialiser les clients Azure
STORAGE_CONNECTION_STRING = os.getenv("STORAGE_CONNECTION_STRING")
QUEUE_CONNECTION_STRING = os.getenv("QUEUE_CONNECTION_STRING")
STORAGE_CONTAINER = os.getenv("STORAGE_CONTAINER_NAME", "cv-files")
QUEUE_NAME = os.getenv("QUEUE_NAME", "cv-analysis-queue")

blob_storage = AzureBlobStorage(STORAGE_CONNECTION_STRING, STORAGE_CONTAINER) if STORAGE_CONNECTION_STRING else None
queue_storage = AzureQueueStorage(QUEUE_CONNECTION_STRING, QUEUE_NAME) if QUEUE_CONNECTION_STRING else None

@router.post("/upload", response_model=schemas.AnalysisCreate)
async def upload_cv(
    cv_file: UploadFile = File(...),
    job_description: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # ... validation du fichier ...
    
    # Lire le contenu
    content = await cv_file.read()
    
    # Upload vers Azure Blob Storage
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(cv_file.filename)[1].lower()
    blob_name = f"{file_id}{file_extension}"
    
    if blob_storage:
        blob_url = blob_storage.upload_file(content, blob_name)
        
        # Envoyer un message dans la queue pour traitement asynchrone
        if queue_storage:
            queue_storage.send_message({
                "file_id": file_id,
                "blob_name": blob_name,
                "blob_url": blob_url,
                "filename": cv_file.filename,
                "job_description": job_description,
                "user_id": current_user.id,
                "created_at": datetime.utcnow().isoformat()
            })
            
            # Créer une entrée d'analyse en attente dans Cosmos DB
            analysis_item = {
                "id": file_id,
                "user_id": str(current_user.id),
                "cv_filename": cv_file.filename,
                "blob_url": blob_url,
                "job_description": job_description,
                "status": "processing",
                "created_at": datetime.utcnow().isoformat()
            }
            
            cosmos_client = database.get_cosmos_client()
            if cosmos_client:
                cosmos_client.create_item(analysis_item)
            
            return {"analysis_id": file_id, "status": "processing"}
    else:
        # Fallback : traitement local (dev uniquement)
        # ... code existant ...
```

### 3.2 Créer Azure Functions

#### 3.2.1 Structure des Functions
```
azure-functions/
├── host.json
├── requirements.txt
├── process_cv/
│   ├── __init__.py
│   └── function.json
└── local.settings.json.example
```

#### 3.2.2 `azure-functions/requirements.txt`
```
azure-functions
azure-storage-blob
azure-storage-queue
azure-cosmos
azure-ai-formrecognizer
python-docx
PyPDF2
requests
```

#### 3.2.3 `azure-functions/process_cv/__init__.py`
```python
import logging
import azure.functions as func
import json
from azure.storage.queue import QueueClient
from azure.cosmos import CosmosClient
from azure.ai.formrecognizer import DocumentAnalysisClient
from typing import Dict
import os

def main(msg: func.QueueMessage) -> None:
    logging.info(f'Queue trigger processed: {msg.get_body().decode()}')
    
    # Parse le message
    message_data = json.loads(msg.get_body().decode())
    file_id = message_data.get("file_id")
    blob_url = message_data.get("blob_url")
    job_description = message_data.get("job_description")
    user_id = message_data.get("user_id")
    
    try:
        # Initialiser Document Intelligence
        doc_intelligence_client = DocumentAnalysisClient(
            endpoint=os.getenv("DOC_INTELLIGENCE_ENDPOINT"),
            credential=os.getenv("DOC_INTELLIGENCE_KEY")
        )
        
        # Analyser le document
        poller = doc_intelligence_client.begin_analyze_document(
            model_id="prebuilt-resume",  # Modèle pré-entraîné pour CV
            document=blob_url
        )
        result = poller.result()
        
        # Extraire les données structurées
        cv_data = extract_cv_data(result, job_description)
        
        # Sauvegarder dans Cosmos DB
        cosmos_client = CosmosClient.from_connection_string(
            os.getenv("COSMOS_CONNECTION_STRING")
        )
        database = cosmos_client.get_database_client(os.getenv("COSMOS_DATABASE_NAME"))
        container = database.get_container_client(os.getenv("COSMOS_CONTAINER_NAME"))
        
        analysis_item = {
            "id": file_id,
            "user_id": user_id,
            "status": "completed",
            "cv_data": cv_data,
            "score": cv_data.get("score", 0),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        container.upsert_item(analysis_item)
        
        logging.info(f'Analysis completed for file {file_id}')
        
    except Exception as e:
        logging.error(f'Error processing CV {file_id}: {str(e)}')
        # Mettre à jour le statut en erreur
        # ...

def extract_cv_data(result, job_description: str) -> Dict:
    """Extrait les données du CV depuis Document Intelligence"""
    # Implémentation de l'extraction basée sur le résultat de Document Intelligence
    # ... logique d'extraction ...
    return {}
```

### 3.3 Mettre à jour `requirements.txt`
```txt
# Ajouter ces dépendances
azure-storage-blob==12.19.0
azure-storage-queue==12.8.0
azure-cosmos==4.5.1
azure-ai-formrecognizer==3.3.2
```

---

## 🚀 Étape 4 : Déployer les applications

### 4.1 Déployer le backend

```bash
# Se placer dans le dossier backend
cd backend

# Créer un fichier .deployment (pour Azure)
echo "[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true" > .deployment

# Créer un fichier startup.sh pour Azure App Service
cat > startup.sh << 'EOF'
#!/bin/bash
gunicorn app.main:app --bind 0.0.0.0:8000 --workers 4 --worker-class uvicorn.workers.UvicornWorker
EOF
chmod +x startup.sh

# Configurer Azure pour utiliser le startup script
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP \
  --startup-file "startup.sh"

# Déployer avec ZIP
zip -r deploy.zip . -x "venv/*" "__pycache__/*" "*.pyc"
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP \
  --src deploy.zip
```

### 4.2 Déployer Azure Functions

```bash
cd azure-functions

# Installer les dépendances
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt

# Déployer
func azure functionapp publish $FUNCTION_APP
```

### 4.3 Déployer le frontend

#### Option A : Azure Static Web Apps (recommandé)
```bash
# Installer Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Build le frontend
cd ..
npm install
npm run build

# Déployer
swa deploy ./dist \
  --app-name cv-analysis-web \
  --resource-group $RESOURCE_GROUP \
  --deployment-token "VOTRE_DEPLOYMENT_TOKEN"
```

#### Option B : Azure App Service
```bash
# Build
npm run build

# Créer un fichier web.config pour Azure
cat > web.config << 'EOF'
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
EOF

# Déplacer web.config dans dist/
mv web.config dist/

# Déployer
cd dist
zip -r ../frontend-deploy.zip .
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $FRONTEND_APP \
  --src ../frontend-deploy.zip
```

---

## ✅ Étape 5 : Configuration finale et tests

### 5.1 Configurer CORS
```bash
# Dans le backend, les origines CORS sont déjà configurées via les App Settings
# Vérifier que le frontend peut appeler l'API
```

### 5.2 Tester les endpoints
```bash
# Backend health check
curl https://$BACKEND_APP.azurewebsites.net/health

# Test d'authentification
curl -X POST https://$BACKEND_APP.azurewebsites.net/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### 5.3 Vérifier les logs
```bash
# Logs du backend
az webapp log tail \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP

# Logs des Functions
az functionapp log tail \
  --resource-group $RESOURCE_GROUP \
  --name $FUNCTION_APP
```

---

## 📊 Coûts estimés (par mois)

- **Azure App Service (B1)** : ~13€/mois (x2 = 26€)
- **Azure Functions (Consumption)** : ~5-10€/mois (selon usage)
- **Azure Blob Storage (LRS)** : ~0.02€/GB (~1-5€/mois)
- **Azure Queue Storage** : ~0.05€/mois
- **Azure Cosmos DB (400 RU/s)** : ~24€/mois
- **Azure Document Intelligence (S0)** : ~0.15€/document (~15-50€/mois)
- **Total estimé** : ~80-115€/mois (pour usage modéré)

---

## 🔒 Sécurité

### Variables d'environnement sensibles
- Utiliser Azure Key Vault pour stocker les secrets
- Ne jamais commiter les clés dans le code

### Authentification
- JWT tokens avec expiration courte
- HTTPS obligatoire (activé par défaut sur App Service)

### Accès aux ressources
- Utiliser des Managed Identities quand possible
- Restreindre les accès réseau avec Network Security Groups

---

## 🎯 Prochaines étapes et optimisations

1. **Cache** : Ajouter Azure Redis Cache pour les résultats fréquents
2. **CDN** : Utiliser Azure CDN pour le frontend
3. **Monitoring** : Configurer Application Insights
4. **Alertes** : Créer des alertes pour les erreurs et la performance
5. **CI/CD** : Automatiser le déploiement avec Azure DevOps ou GitHub Actions
6. **Scalabilité** : Configurer l'auto-scaling pour les App Services
7. **Backup** : Configurer les sauvegardes automatiques de Cosmos DB

---

## 📚 Ressources et documentation

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [Azure Blob Storage Documentation](https://docs.microsoft.com/azure/storage/blobs/)
- [Azure Cosmos DB Documentation](https://docs.microsoft.com/azure/cosmos-db/)
- [Azure Document Intelligence Documentation](https://docs.microsoft.com/azure/applied-ai-services/form-recognizer/)

---

**Note** : Ce guide fournit une architecture de base. Vous devrez adapter le code selon vos besoins spécifiques et tester chaque composant individuellement avant le déploiement complet.

