from pathlib import Path

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

    summary = client.get(f"/api/branches/{branch['id']}/summary").json()
    assert summary["persons_count"] == 3
    assert summary["unions_count"] == 1
    assert summary["parent_child_links_count"] == 2
    assert summary["remarks_count"] == 1

    submit_resp = client.patch(f"/api/branches/{branch['id']}/submit")
    assert submit_resp.status_code == 200
    assert submit_resp.json()["status"] == "submitted"

    export_resp = client.post(f"/api/branches/{branch['id']}/export")
    assert export_resp.status_code == 200
    files = export_resp.json()["files"]
    for table_name in ("branches", "persons", "unions", "parent_child_links", "remarks"):
        assert table_name in files
        assert Path(files[table_name]).exists()


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
