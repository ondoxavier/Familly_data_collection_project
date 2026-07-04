# Family Data Collection

Application de collecte des donnees genealogiques pour preparer un futur Graph RAG familial.

Le but est d'envoyer un lien unique a chaque chef de famille afin qu'il renseigne :

- ses informations personnelles ;
- ses epouse(s) / conjoint(e)s ;
- ses enfants ;
- les conjoints des enfants ;
- les petits-enfants ;
- les remarques, incertitudes et informations a verifier.

## Architecture

```text
family_data_collection/
|-- backend/                 # API FastAPI
|-- frontend_streamlit/       # Interface de collecte / admin
|-- database/                 # Scripts SQL PostgreSQL + cypher de reference
|-- scripts/                  # Pipeline d'import automatise vers Neo4j
|-- docs/                     # Documentation fonctionnelle et technique
|-- examples/                 # Exemples CSV / JSON
|-- prompts/                  # Prompts pour le futur Graph RAG
`-- tests/                    # Tests unitaires et d'integration API
```

## Stack

- Backend : FastAPI
- Base de donnees : PostgreSQL
- ORM : SQLAlchemy
- Validation : Pydantic
- Frontend MVP : Streamlit
- Futur graphe : Neo4j

## Lancement rapide en local

### 1. Creer l'environnement Python

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows
pip install -r requirements.txt
cd ../frontend_streamlit
pip install -r requirements.txt
```

### 2. Configurer les variables d'environnement

```bash
cd ../backend
cp .env.example .env
```

Avec le `docker-compose.yml` fourni, PostgreSQL est expose localement sur le port `5433`.

### 3. Lancer PostgreSQL avec Docker

```bash
cd ..
docker compose up -d
```

### 4. Lancer l'API

```bash
cd backend
uvicorn app.main:app --reload
```

API disponible sur `http://127.0.0.1:8000`.

Documentation Swagger : `http://127.0.0.1:8000/docs`.

### 5. Lancer l'interface Streamlit

```bash
cd frontend_streamlit
streamlit run app.py
```

Interface disponible sur `http://localhost:8501`.

Ces liens `localhost` ne fonctionnent que sur votre machine. Pour envoyer un lien
utilisable par un vrai chef de famille, voir [docs/deploiement.md](docs/deploiement.md).

## Fonctionnalites MVP

- Creer une branche familiale.
- Generer un lien unique pour un chef de famille.
- Guider le chef de famille par etapes : chef, conjoints, enfants, petits-enfants.
- Ajouter les unions et liens parent-enfant sans manipuler les IDs techniques.
- Ajouter une remarque ou une incertitude.
- Verifier et soumettre une branche.
- Detecter les doublons potentiels (meme nom / meme date de naissance), y compris entre branches soumises par des chefs de famille differents.
- Exporter les donnees en CSV.
- Importer automatiquement les branches validees dans Neo4j (`scripts/export_to_neo4j.py`).

## Tests

```bash
cd backend
pip install -r requirements.txt
cd ..
pytest tests/
```

Les tests d'integration API (`tests/test_api.py`) utilisent une base SQLite temporaire et n'ont pas besoin de PostgreSQL.

## Import vers Neo4j

Le script `scripts/export_to_neo4j.py` importe directement depuis la base de collecte (pas besoin de manipuler des CSV) et est idempotent (relancable sans creer de doublons dans le graphe).

```bash
pip install -r scripts/requirements.txt
cp scripts/.env.example scripts/.env   # renseigner NEO4J_URI / NEO4J_USER / NEO4J_PASSWORD
docker compose up -d neo4j             # si Neo4j local via Docker
python scripts/export_to_neo4j.py      # importe les branches au statut "submitted"
```

Par defaut, seules les branches deja soumises (`submitted`) sont importees, en coherence avec la regle "exporter une branche seulement apres controle humain" (voir `docs/systeme_collecte.md`).

## Parcours de collecte

1. L'administrateur cree une branche.
2. Il envoie le lien genere au chef de famille.
3. Le chef de famille ouvre le lien et complete le formulaire.
4. Il soumet la branche quand les informations principales sont saisies.
5. L'administrateur controle les donnees, corrige les doublons, puis exporte les CSV.

## Prochaine etape

Apres la collecte, les donnees seront transformees en graphe :

```text
(Person)-[:PARENT_OF]->(Person)
(Person)-[:SPOUSE_OF]->(Person)
(Person)-[:BELONGS_TO_BRANCH]->(Branch)
```
