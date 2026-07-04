from pathlib import Path
import pandas as pd
from sqlalchemy.orm import Session
from app.models.family import Branch, Person, Union, ParentChildLink, Remark


def export_branch_to_csv(db: Session, branch_id: str, output_dir: str | Path) -> dict[str, str]:
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    tables = {
        "branches": db.query(Branch).filter(Branch.id == branch_id).all(),
        "persons": db.query(Person).filter(Person.branch_id == branch_id).all(),
        "unions": db.query(Union).filter(Union.branch_id == branch_id).all(),
        "parent_child_links": db.query(ParentChildLink).filter(ParentChildLink.branch_id == branch_id).all(),
        "remarks": db.query(Remark).filter(Remark.branch_id == branch_id).all(),
    }

    files = {}
    for table_name, rows in tables.items():
        records = [row.__dict__ for row in rows]
        for record in records:
            record.pop("_sa_instance_state", None)
        file_path = output_path / f"{table_name}.csv"
        pd.DataFrame(records).to_csv(file_path, index=False, encoding="utf-8-sig")
        files[table_name] = str(file_path)

    return files
