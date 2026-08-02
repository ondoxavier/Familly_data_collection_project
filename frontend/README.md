# Frontend Next.js

Frontend principal de l'application Family Data Collection.

## Pages

- `/admin` : tableau de bord administrateur pour créer les branches, copier les liens de collecte, consulter les données et exporter une branche.
- `/admin/branches/[id]` : détail d'une branche avec personnes, unions, liens parent-enfant et remarques.
- `/collecte/[token]` : formulaire guidé pour le chef de famille.

## Configuration

Créer `frontend/.env.local` à partir de l'exemple :

```bash
copy .env.local.example .env.local
```

Variable utilisée :

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## Développement

```bash
npm install
npm run dev
```

Ouvrir ensuite :

```text
http://localhost:3000/admin
```

## Vérification

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Le build n'utilise pas de police distante, ce qui permet de compiler même sans accès réseau.
