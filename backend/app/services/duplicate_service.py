import unicodedata

from sqlalchemy.orm import Session

from app.models.family import Branch, Person


def _normalize(value: str | None) -> str:
    if not value:
        return ""
    text = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return " ".join(text.lower().split())


def find_potential_duplicates(db: Session, branch_id: str | None = None) -> list[dict]:
    """Group persons that share the same normalized name and birth info.

    Compares across branches by default so the same person reported by two
    different chefs de famille (e.g. a shared grandchild) can be reconciled
    before the data feeds the family graph.
    """
    query = db.query(Person)
    if branch_id:
        query = query.filter(Person.branch_id == branch_id)
    persons = query.all()

    branch_names = {branch.id: branch.branch_name for branch in db.query(Branch).all()}

    groups: dict[tuple[str, str, str], list[Person]] = {}
    for person in persons:
        key = (
            _normalize(person.first_name),
            _normalize(person.last_name),
            _normalize(person.birth_date_text),
        )
        if not key[0]:
            continue
        groups.setdefault(key, []).append(person)

    duplicates = []
    for (first_name, last_name, birth_date_text), group in groups.items():
        if len(group) < 2:
            continue
        duplicates.append(
            {
                "first_name": first_name,
                "last_name": last_name,
                "birth_date_text": birth_date_text,
                "persons": [
                    {
                        "id": person.id,
                        "branch_id": person.branch_id,
                        "branch_name": branch_names.get(person.branch_id),
                        "first_name": person.first_name,
                        "last_name": person.last_name,
                        "birth_date_text": person.birth_date_text,
                        "birth_place": person.birth_place,
                    }
                    for person in group
                ],
            }
        )

    return duplicates
