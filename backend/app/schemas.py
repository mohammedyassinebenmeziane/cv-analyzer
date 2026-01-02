from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime

# Schemas pour l'authentification
class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Schémas pour le profil structuré du candidat (définis en premier)
class CandidateIdentity(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    ville: Optional[str] = None
    pays: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    titre_profil: Optional[str] = None

class ProfessionalSummary(BaseModel):
    resume: Optional[str] = None
    domaine_principal: Optional[str] = None
    niveau: Optional[str] = None  # Junior / Confirmé / Senior
    objectif_professionnel: Optional[str] = None

class TechnicalSkills(BaseModel):
    langages: List[str] = []
    frameworks: List[str] = []
    outils: List[str] = []
    cloud: List[str] = []
    ia_data: List[str] = []
    securite: List[str] = []

class Experience(BaseModel):
    intitule_poste: Optional[str] = None
    entreprise: Optional[str] = None
    periode: Optional[str] = None
    missions: List[str] = []
    technologies: List[str] = []

class Stage(BaseModel):
    intitule: Optional[str] = None
    duree: Optional[str] = None
    missions: List[str] = []
    technologies: List[str] = []

class Projet(BaseModel):
    nom: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = []
    resultats: Optional[str] = None

class Formation(BaseModel):
    diplome: Optional[str] = None
    domaine: Optional[str] = None
    etablissement: Optional[str] = None
    annees: Optional[str] = None

class Certification(BaseModel):
    nom: Optional[str] = None
    organisme: Optional[str] = None
    annee: Optional[str] = None

class Langue(BaseModel):
    langue: Optional[str] = None
    niveau: Optional[str] = None  # Débutant / Intermédiaire / Avancé / Fluent

class CandidateProfile(BaseModel):
    identite: Optional[CandidateIdentity] = None
    resume_professionnel: Optional[ProfessionalSummary] = None
    competences_techniques: Optional[TechnicalSkills] = None
    experiences_professionnelles: List[Experience] = []
    stages_alternances: List[Stage] = []
    projets: List[Projet] = []
    formation: List[Formation] = []
    certifications: List[Certification] = []
    langues: List[Langue] = []
    soft_skills: List[str] = []
    score_correspondance: Optional[float] = None

# Schemas pour l'analyse (définis après CandidateProfile)
class AnalysisResponse(BaseModel):
    id: int
    score: Optional[float] = None
    missing_skills: Optional[List[str]] = None
    relevant_experience: Optional[List[str]] = None
    irrelevant_experience: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    candidate_profile: Optional[CandidateProfile] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AnalysisCreate(BaseModel):
    analysis_id: int

class AnalysisListItem(BaseModel):
    id: int
    cv_filename: str
    score: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class BulkUploadResponse(BaseModel):
    analyses: List[AnalysisListItem]
    total: int
    successful: int
    failed: int
