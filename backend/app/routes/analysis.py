from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import ast
from .. import database, models, schemas, auth
from ..auth import get_current_user

router = APIRouter(prefix="/analysis", tags=["analysis"])

def parse_json_string(json_str: str):
    """Parse une chaîne JSON ou liste Python en liste Python"""
    if not json_str:
        return []
    try:
        # Essayer de parser comme JSON
        import json
        return json.loads(json_str)
    except:
        try:
            # Essayer de parser comme liste Python
            return ast.literal_eval(json_str)
        except:
            return []

@router.get("/", response_model=List[schemas.AnalysisListItem])
async def list_analyses(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Récupère toutes les analyses de l'utilisateur connecté"""
    analyses = db.query(models.Analysis).filter(
        models.Analysis.user_id == current_user.id
    ).order_by(models.Analysis.created_at.desc()).all()
    
    return [
        {
            "id": analysis.id,
            "cv_filename": analysis.cv_filename,
            "score": analysis.score,
            "created_at": analysis.created_at
        }
        for analysis in analyses
    ]

@router.get("/{analysis_id}", response_model=schemas.AnalysisResponse)
async def get_analysis(
    analysis_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Récupérer l'analyse
    analysis = db.query(models.Analysis).filter(
        models.Analysis.id == analysis_id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analyse non trouvée"
        )
    
    # Vérifier que l'utilisateur est le propriétaire
    if analysis.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas accès à cette analyse"
        )
    
    # Convertir les chaînes JSON en listes
    import json
    candidate_profile = None
    if hasattr(analysis, 'candidate_profile') and analysis.candidate_profile:
        try:
            candidate_profile = json.loads(analysis.candidate_profile)
            
            # FORCER le recalcul du score_correspondance avec la nouvelle logique IA
            # Ceci garantit que même les anciennes analyses utilisent la nouvelle logique
            if candidate_profile and analysis.job_description:
                from .. import cv_analyzer
                analyzer = cv_analyzer.CVAnalyzer()
                
                print(f"[DEBUG] Recalcul du score pour l'analyse {analysis_id}")
                print(f"[DEBUG] Description du poste: {analysis.job_description[:100]}...")
                
                # Recalculer le score avec la description du poste (NOUVELLE LOGIQUE IA)
                new_score = analyzer._calculate_match_score(candidate_profile, analysis.job_description)
                
                print(f"[DEBUG] Nouveau score calculé: {new_score} (ancien: {candidate_profile.get('score_correspondance', 'N/A')})")
                
                # Mettre à jour le score dans le profil (TOUJOURS, même si déjà présent)
                candidate_profile["score_correspondance"] = new_score
                
                # Sauvegarder le nouveau score dans la base de données pour éviter de recalculer à chaque fois
                try:
                    analysis.candidate_profile = json.dumps(candidate_profile, ensure_ascii=False)
                    db.commit()
                    print(f"[DEBUG] Score sauvegardé dans la base de données")
                except Exception as save_error:
                    print(f"[WARNING] Erreur lors de la sauvegarde du score: {save_error}")
                    db.rollback()
        except Exception as e:
            import traceback
            print(f"[ERROR] Erreur lors du parsing/recalcul du candidate_profile: {e}")
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            candidate_profile = None
    
    return {
        "id": analysis.id,
        "score": analysis.score,
        "missing_skills": parse_json_string(analysis.missing_skills),
        "relevant_experience": parse_json_string(analysis.relevant_experience),
        "irrelevant_experience": parse_json_string(analysis.irrelevant_experience),
        "recommendations": parse_json_string(analysis.recommendations),
        "languages": parse_json_string(analysis.languages) if hasattr(analysis, 'languages') else [],
        "candidate_profile": candidate_profile,
        "created_at": analysis.created_at
    }

