from datetime import date, datetime
from pydantic import BaseModel, Field


class BranchCreate(BaseModel):
    branch_name: str
    root_person_name: str | None = None
    collector_name: str | None = None
    collector_phone: str | None = None
    collector_email: str | None = None


class BranchRead(BranchCreate):
    id: str
    access_token: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PersonCreate(BaseModel):
    branch_id: str
    first_name: str
    last_name: str | None = None
    gender: str | None = Field(default=None, description="M, F ou unknown")
    birth_date: date | None = None
    birth_date_text: str | None = None
    birth_place: str | None = None
    is_alive: bool | None = None
    death_date: date | None = None
    death_date_text: str | None = None
    notes: str | None = None


class PersonRead(PersonCreate):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UnionCreate(BaseModel):
    branch_id: str
    partner_1_id: str
    partner_2_id: str
    union_type: str | None = None
    start_date_text: str | None = None
    end_date_text: str | None = None
    notes: str | None = None


class UnionRead(UnionCreate):
    id: str

    model_config = {"from_attributes": True}


class ParentChildCreate(BaseModel):
    branch_id: str
    parent_id: str
    child_id: str
    link_type: str = "biological"
    certainty: str = "confirmed"
    notes: str | None = None


class ParentChildRead(ParentChildCreate):
    id: str

    model_config = {"from_attributes": True}


class RemarkCreate(BaseModel):
    branch_id: str
    person_id: str | None = None
    content: str
    status: str = "to_verify"


class RemarkRead(RemarkCreate):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}
