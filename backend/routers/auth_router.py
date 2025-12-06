from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User, Base
from schemas import UserCreate, UserLogin
from utils.jwt_handler import create_token

Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(400, "User already exists")

    new_user = User(email=user.email, password_hash=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_token(new_user.id)
    return {"message": "User registered", "user_id": new_user.id, "token": token}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or user.password != db_user.password_hash:
        raise HTTPException(401, "Invalid credentials")

    token = create_token(db_user.id)
    return {"token": token}
