from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Project, Section
from schemas import ProjectCreate, ProjectOut
from utils.jwt_handler import decode_token
from services.ai_service import generate_section_content

router = APIRouter(prefix="/project", tags=["Project"])

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

@router.post("/create")
def create_project(data: ProjectCreate, user_id=Depends(auth), db: Session = Depends(get_db)):
    project = Project(
        user_id=user_id,
        topic=data.topic,
        document_type=data.document_type
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    for section_title in data.outline:
        sec = Section(project_id=project.id, title=section_title, generated_content="")
        db.add(sec)
    db.commit()

    return {"project_id": project.id}

from pydantic import BaseModel

class GenerateRequest(BaseModel):
    section_titles: List[str] = []

@router.post("/{project_id}/generate", response_model=ProjectOut)
def generate_all(project_id: int, request: GenerateRequest, user_id=Depends(auth), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
    if not project:
        raise HTTPException(404, "Project not found")

    # If section titles are provided, add them if they don't exist
    if request.section_titles:
        existing_titles = [s.title for s in project.sections]
        for title in request.section_titles:
            if title not in existing_titles:
                new_sec = Section(project_id=project.id, title=title, generated_content="")
                db.add(new_sec)
        db.commit()
        db.refresh(project)

    for sec in project.sections:
        if not sec.generated_content:
            sec.generated_content = generate_section_content(sec.title)
    db.commit()
    db.refresh(project)

    return project

@router.get("/list", response_model=List[ProjectOut])
def list_projects(user_id=Depends(auth), db: Session = Depends(get_db)):
    projects = db.query(Project).filter(Project.user_id == user_id).all()
    return projects

@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, user_id=Depends(auth), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
    if not project:
        raise HTTPException(404, "Project not found")

    return project

@router.delete("/{project_id}")
def delete_project(project_id: int, user_id=Depends(auth), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
    if not project:
        raise HTTPException(404, "Project not found")
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}
