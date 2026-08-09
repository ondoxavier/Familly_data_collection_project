# Family Data Collection

Application de collecte des données généalogiques pour préparer un futur **Graph RAG familial**.

Le but est d'envoyer un lien unique à chaque chef de famille afin qu'il renseigne :

- ses informations personnelles ;
- ses épouse(s) / conjoint(e)s ;
- ses enfants ;
- les conjoints des enfants ;
- les petits-enfants ;
- les remarques, incertitudes et informations à vérifier.

## Architecture

```text
family_data_collection/
├── backend/                 # API FastAPI
├── frontend/                # Frontend Next.js principal
├── database/                # Scripts SQL PostgreSQL
├── docs/                    # Documentation fonctionnelle et technique
├── examples/                # Exemples CSV / JSON
├── prompts/                 # Prompts pour le futur Graph RAG
├── scripts/                 # Pipeline d'import automatisé vers Neo4j
└── tests/                   # Tests unitaires et d'intégration API
```

## Stack

- **Backend** : FastAPI
- **Base de données** : PostgreSQL
- **ORM** : SQLAlchemy
- **Validation** : Pydantic
- **Frontend** : Next.js, React, TanStack Query, Tailwind CSS
- **Futur graphe** : Neo4j

## Lancement rapide en local

### 1. Lancer PostgreSQL

```bash
docker compose up -d
```

### 2. Préparer l'API FastAPI

```bash
cd backend
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Vérifier ensuite `DATABASE_URL` et `CORS_ORIGINS` dans `backend/.env`.

Pour installer aussi les dépendances de test :

```bash
pip install -r requirements-dev.txt
```

### 3. Lancer l'API

```bash
cd backend
uvicorn app.main:app --reload
```

API disponible sur :

```text
http://127.0.0.1:8000
```

Documentation Swagger :

```text
http://127.0.0.1:8000/docs
```

### 4. Lancer le frontend Next.js

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Interface administrateur :

```text
http://localhost:3000/admin
```

Les liens de collecte générés par l'admin utilisent le format :

```text
http://localhost:3000/collecte/{token}
```

## Fonctionnalités MVP

- Créer une branche familiale.
- Générer un lien unique pour un chef de famille.
- Ajouter une personne.
- Ajouter une union.
- Ajouter un lien parent-enfant.
- Ajouter une remarque ou une incertitude.
- Suivre la collecte depuis le tableau de bord admin.
- Détecter les doublons potentiels (même nom / date de naissance), y compris entre branches soumises par des chefs de famille différents.
- Exporter les données en CSV compressés.
- Importer automatiquement les branches validées dans Neo4j (`scripts/export_to_neo4j.py`).

## Vérification

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

```bash
cd ..
backend\.venv\Scripts\python.exe -m pytest tests
```

## Import vers Neo4j

Le script `scripts/export_to_neo4j.py` importe directement depuis la base de collecte (pas besoin de manipuler des CSV) et est idempotent (relançable sans créer de doublons dans le graphe).

```bash
pip install -r scripts/requirements.txt
copy scripts\.env.example scripts\.env   # renseigner NEO4J_URI / NEO4J_USER / NEO4J_PASSWORD
python scripts/export_to_neo4j.py        # importe les branches au statut "submitted"
```

## Déploiement

La configuration Render est disponible dans [render.yaml](render.yaml).

Les étapes complètes sont décrites dans [docs/deployment.md](docs/deployment.md).

## Prochaine étape

Après la collecte, les données seront transformées en graphe :

```text
(Person)-[:PARENT_OF]->(Person)
(Person)-[:SPOUSE_OF]->(Person)
(Person)-[:BELONGS_TO_BRANCH]->(Branch)
```
