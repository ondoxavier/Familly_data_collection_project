# Déploiement public

Cette configuration déploie l'application complète sur Render :

- `family-data-postgres` : base PostgreSQL.
- `family-data-api` : API FastAPI.
- `family-data-frontend` : frontend Next.js public.

Le fichier [render.yaml](../render.yaml) décrit ces trois ressources.

## 1. Préparer le dépôt

Le projet doit être poussé sur GitHub, avec `render.yaml` à la racine du dépôt.

Ne jamais committer les fichiers `.env`, `.env.local`, `.venv`, `.next` ou `node_modules`.

## 2. Créer la Blueprint Render

1. Aller sur Render.
2. Créer une nouvelle Blueprint.
3. Connecter le dépôt GitHub du projet.
4. Laisser Render lire `render.yaml`.
5. Quand Render demande `ADMIN_PASSWORD`, choisir un mot de passe fort.

Par défaut, l'identifiant admin est :

```text
admin
```

## 3. Vérifier les URLs Render

Pour cette Blueprint, Render peut suffixer les noms des services. Dans l'instance actuelle :

```text
Frontend: https://family-data-frontend-0wvz.onrender.com
API:      https://family-data-api-0wvz.onrender.com/api
```

Corriger ces variables dans le dashboard Render si les URLs affichées par Render sont différentes.

Pour `family-data-frontend` :

```env
NEXT_PUBLIC_API_URL=https://family-data-api-0wvz.onrender.com/api
ADMIN_USERNAME=admin
ADMIN_PASSWORD=mot_de_passe_admin
```

Pour `family-data-api` :

```env
CORS_ORIGINS=https://family-data-frontend-0wvz.onrender.com
```

Après modification, redéployer les services concernés.

## 4. Tester

1. Ouvrir le dashboard admin :

```text
https://URL_DU_FRONTEND/admin
```

2. Se connecter avec l'identifiant admin.
3. Créer une branche familiale.
4. Copier le lien généré.

Le lien envoyé aux chefs de famille aura ce format :

```text
https://URL_DU_FRONTEND/collecte/{token}
```

## Notes de sécurité

- `/admin` est protégé par mot de passe en production.
- Les liens `/collecte/{token}` sont publics pour permettre aux chefs de famille de remplir leur formulaire.
- Les données collectées sont personnelles : utiliser un mot de passe admin fort et limiter le partage des liens.
