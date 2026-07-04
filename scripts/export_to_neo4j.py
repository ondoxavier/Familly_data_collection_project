"""Importe les branches collectees dans Neo4j pour preparer le futur Graph RAG familial.

Remplace le flux manuel (export CSV puis LOAD CSV, cf. database/neo4j_import.cypher)
par un import direct depuis la base de collecte, avec des requetes MERGE idempotentes :
le script peut etre relance sans dupliquer les noeuds ou relations.

Par defaut, seules les branches au statut 'submitted' sont importees (donnees deja
controlees par l'administrateur, cf. docs/systeme_collecte.md).

Usage :
    python scripts/export_to_neo4j.py
    python scripts/export_to_neo4j.py --branch-id <id>
    python scripts/export_to_neo4j.py --all-statuses

Variables d'environnement requises :
    DATABASE_URL    URL SQLAlchemy de la base de collecte (definie dans backend/.env)
    NEO4J_URI       ex: bolt://localhost:7687
    NEO4J_USER      ex: neo4j
    NEO4J_PASSWORD
"""

import argparse
import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(BACKEND_DIR / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env")

from neo4j import GraphDatabase  # noqa: E402

from app.db.session import SessionLocal  # noqa: E402
from app.models.family import Branch, ParentChildLink, Person, Union  # noqa: E402


def fetch_branches(db, branch_id: str | None, all_statuses: bool) -> list[Branch]:
    query = db.query(Branch)
    if branch_id:
        return query.filter(Branch.id == branch_id).all()
    if all_statuses:
        return query.all()
    return query.filter(Branch.status == "submitted").all()


def import_branch(tx, branch: Branch, persons: list[Person], unions: list[Union], links: list[ParentChildLink]):
    tx.run(
        "MERGE (b:Branch {id: $id}) "
        "SET b.name = $name, b.root_person_name = $root_person_name, b.status = $status",
        id=branch.id,
        name=branch.branch_name,
        root_person_name=branch.root_person_name,
        status=branch.status,
    )

    for person in persons:
        tx.run(
            "MERGE (p:Person {id: $id}) "
            "SET p.first_name = $first_name, p.last_name = $last_name, p.gender = $gender, "
            "    p.birth_date_text = $birth_date_text, p.birth_place = $birth_place, "
            "    p.is_alive = $is_alive, p.notes = $notes "
            "WITH p "
            "MATCH (b:Branch {id: $branch_id}) "
            "MERGE (p)-[:BELONGS_TO_BRANCH]->(b)",
            id=person.id,
            first_name=person.first_name,
            last_name=person.last_name,
            gender=person.gender,
            birth_date_text=person.birth_date_text,
            birth_place=person.birth_place,
            is_alive=person.is_alive,
            notes=person.notes,
            branch_id=branch.id,
        )

    for union in unions:
        tx.run(
            "MATCH (p1:Person {id: $partner_1_id}) "
            "MATCH (p2:Person {id: $partner_2_id}) "
            "MERGE (p1)-[r:SPOUSE_OF]->(p2) "
            "SET r.union_type = $union_type, r.start_date_text = $start_date_text, "
            "    r.end_date_text = $end_date_text, r.notes = $notes",
            partner_1_id=union.partner_1_id,
            partner_2_id=union.partner_2_id,
            union_type=union.union_type,
            start_date_text=union.start_date_text,
            end_date_text=union.end_date_text,
            notes=union.notes,
        )

    for link in links:
        tx.run(
            "MATCH (parent:Person {id: $parent_id}) "
            "MATCH (child:Person {id: $child_id}) "
            "MERGE (parent)-[r:PARENT_OF]->(child) "
            "SET r.link_type = $link_type, r.certainty = $certainty, r.notes = $notes",
            parent_id=link.parent_id,
            child_id=link.child_id,
            link_type=link.link_type,
            certainty=link.certainty,
            notes=link.notes,
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--branch-id", help="N'importer qu'une seule branche")
    parser.add_argument(
        "--all-statuses",
        action="store_true",
        help="Importer aussi les branches non soumises (par defaut, seules les branches 'submitted' sont importees)",
    )
    args = parser.parse_args()

    neo4j_uri = os.environ["NEO4J_URI"]
    neo4j_user = os.environ["NEO4J_USER"]
    neo4j_password = os.environ["NEO4J_PASSWORD"]

    db = SessionLocal()
    driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
    try:
        branches = fetch_branches(db, args.branch_id, args.all_statuses)
        if not branches:
            print("Aucune branche a importer.")
            return

        with driver.session() as session:
            for branch in branches:
                persons = db.query(Person).filter(Person.branch_id == branch.id).all()
                unions = db.query(Union).filter(Union.branch_id == branch.id).all()
                links = db.query(ParentChildLink).filter(ParentChildLink.branch_id == branch.id).all()
                session.execute_write(import_branch, branch, persons, unions, links)
                print(f"Branche importee : {branch.branch_name} ({len(persons)} personnes)")
    finally:
        driver.close()
        db.close()


if __name__ == "__main__":
    main()
