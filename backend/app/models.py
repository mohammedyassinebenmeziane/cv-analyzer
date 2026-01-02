from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    analyses = relationship("Analysis", back_populates="owner")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cv_filename = Column(String, nullable=False)
    job_description = Column(Text, nullable=False)
    score = Column(Float, nullable=True)
    missing_skills = Column(Text, nullable=True)  # JSON string
    relevant_experience = Column(Text, nullable=True)  # JSON string
    irrelevant_experience = Column(Text, nullable=True)  # JSON string
    recommendations = Column(Text, nullable=True)  # JSON string
    languages = Column(Text, nullable=True)  # JSON string
    candidate_profile = Column(Text, nullable=True)  # JSON string (profil structuré complet)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner = relationship("User", back_populates="analyses")


