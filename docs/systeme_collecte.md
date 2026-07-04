# Systeme de collecte aupres des chefs de famille

## Objectif

Mettre en place un parcours simple pour envoyer un lien unique a chaque chef de famille, collecter les informations genealogiques de sa branche, puis verifier et exporter les donnees avant integration dans un graphe familial.

## Parcours cible

1. L'administrateur cree une branche familiale.
2. L'application genere un lien contenant un token unique.
3. Le chef de famille ouvre ce lien.
4. Il renseigne les personnes par etapes : chef, conjoints, enfants, petits-enfants.
5. Il ajoute les remarques et incertitudes.
6. Il verifie le recapitulatif.
7. Il soumet la branche.
8. L'administrateur exporte les CSV et prepare l'import Neo4j.

## Donnees collectees

- Identite : prenom, nom, sexe.
- Naissance : date exacte ou approximative, lieu.
- Statut : vivant, decede, inconnu.
- Relations : union, parent-enfant.
- Qualite de donnee : certitude, notes, remarques a verifier.

## Statuts

- `draft` : branche en cours de remplissage.
- `submitted` : branche envoyee par le chef de famille.
- `to_verify` : remarque ou information qui doit etre controlee.

## Points d'attention

- Ne pas bloquer la collecte si une date est inconnue.
- Eviter de demander des donnees sensibles non necessaires au MVP.
- Verifier les doublons apres soumission.
- Marquer les liens incertains comme `uncertain` ou `to_verify`.
- Exporter une branche seulement apres controle humain.

## Extensions recommandees

- Ajouter une authentification administrateur.
- Ajouter un historique des modifications.
- Ajouter un consentement explicite avant soumission.
- Ajouter un deploiement public securise pour remplacer les liens `localhost`.

## Fait

- Page de detection des doublons potentiels (meme nom normalise + meme date de naissance), y compris entre branches differentes soumises par des chefs de famille differents. Voir `GET /api/duplicates` et l'onglet "Doublons potentiels" cote administrateur.
- Import automatise et idempotent des branches soumises vers Neo4j (`scripts/export_to_neo4j.py`), qui remplace le flux manuel CSV + `LOAD CSV`.
