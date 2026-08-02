# Modèle du formulaire de collecte

## Objectif

Collecter les données auprès de chaque chef de famille pour construire une base généalogique exploitable dans un futur Graph RAG.

## Sections du formulaire

### 1. Identification du chef de famille

- Nom
- Prénom(s)
- Téléphone
- Email
- Branche concernée
- Personne racine de la branche

### 2. Informations personnelles du chef de famille

- Nom
- Prénom(s)
- Sexe
- Date de naissance exacte ou approximative
- Lieu de naissance
- Statut : vivant, décédé, inconnu
- Date de décès si applicable
- Notes

### 3. Épouse(s) / conjoint(e)s

Pour chaque union :

- Nom du conjoint
- Prénom(s)
- Sexe
- Type d'union : mariage civil, mariage coutumier, union libre, autre
- Date approximative de l'union
- Fin éventuelle de l'union
- Notes

### 4. Enfants

Pour chaque enfant :

- Nom
- Prénom(s)
- Sexe
- Date de naissance exacte ou approximative
- Lieu de naissance
- Père
- Mère
- Statut : vivant, décédé, inconnu
- Notes

### 5. Petits-enfants

Pour chaque petit-enfant :

- Nom
- Prénom(s)
- Sexe
- Date de naissance exacte ou approximative
- Père
- Mère
- Notes

### 6. Remarques

- Personnes oubliées
- Informations incertaines
- Données à vérifier
- Personnes pouvant confirmer certaines informations

## Règle importante

Ne pas bloquer la collecte lorsqu'une date est inconnue. Prévoir des valeurs libres comme :

- inconnue
- vers 1950
- années 1960
- avant 1980
