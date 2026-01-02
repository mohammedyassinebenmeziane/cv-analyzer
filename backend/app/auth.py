from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Union
from . import models, database
import os
import hashlib
import bcrypt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 jours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def _pre_hash_password(password: str) -> bytes:
    """
    Pré-hash le mot de passe avec SHA-256 pour éviter la limite de 72 bytes de bcrypt.
    Retourne des bytes pour une compatibilité directe avec bcrypt.
    """
    return hashlib.sha256(password.encode('utf-8')).digest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifie un mot de passe en pré-hashant d'abord avec SHA-256.
    Compatible avec les anciens hachages passlib et les nouveaux hachages directs.
    """
    if not plain_password or not hashed_password:
        return False
    
    pre_hashed = _pre_hash_password(plain_password)
    
    # S'assurer que hashed_password est une string
    if isinstance(hashed_password, bytes):
        hashed_bytes = hashed_password
    else:
        hashed_bytes = hashed_password.encode('utf-8')
    
    # Utiliser directement bcrypt pour la vérification
    try:
        result = bcrypt.checkpw(pre_hashed, hashed_bytes)
        if result:
            return True
    except (ValueError, Exception) as e:
        print(f"Erreur bcrypt.checkpw: {str(e)}")
    
    # En cas d'erreur, essayer avec passlib (pour compatibilité ascendante)
    try:
        pre_hashed_hex = pre_hashed.hex()
        result = pwd_context.verify(pre_hashed_hex, hashed_password)
        if result:
            return True
    except (ValueError, Exception) as e:
        print(f"Erreur pwd_context.verify: {str(e)}")
    
    # Dernier recours : essayer de vérifier directement avec le mot de passe en clair (pour les anciens hachages)
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        if result:
            return True
    except (ValueError, Exception) as e:
        print(f"Erreur pwd_context.verify (plain): {str(e)}")
    
    return False

def get_password_hash(password: str) -> str:
    """
    Hash un mot de passe en pré-hashant d'abord avec SHA-256 pour éviter
    la limite de 72 bytes de bcrypt. Utilise directement bcrypt pour éviter
    les problèmes de passlib.
    """
    pre_hashed = _pre_hash_password(password)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pre_hashed, salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    try:
        user = get_user_by_email(db, email)
        if not user:
            print(f"Utilisateur non trouvé pour l'email: {email}")
            return False
        
        # Vérifier le mot de passe
        password_valid = verify_password(password, user.hashed_password)
        if not password_valid:
            print(f"Mot de passe incorrect pour l'email: {email}")
            return False
        
        return user
    except Exception as e:
        print(f"Erreur lors de l'authentification: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def get_current_user(
    token: Union[str, None] = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

