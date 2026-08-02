from app.schemas.family import BranchCreate, PersonCreate


def test_branch_payload_valid():
    payload = BranchCreate(branch_name="Descendance de Jean Ondo")
    assert payload.branch_name == "Descendance de Jean Ondo"


def test_person_payload_valid():
    payload = PersonCreate(
        branch_id="B001",
        first_name="Paul",
        last_name="Ondo",
        gender="M",
        birth_date_text="1980",
    )
    assert payload.first_name == "Paul"
