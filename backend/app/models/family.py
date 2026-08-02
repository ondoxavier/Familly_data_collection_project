import uuid
from datetime import datetime, date
from sqlalchemy import String, Date, DateTime, Boolean, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


def uuid_str() -> str:
    return str(uuid.uuid4())


class Branch(Base):
    __tablename__ = "branches"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    branch_name: Mapped[str] = mapped_column(String(255), nullable=False)
    root_person_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    collector_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    collector_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    collector_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    access_token: Mapped[str] = mapped_column(String(255), unique=True, index=True, default=uuid_str)
    status: Mapped[str] = mapped_column(String(50), default="draft")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    persons = relationship("Person", back_populates="branch")


class Person(Base):
    __tablename__ = "persons"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    branch_id: Mapped[str] = mapped_column(String, ForeignKey("branches.id"), nullable=False)
    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    birth_date_text: Mapped[str | None] = mapped_column(String(100), nullable=True)
    birth_place: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_alive: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    death_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    death_date_text: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    branch = relationship("Branch", back_populates="persons")


class Union(Base):
    __tablename__ = "unions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    branch_id: Mapped[str] = mapped_column(String, ForeignKey("branches.id"), nullable=False)
    partner_1_id: Mapped[str] = mapped_column(String, ForeignKey("persons.id"), nullable=False)
    partner_2_id: Mapped[str] = mapped_column(String, ForeignKey("persons.id"), nullable=False)
    union_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    start_date_text: Mapped[str | None] = mapped_column(String(100), nullable=True)
    end_date_text: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (UniqueConstraint("partner_1_id", "partner_2_id", name="uq_union_partners"),)


class ParentChildLink(Base):
    __tablename__ = "parent_child_links"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    branch_id: Mapped[str] = mapped_column(String, ForeignKey("branches.id"), nullable=False)
    parent_id: Mapped[str] = mapped_column(String, ForeignKey("persons.id"), nullable=False)
    child_id: Mapped[str] = mapped_column(String, ForeignKey("persons.id"), nullable=False)
    link_type: Mapped[str] = mapped_column(String(50), default="biological")
    certainty: Mapped[str] = mapped_column(String(50), default="confirmed")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (UniqueConstraint("parent_id", "child_id", name="uq_parent_child"),)


class Remark(Base):
    __tablename__ = "remarks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    branch_id: Mapped[str] = mapped_column(String, ForeignKey("branches.id"), nullable=False)
    person_id: Mapped[str | None] = mapped_column(String, ForeignKey("persons.id"), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="to_verify")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
