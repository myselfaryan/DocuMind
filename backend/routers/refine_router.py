from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Section, Refinement
from schemas import SectionRefine
from utils.jwt_handler import decode_token
from services.ai_service import refine_content
from datetime import datetime

router = APIRouter(tags=["Refine"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def auth(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid authorization header")
    token = authorization.replace("Bearer ", "")
    decoded = decode_token(token)
    if not decoded:
        raise HTTPException(401, "Invalid token")
    return decoded["user_id"]

@router.post("/refine")
def refine_section(data: SectionRefine, user_id=Depends(auth), db: Session = Depends(get_db)):
    section = db.query(Section).filter(Section.id == data.section_id).first()
    if not section:
        raise HTTPException(404, "Section not found")

    # Generate refined content
    new_content = refine_content(section.generated_content, data.prompt)
    
    # Create a new Refinement record
    refinement = Refinement(
        section_id=section.id,
        prompt=data.prompt,
        refined_content=new_content,
        created_at=datetime.utcnow()
    )
    db.add(refinement)
    
    # Update the section's current content
    section.generated_content = new_content
    
    db.commit()
    db.refresh(refinement)
    
    return refinement

@router.get("/section/{section_id}/refinements")
def get_section_refinements(section_id: int, user_id=Depends(auth), db: Session = Depends(get_db)):
    # Verify section exists (optional, but good practice)
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        raise HTTPException(404, "Section not found")
        
    refinements = db.query(Refinement).filter(Refinement.section_id == section_id).order_by(Refinement.created_at.desc()).all()
    return refinements
