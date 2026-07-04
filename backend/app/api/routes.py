from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.family import Branch, Person, Union, ParentChildLink, Remark
from app.schemas.family import (
    BranchCreate, BranchRead,
    PersonCreate, PersonRead,
    UnionCreate, UnionRead,
    ParentChildCreate, ParentChildRead,
    RemarkCreate, RemarkRead,
)
from app.services.export_service import export_branch_to_csv
from app.services.duplicate_service import find_potential_duplicates

router = APIRouter()


def get_branch_or_404(branch_id: str, db: Session) -> Branch:
    branch = db.get(Branch, branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branche introuvable")
    return branch


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.post("/branches", response_model=BranchRead)
def create_branch(payload: BranchCreate, db: Session = Depends(get_db)):
    branch = Branch(**payload.model_dump())
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


@router.get("/branches", response_model=list[BranchRead])
def list_branches(db: Session = Depends(get_db)):
    return db.query(Branch).order_by(Branch.created_at.desc()).all()


@router.get("/branches/token/{access_token}", response_model=BranchRead)
def get_branch_by_token(access_token: str, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.access_token == access_token).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branche introuvable")
    return branch


@router.patch("/branches/{branch_id}/submit", response_model=BranchRead)
def submit_branch(branch_id: str, db: Session = Depends(get_db)):
    branch = get_branch_or_404(branch_id, db)
    branch.status = "submitted"
    db.commit()
    db.refresh(branch)
    return branch


@router.post("/persons", response_model=PersonRead)
def create_person(payload: PersonCreate, db: Session = Depends(get_db)):
    person = Person(**payload.model_dump())
    db.add(person)
    db.commit()
    db.refresh(person)
    return person


@router.get("/branches/{branch_id}/persons", response_model=list[PersonRead])
def list_persons(branch_id: str, db: Session = Depends(get_db)):
    get_branch_or_404(branch_id, db)
    return db.query(Person).filter(Person.branch_id == branch_id).order_by(Person.last_name, Person.first_name).all()


@router.post("/unions", response_model=UnionRead)
def create_union(payload: UnionCreate, db: Session = Depends(get_db)):
    union = Union(**payload.model_dump())
    db.add(union)
    db.commit()
    db.refresh(union)
    return union


@router.get("/branches/{branch_id}/unions", response_model=list[UnionRead])
def list_unions(branch_id: str, db: Session = Depends(get_db)):
    get_branch_or_404(branch_id, db)
    return db.query(Union).filter(Union.branch_id == branch_id).all()


@router.post("/parent-child", response_model=ParentChildRead)
def create_parent_child_link(payload: ParentChildCreate, db: Session = Depends(get_db)):
    link = ParentChildLink(**payload.model_dump())
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


@router.get("/branches/{branch_id}/parent-child", response_model=list[ParentChildRead])
def list_parent_child_links(branch_id: str, db: Session = Depends(get_db)):
    get_branch_or_404(branch_id, db)
    return db.query(ParentChildLink).filter(ParentChildLink.branch_id == branch_id).all()


@router.post("/remarks", response_model=RemarkRead)
def create_remark(payload: RemarkCreate, db: Session = Depends(get_db)):
    remark = Remark(**payload.model_dump())
    db.add(remark)
    db.commit()
    db.refresh(remark)
    return remark


@router.get("/branches/{branch_id}/remarks", response_model=list[RemarkRead])
def list_remarks(branch_id: str, db: Session = Depends(get_db)):
    get_branch_or_404(branch_id, db)
    return db.query(Remark).filter(Remark.branch_id == branch_id).order_by(Remark.created_at.desc()).all()


@router.get("/branches/{branch_id}/summary")
def get_branch_summary(branch_id: str, db: Session = Depends(get_db)):
    branch = get_branch_or_404(branch_id, db)
    return {
        "branch": BranchRead.model_validate(branch),
        "persons_count": db.query(Person).filter(Person.branch_id == branch_id).count(),
        "unions_count": db.query(Union).filter(Union.branch_id == branch_id).count(),
        "parent_child_links_count": db.query(ParentChildLink).filter(ParentChildLink.branch_id == branch_id).count(),
        "remarks_count": db.query(Remark).filter(Remark.branch_id == branch_id).count(),
    }


@router.post("/branches/{branch_id}/export")
def export_branch(branch_id: str, db: Session = Depends(get_db)):
    get_branch_or_404(branch_id, db)
    output_dir = Path("exports") / branch_id
    return {"files": export_branch_to_csv(db, branch_id, output_dir)}


@router.get("/duplicates")
def list_duplicates(db: Session = Depends(get_db)):
    return find_potential_duplicates(db)


@router.get("/branches/{branch_id}/duplicates")
def list_branch_duplicates(branch_id: str, db: Session = Depends(get_db)):
    get_branch_or_404(branch_id, db)
    return find_potential_duplicates(db, branch_id=branch_id)
