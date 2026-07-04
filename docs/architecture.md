# Architecture fonctionnelle

## Flux général

```text
Administrateur
  -> crée une branche familiale
  -> génère un lien unique
  -> envoie le lien au chef de famille

Chef de famille
  -> ouvre le lien
  -> ajoute les personnes de sa descendance
  -> ajoute les unions
  -> ajoute les liens parent-enfant
  -> soumet la branche

Administrateur
  -> vérifie les données
  -> corrige les doublons
  -> exporte les données
  -> importe dans Neo4j
```

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
