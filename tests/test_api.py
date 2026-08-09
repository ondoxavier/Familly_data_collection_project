import io
import zipfile

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_branch_by_token_returns_404_when_unknown():
    response = client.get("/api/branches/token/does-not-exist")
    assert response.status_code == 404


def test_person_requires_first_name():
    branch = client.post("/api/branches", json={"branch_name": "Branche sans prenom"}).json()
    response = client.post("/api/persons", json={"branch_id": branch["id"]})
    assert response.status_code == 422


def test_full_branch_collection_flow():
    branch_resp = client.post("/api/branches", json={"branch_name": "Descendance de Test"})
    assert branch_resp.status_code == 200
    branch = branch_resp.json()
    assert branch["status"] == "draft"

    token_resp = client.get(f"/api/branches/token/{branch['access_token']}")
    assert token_resp.status_code == 200
    assert token_resp.json()["id"] == branch["id"]

    head = client.post(
        "/api/persons",
        json={"branch_id": branch["id"], "first_name": "Jean", "last_name": "Ondo", "gender": "M"},
    ).json()
    spouse = client.post(
        "/api/persons",
        json={"branch_id": branch["id"], "first_name": "Marie", "last_name": "Mba", "gender": "F"},
    ).json()

    union_resp = client.post(
        "/api/unions",
        json={
            "branch_id": branch["id"],
            "partner_1_id": head["id"],
            "partner_2_id": spouse["id"],
            "union_type": "mariage civil",
        },
    )
    assert union_resp.status_code == 200

    child = client.post(
        "/api/persons",
        json={"branch_id": branch["id"], "first_name": "Paul", "last_name": "Ondo", "gender": "M"},
    ).json()

    for parent_id in (head["id"], spouse["id"]):
        link_resp = client.post(
            "/api/parent-child",
            json={"branch_id": branch["id"], "parent_id": parent_id, "child_id": child["id"]},
        )
        assert link_resp.status_code == 200

    remark_resp = client.post(
        "/api/remarks",
        json={"branch_id": branch["id"], "content": "Date de naissance a verifier"},
    )
    assert remark_resp.status_code == 200

    persons_resp = client.get(f"/api/branches/{branch['id']}/persons")
    assert persons_resp.status_code == 200
    assert len(persons_resp.json()) == 3

    unions_resp = client.get(f"/api/branches/{branch['id']}/unions")
    assert len(unions_resp.json()) == 1

    links_resp = client.get(f"/api/branches/{branch['id']}/parent-child")
    assert len(links_resp.json()) == 2

    remarks_resp = client.get(f"/api/branches/{branch['id']}/remarks")
    assert len(remarks_resp.json()) == 1

    submit_resp = client.patch(f"/api/branches/{branch['id']}/submit")
    assert submit_resp.status_code == 200
    assert submit_resp.json()["status"] == "submitted"

    export_resp = client.get(f"/api/branches/{branch['id']}/export")
    assert export_resp.status_code == 200
    assert export_resp.headers["content-type"] == "application/zip"
    with zipfile.ZipFile(io.BytesIO(export_resp.content)) as archive:
        names = set(archive.namelist())
        for table_name in ("branches", "persons", "unions", "parent_child_links", "remarks"):
            assert f"{table_name}.csv" in names


def test_export_returns_404_for_unknown_branch():
    response = client.get("/api/branches/does-not-exist/export")
    assert response.status_code == 404


def test_duplicate_detection_flags_same_person_across_branches():
    branch_a = client.post("/api/branches", json={"branch_name": "Branche A"}).json()
    branch_b = client.post("/api/branches", json={"branch_name": "Branche B"}).json()

    client.post(
        "/api/persons",
        json={
            "branch_id": branch_a["id"],
            "first_name": "Alice",
            "last_name": "Ondo",
            "birth_date_text": "1990",
        },
    )
    client.post(
        "/api/persons",
        json={
            "branch_id": branch_b["id"],
            "first_name": "alice",
            "last_name": "ONDO",
            "birth_date_text": "1990",
        },
    )

    response = client.get("/api/duplicates")
    assert response.status_code == 200
    groups = response.json()
    assert any(
        len(group["persons"]) >= 2
        and {p["branch_id"] for p in group["persons"]} == {branch_a["id"], branch_b["id"]}
        for group in groups
    )

    branch_a_duplicates = client.get(f"/api/branches/{branch_a['id']}/duplicates")
    assert branch_a_duplicates.status_code == 200


def test_branch_duplicates_returns_404_for_unknown_branch():
    response = client.get("/api/branches/does-not-exist/duplicates")
    assert response.status_code == 404
