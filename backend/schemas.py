from pydantic import BaseModel
from typing import List, Optional

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ProjectCreate(BaseModel):
    topic: str
    document_type: str
    outline: List[str] = []

class SectionOut(BaseModel):
    id: int
    title: str
    generated_content: Optional[str] = ""
    comment: Optional[str]
    liked: Optional[bool]

    class Config:
        orm_mode = True

class ProjectOut(BaseModel):
    id: int
    topic: str
    document_type: str
    sections: List[SectionOut]

    class Config:
        orm_mode = True

class SectionRefine(BaseModel):
    section_id: int
    prompt: str
    comment: Optional[str] = None
