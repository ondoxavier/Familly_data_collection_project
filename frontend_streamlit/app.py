import os

import pandas as pd
import requests
import streamlit as st


st.set_page_config(page_title="Collecte genealogique", layout="wide")
st.title("Collecte des donnees genealogiques")


def _config(key: str, default: str) -> str:
    # st.secrets leve une exception si aucun secrets.toml n'existe (ex. en local) :
    # on retombe alors sur les variables d'environnement / la valeur par defaut.
    try:
        if key in st.secrets:
            return st.secrets[key]
    except Exception:
        pass
    return os.getenv(key, default)


API_URL = _config("API_URL", "http://127.0.0.1:8000/api")
PUBLIC_APP_URL = _config("PUBLIC_APP_URL", "http://localhost:8501")


def api_get(path: str):
    response = requests.get(f"{API_URL}{path}", timeout=20)
    response.raise_for_status()
    return response.json()


def api_post(path: str, payload: dict | None = None):
    response = requests.post(f"{API_URL}{path}", json=payload or {}, timeout=20)
    response.raise_for_status()
    return response.json()


def api_patch(path: str, payload: dict | None = None):
    response = requests.patch(f"{API_URL}{path}", json=payload or {}, timeout=20)
    response.raise_for_status()
    return response.json()


def clean_payload(payload: dict) -> dict:
    return {key: value for key, value in payload.items() if value not in ("", [])}


def person_label(person: dict) -> str:
    full_name = f"{person.get('first_name') or ''} {person.get('last_name') or ''}".strip()
    birth = person.get("birth_date_text") or "date inconnue"
    return f"{full_name} - {birth} ({person['id'][:8]})"


def load_branch_data(branch_id: str) -> dict:
    persons = api_get(f"/branches/{branch_id}/persons")
    return {
        "persons": persons,
        "person_options": {person_label(person): person["id"] for person in persons},
        "unions": api_get(f"/branches/{branch_id}/unions"),
        "links": api_get(f"/branches/{branch_id}/parent-child"),
        "remarks": api_get(f"/branches/{branch_id}/remarks"),
        "summary": api_get(f"/branches/{branch_id}/summary"),
    }


def person_form(prefix: str, branch_id: str, default_last_name: str = ""):
    c1, c2, c3 = st.columns(3)
    first_name = c1.text_input("Prenom(s) *", key=f"{prefix}_first_name")
    last_name = c2.text_input("Nom", value=default_last_name, key=f"{prefix}_last_name")
    gender = c3.selectbox("Sexe", ["unknown", "M", "F"], key=f"{prefix}_gender")
    birth_date_text = st.text_input(
        "Date de naissance",
        placeholder="Ex : 1950, vers 1950, inconnue",
        key=f"{prefix}_birth_date_text",
    )
    birth_place = st.text_input("Lieu de naissance", key=f"{prefix}_birth_place")
    is_alive_label = st.selectbox("Statut", ["Inconnu", "Vivant", "Decede"], key=f"{prefix}_is_alive")
    death_date_text = ""
    if is_alive_label == "Decede":
        death_date_text = st.text_input("Date de deces", placeholder="Ex : 2020, vers 2020", key=f"{prefix}_death")
    notes = st.text_area("Notes", key=f"{prefix}_notes")

    payload = clean_payload(
        {
            "branch_id": branch_id,
            "first_name": first_name.strip(),
            "last_name": last_name.strip(),
            "gender": gender,
            "birth_date_text": birth_date_text.strip(),
            "birth_place": birth_place.strip(),
            "is_alive": None if is_alive_label == "Inconnu" else is_alive_label == "Vivant",
            "death_date_text": death_date_text.strip(),
            "notes": notes.strip(),
        }
    )
    return payload


def create_person(payload: dict):
    if not payload.get("first_name"):
        st.warning("Le prenom est obligatoire.")
        return None
    return api_post("/persons", payload)


token_from_url = st.query_params.get("token", "")
if isinstance(token_from_url, list):
    token_from_url = token_from_url[0] if token_from_url else ""

if token_from_url:
    # Un lien avec token identifie un chef de famille : jamais d'acces admin depuis ce lien.
    mode = "Formulaire chef de famille"
else:
    mode = st.sidebar.radio("Mode", ["Administrateur", "Formulaire chef de famille"])

if mode == "Administrateur":
    admin_password = _config("ADMIN_PASSWORD", "")
    if admin_password:
        entered_password = st.sidebar.text_input("Mot de passe administrateur", type="password")
        if entered_password != admin_password:
            st.sidebar.warning("Mot de passe requis pour acceder au mode administrateur.")
            st.stop()
    else:
        st.sidebar.warning(
            "Aucun ADMIN_PASSWORD configure : le mode administrateur est accessible sans mot de passe."
        )

    st.header("Branches familiales")
    with st.form("create_branch"):
        branch_name = st.text_input("Nom de la branche *", placeholder="Ex : Descendance de Jean Ondo")
        root_person_name = st.text_input("Personne racine", placeholder="Ex : Jean Ondo")
        collector_name = st.text_input("Chef de famille")
        collector_phone = st.text_input("Telephone")
        collector_email = st.text_input("Email")
        submitted = st.form_submit_button("Creer la branche")

    if submitted:
        try:
            branch = api_post(
                "/branches",
                clean_payload(
                    {
                        "branch_name": branch_name.strip(),
                        "root_person_name": root_person_name.strip(),
                        "collector_name": collector_name.strip(),
                        "collector_phone": collector_phone.strip(),
                        "collector_email": collector_email.strip(),
                    }
                ),
            )
            st.success("Branche creee")
            st.code(f"{PUBLIC_APP_URL}/?token={branch['access_token']}")
        except Exception as exc:
            st.error(f"Erreur : {exc}")

    st.divider()
    try:
        branches = api_get("/branches")
        if branches:
            rows = []
            for branch in branches:
                rows.append(
                    {
                        "branche": branch["branch_name"],
                        "chef": branch.get("collector_name"),
                        "statut": branch["status"],
                        "lien": f"{PUBLIC_APP_URL}/?token={branch['access_token']}",
                        "id": branch["id"],
                    }
                )
            st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)

            selected = st.selectbox("Exporter une branche", [row["branche"] for row in rows])
            selected_branch = next(row for row in rows if row["branche"] == selected)
            if st.button("Exporter en CSV"):
                result = api_post(f"/branches/{selected_branch['id']}/export")
                st.success("Export cree")
                st.json(result["files"])
        else:
            st.info("Aucune branche pour le moment.")
    except Exception as exc:
        st.warning(f"Impossible de charger les branches : {exc}")

    st.divider()
    st.header("Doublons potentiels")
    st.caption(
        "Personnes portant le meme nom (accents et casse ignores) et la meme date de naissance, "
        "signalees dans une ou plusieurs branches. A verifier avant l'import dans le graphe familial."
    )
    try:
        duplicate_groups = api_get("/duplicates")
        if not duplicate_groups:
            st.info("Aucun doublon potentiel detecte.")
        else:
            for group in duplicate_groups:
                label = f"{group['first_name'].title()} {group['last_name'].title()}".strip()
                birth = group["birth_date_text"] or "date inconnue"
                with st.expander(f"{label} - {birth} ({len(group['persons'])} occurrences)"):
                    st.dataframe(
                        pd.DataFrame(group["persons"])[
                            ["branch_name", "first_name", "last_name", "birth_date_text", "birth_place", "id"]
                        ],
                        use_container_width=True,
                        hide_index=True,
                    )
    except Exception as exc:
        st.warning(f"Impossible de charger les doublons : {exc}")

else:
    token = st.text_input("Token de la branche", value=token_from_url)

    if not token:
        st.info("Collez le token ou ouvrez le lien envoye par l'administrateur.")
        st.stop()

    try:
        branch = api_get(f"/branches/token/{token}")
        branch_id = branch["id"]
        data = load_branch_data(branch_id)
    except Exception as exc:
        st.error(f"Branche introuvable : {exc}")
        st.stop()

    st.subheader(branch["branch_name"])
    if branch.get("root_person_name"):
        st.caption(f"Personne racine : {branch['root_person_name']}")

    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Personnes", data["summary"]["persons_count"])
    m2.metric("Unions", data["summary"]["unions_count"])
    m3.metric("Liens parent-enfant", data["summary"]["parent_child_links_count"])
    m4.metric("Remarques", data["summary"]["remarks_count"])

    chef_tab, spouses_tab, children_tab, grandchildren_tab, notes_tab, review_tab = st.tabs(
        ["Chef", "Conjoints", "Enfants", "Petits-enfants", "Remarques", "Verification"]
    )

    with chef_tab:
        st.header("Chef de famille")
        with st.form("add_head"):
            payload = person_form("head", branch_id)
            submitted = st.form_submit_button("Enregistrer le chef de famille")
        if submitted:
            person = create_person(payload)
            if person:
                st.success(f"Personne ajoutee : {person_label(person)}")
                st.rerun()

    with spouses_tab:
        st.header("Conjoints")
        if not data["person_options"]:
            st.info("Ajoutez d'abord le chef de famille.")
        else:
            reference_label = st.selectbox("Personne concernee", list(data["person_options"].keys()), key="spouse_ref")
            with st.form("add_spouse"):
                payload = person_form("spouse", branch_id)
                union_type = st.selectbox(
                    "Type d'union",
                    ["mariage civil", "mariage coutumier", "union libre", "autre", "inconnu"],
                    key="spouse_union_type",
                )
                start_date_text = st.text_input("Date de l'union", key="spouse_union_start")
                end_date_text = st.text_input("Fin de l'union", key="spouse_union_end")
                union_notes = st.text_area("Notes sur l'union", key="spouse_union_notes")
                submitted = st.form_submit_button("Ajouter le conjoint")
            if submitted:
                spouse = create_person(payload)
                if spouse:
                    api_post(
                        "/unions",
                        clean_payload(
                            {
                                "branch_id": branch_id,
                                "partner_1_id": data["person_options"][reference_label],
                                "partner_2_id": spouse["id"],
                                "union_type": union_type,
                                "start_date_text": start_date_text.strip(),
                                "end_date_text": end_date_text.strip(),
                                "notes": union_notes.strip(),
                            }
                        ),
                    )
                    st.success("Conjoint et union ajoutes")
                    st.rerun()

    with children_tab:
        st.header("Enfants")
        if not data["person_options"]:
            st.info("Ajoutez d'abord les parents connus.")
        else:
            parent_labels = list(data["person_options"].keys())
            with st.form("add_child"):
                payload = person_form("child", branch_id)
                selected_parents = st.multiselect("Parents connus", parent_labels, key="child_parents")
                certainty = st.selectbox("Certitude", ["confirmed", "uncertain", "to_verify"], key="child_certainty")
                submitted = st.form_submit_button("Ajouter l'enfant")
            if submitted:
                child = create_person(payload)
                if child:
                    for label in selected_parents:
                        api_post(
                            "/parent-child",
                            {
                                "branch_id": branch_id,
                                "parent_id": data["person_options"][label],
                                "child_id": child["id"],
                                "certainty": certainty,
                            },
                        )
                    st.success("Enfant ajoute")
                    st.rerun()

    with grandchildren_tab:
        st.header("Petits-enfants")
        if not data["person_options"]:
            st.info("Ajoutez d'abord les parents connus.")
        else:
            parent_labels = list(data["person_options"].keys())
            with st.form("add_grandchild"):
                payload = person_form("grandchild", branch_id)
                selected_parents = st.multiselect("Parents connus", parent_labels, key="grandchild_parents")
                certainty = st.selectbox("Certitude", ["confirmed", "uncertain", "to_verify"], key="grandchild_certainty")
                submitted = st.form_submit_button("Ajouter le petit-enfant")
            if submitted:
                grandchild = create_person(payload)
                if grandchild:
                    for label in selected_parents:
                        api_post(
                            "/parent-child",
                            {
                                "branch_id": branch_id,
                                "parent_id": data["person_options"][label],
                                "child_id": grandchild["id"],
                                "certainty": certainty,
                            },
                        )
                    st.success("Petit-enfant ajoute")
                    st.rerun()

    with notes_tab:
        st.header("Remarques")
        with st.form("add_remark"):
            content = st.text_area("Information incertaine, personne oubliee, correction")
            submitted = st.form_submit_button("Ajouter la remarque")
        if submitted and content.strip():
            api_post("/remarks", {"branch_id": branch_id, "content": content.strip()})
            st.success("Remarque ajoutee")
            st.rerun()

        if data["remarks"]:
            st.dataframe(pd.DataFrame(data["remarks"])[["content", "status", "created_at"]], use_container_width=True, hide_index=True)

    with review_tab:
        st.header("Verification")
        if data["persons"]:
            st.dataframe(
                pd.DataFrame(data["persons"])[
                    ["first_name", "last_name", "gender", "birth_date_text", "birth_place", "is_alive", "notes"]
                ],
                use_container_width=True,
                hide_index=True,
            )
        else:
            st.info("Aucune personne ajoutee.")

        if data["unions"]:
            st.subheader("Unions")
            st.dataframe(pd.DataFrame(data["unions"]), use_container_width=True, hide_index=True)

        if data["links"]:
            st.subheader("Liens parent-enfant")
            st.dataframe(pd.DataFrame(data["links"]), use_container_width=True, hide_index=True)

        if branch["status"] == "submitted":
            st.success("Cette branche a deja ete soumise.")
        elif st.button("Soumettre la branche"):
            api_patch(f"/branches/{branch_id}/submit")
            st.success("Branche soumise")
            st.rerun()
