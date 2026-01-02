from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import asyncio
from concurrent.futures import ThreadPoolExecutor
from .. import database, models, schemas, auth, cv_analyzer
from ..database import SessionLocal
from ..auth import get_current_user

router = APIRouter(prefix="/cv", tags=["cv"])

# Créer le dossier uploads s'il n'existe pas
# Utiliser un chemin absolu pour éviter les problèmes de chemin relatif
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Semaphore pour limiter le nombre de requêtes simultanées (évite la surcharge)
# Maximum 3 analyses simultanées (réduit pour éviter les blocages SQLite)
MAX_CONCURRENT_ANALYSES = 3
analysis_semaphore = asyncio.Semaphore(MAX_CONCURRENT_ANALYSES)

# Executor partagé pour toutes les analyses
_shared_executor = None

def get_executor():
    """Retourne l'executor partagé, le créant si nécessaire"""
    global _shared_executor
    if _shared_executor is None:
        _shared_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="cv_analyzer")
    return _shared_executor

@router.post("/upload", response_model=schemas.AnalysisCreate)
async def upload_cv(
    cv_file: UploadFile = File(...),
    job_description: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Vérifier que le fichier a un nom
    if not cv_file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le fichier doit avoir un nom."
        )
    
    # Vérifier le type de fichier
    file_extension = os.path.splitext(cv_file.filename)[1].lower()
    allowed_extensions = ['.pdf', '.docx', '.doc']
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format de fichier non supporté. Utilisez PDF ou DOCX."
        )
    
    # Sauvegarder l'ID utilisateur avant de libérer la session
    user_id = current_user.id
    cv_filename = cv_file.filename
    
    # Note: La session sera automatiquement fermée par get_db() après le yield
    # On ne ferme pas manuellement pour éviter la double fermeture
    
    # Note: La vérification de taille se fera après la lecture du fichier
    
    # Sauvegarder le fichier
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
    
    try:
        # Lire le contenu du fichier
        content = await cv_file.read()
        
        # Vérifier la taille (max 10MB)
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le fichier est trop volumineux. Taille maximale : 10MB"
            )
        
        # Sauvegarder le fichier
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        # Le fichier est maintenant fermé
        
        # Utiliser le semaphore pour limiter les requêtes simultanées
        async with analysis_semaphore:
            # Analyser le CV de manière asynchrone avec timeout
            analyzer = cv_analyzer.CVAnalyzer()
            
            # Utiliser l'executor partagé au lieu d'en créer un nouveau
            executor = get_executor()
            loop = asyncio.get_event_loop()
            
            try:
                # Extraction du texte avec timeout de 30 secondes
                cv_text = await asyncio.wait_for(
                    loop.run_in_executor(executor, analyzer.extract_text, file_path, file_extension),
                    timeout=30.0
                )
                
                # Analyse du CV avec timeout de 60 secondes (optimisé - devrait prendre < 10s maintenant)
                analysis_result = await asyncio.wait_for(
                    loop.run_in_executor(executor, analyzer.analyze_cv, cv_text, job_description),
                    timeout=60.0
                )
            except asyncio.TimeoutError:
                raise HTTPException(
                    status_code=status.HTTP_408_REQUEST_TIMEOUT,
                    detail="L'analyse du CV a pris trop de temps. Veuillez réessayer."
                )
            except Exception as e:
                import traceback
                error_trace = traceback.format_exc()
                print(f"Erreur détaillée lors de l'analyse du CV: {error_trace}")
                # Nettoyer le fichier en cas d'erreur
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except Exception as cleanup_error:
                        print(f"Erreur lors du nettoyage du fichier: {cleanup_error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erreur lors de l'analyse: {str(e)}"
                )
        
        # Créer une NOUVELLE session de base de données pour sauvegarder les résultats
        # Cela évite de garder une connexion ouverte pendant toute l'analyse
        import json
        db_new = SessionLocal()
        try:
            # S'assurer que le résultat contient tous les champs nécessaires
            if not analysis_result or "score" not in analysis_result:
                raise ValueError("Le résultat de l'analyse est invalide ou incomplet")
            
            db_analysis = models.Analysis(
                user_id=user_id,
                cv_filename=cv_filename,
                job_description=job_description,
                score=float(analysis_result.get("score", 0.0)),
                missing_skills=str(analysis_result.get("missing_skills", [])),
                relevant_experience=str(analysis_result.get("relevant_experience", [])),
                irrelevant_experience=str(analysis_result.get("irrelevant_experience", [])),
                recommendations=str(analysis_result.get("recommendations", [])),
                languages=str(analysis_result.get("languages", [])),
                candidate_profile=json.dumps(analysis_result.get("candidate_profile", {}), ensure_ascii=False)
            )
            db_new.add(db_analysis)
            db_new.commit()
            db_new.refresh(db_analysis)
            analysis_id = db_analysis.id
        except Exception as db_error:
            db_new.rollback()
            import traceback
            error_trace = traceback.format_exc()
            print(f"Erreur détaillée lors de l'enregistrement en base de données: {error_trace}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur lors de l'enregistrement en base de données: {str(db_error)}"
            )
        finally:
            db_new.close()
        
        # Supprimer le fichier temporaire
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as cleanup_error:
            print(f"Erreur lors de la suppression du fichier temporaire: {cleanup_error}")
            # Ne pas faire échouer la requête si le fichier ne peut pas être supprimé
        
        return {"analysis_id": analysis_id}
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Nettoyer en cas d'erreur
        if 'file_path' in locals() and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as cleanup_error:
                print(f"Erreur lors du nettoyage du fichier: {cleanup_error}")
        import traceback
        error_trace = traceback.format_exc()
        print(f"Erreur générale lors de l'upload du CV: {error_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'analyse du CV: {str(e)}"
        )

async def process_single_cv(
    cv_file: UploadFile,
    job_description: str,
    user_id: int,
    file_id: str
) -> dict:
    """Traite un seul CV et retourne le résultat"""
    try:
        # Vérifier que le fichier a un nom
        if not cv_file.filename:
            return {"success": False, "filename": "unknown", "error": "Le fichier doit avoir un nom."}
        
        # Vérifier le type de fichier
        file_extension = os.path.splitext(cv_file.filename)[1].lower()
        allowed_extensions = ['.pdf', '.docx', '.doc']
        
        if file_extension not in allowed_extensions:
            return {"success": False, "filename": cv_file.filename, "error": "Format de fichier non supporté. Utilisez PDF ou DOCX."}
        
        cv_filename = cv_file.filename
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
        
        # Lire le contenu du fichier
        content = await cv_file.read()
        
        # Vérifier la taille (max 10MB)
        if len(content) > 10 * 1024 * 1024:
            return {"success": False, "filename": cv_filename, "error": "Le fichier est trop volumineux. Taille maximale : 10MB"}
        
        # Sauvegarder le fichier
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Utiliser le semaphore pour limiter les requêtes simultanées
        async with analysis_semaphore:
            analyzer = cv_analyzer.CVAnalyzer()
            executor = get_executor()
            loop = asyncio.get_event_loop()
            
            try:
                # Extraction du texte avec timeout
                cv_text = await asyncio.wait_for(
                    loop.run_in_executor(executor, analyzer.extract_text, file_path, file_extension),
                    timeout=30.0
                )
                
                # Analyse du CV avec timeout
                analysis_result = await asyncio.wait_for(
                    loop.run_in_executor(executor, analyzer.analyze_cv, cv_text, job_description),
                    timeout=60.0
                )
            except asyncio.TimeoutError:
                if os.path.exists(file_path):
                    os.remove(file_path)
                return {"success": False, "filename": cv_filename, "error": "L'analyse du CV a pris trop de temps."}
            except Exception as e:
                if os.path.exists(file_path):
                    os.remove(file_path)
                return {"success": False, "filename": cv_filename, "error": f"Erreur lors de l'analyse: {str(e)}"}
        
        # Sauvegarder en base de données
        import json
        db_new = SessionLocal()
        try:
            if not analysis_result or "score" not in analysis_result:
                if os.path.exists(file_path):
                    os.remove(file_path)
                return {"success": False, "filename": cv_filename, "error": "Le résultat de l'analyse est invalide"}
            
            db_analysis = models.Analysis(
                user_id=user_id,
                cv_filename=cv_filename,
                job_description=job_description,
                score=float(analysis_result.get("score", 0.0)),
                missing_skills=str(analysis_result.get("missing_skills", [])),
                relevant_experience=str(analysis_result.get("relevant_experience", [])),
                irrelevant_experience=str(analysis_result.get("irrelevant_experience", [])),
                recommendations=str(analysis_result.get("recommendations", [])),
                languages=str(analysis_result.get("languages", [])),
                candidate_profile=json.dumps(analysis_result.get("candidate_profile", {}), ensure_ascii=False)
            )
            db_new.add(db_analysis)
            db_new.commit()
            db_new.refresh(db_analysis)
            analysis_id = db_analysis.id
        except Exception as db_error:
            db_new.rollback()
            if os.path.exists(file_path):
                os.remove(file_path)
            return {"success": False, "filename": cv_filename, "error": f"Erreur lors de l'enregistrement: {str(db_error)}"}
        finally:
            db_new.close()
        
        # Supprimer le fichier temporaire
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass
        
        return {
            "success": True,
            "id": analysis_id,
            "cv_filename": cv_filename,
            "score": float(analysis_result.get("score", 0.0)),
            "created_at": db_analysis.created_at
        }
        
    except Exception as e:
        if 'file_path' in locals() and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        return {"success": False, "filename": cv_file.filename if cv_file.filename else "unknown", "error": f"Erreur: {str(e)}"}

@router.post("/bulk-upload", response_model=schemas.BulkUploadResponse)
async def bulk_upload_cvs(
    cv_files: List[UploadFile] = File(...),
    job_description: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Upload et analyse plusieurs CVs en parallèle"""
    
    # Limite de 10 fichiers
    MAX_FILES = 10
    if len(cv_files) > MAX_FILES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_FILES} fichiers autorisés par upload"
        )
    
    if len(cv_files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucun fichier fourni"
        )
    
    if not job_description or not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La description du poste est requise"
        )
    
    user_id = current_user.id
    
    # Traiter tous les fichiers en parallèle
    tasks = []
    for idx, cv_file in enumerate(cv_files):
        file_id = str(uuid.uuid4())
        task = process_single_cv(cv_file, job_description, user_id, file_id)
        tasks.append(task)
    
    # Attendre que toutes les analyses soient terminées
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Traiter les résultats
    successful_analyses = []
    successful_count = 0
    failed_count = 0
    
    for result in results:
        if isinstance(result, Exception):
            failed_count += 1
            continue
        
        if result.get("success"):
            successful_analyses.append(schemas.AnalysisListItem(
                id=result["id"],
                cv_filename=result["cv_filename"],
                score=result.get("score"),
                created_at=result["created_at"]
            ))
            successful_count += 1
        else:
            failed_count += 1
    
    # Trier par score décroissant
    successful_analyses.sort(key=lambda x: x.score if x.score is not None else 0, reverse=True)
    
    return schemas.BulkUploadResponse(
        analyses=successful_analyses,
        total=len(cv_files),
        successful=successful_count,
        failed=failed_count
    )

