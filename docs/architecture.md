# Architecture fonctionnelle

## Flux général

```text
Administrateur
  -> ouvre le tableau de bord Next.js `/admin`
  -> crée une branche familiale
  -> génère un lien unique
  -> envoie le lien au chef de famille

Chef de famille
  -> ouvre le lien Next.js `/collecte/{token}`
  -> confirme ses coordonnées
  -> ajoute les personnes de sa descendance
  -> ajoute les unions
  -> ajoute les liens parent-enfant
  -> ajoute les remarques ou incertitudes
  -> soumet la branche

Administrateur
  -> vérifie les données dans Next.js
  -> corrige les doublons si besoin côté base / API
  -> exporte les données
  -> importe dans Neo4j
```

## Modules applicatifs

- `backend/` : API FastAPI, modèles SQLAlchemy, schémas Pydantic et export CSV.
- `frontend/` : interface Next.js principale pour l'administration et la collecte.
- `database/` : initialisation PostgreSQL et scripts de préparation Neo4j.

## Modèle logique

- `branches` : branche familiale à collecter.
- `persons` : personnes collectées.
- `unions` : relations de couple.
- `parent_child_links` : liens parent-enfant.
- `remarks` : remarques et incertitudes.

## Préparation Graph RAG

Le modèle relationnel est ensuite converti en graphe :

```text
(:Person)-[:PARENT_OF]->(:Person)
(:Person)-[:SPOUSE_OF]->(:Person)
(:Person)-[:BELONGS_TO_BRANCH]->(:Branch)
```
