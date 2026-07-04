# Déploiement public (liens utilisables par les chefs de famille)

En local, l'application tourne sur `localhost` : les liens generes (`http://localhost:8501/?token=...`)
ne fonctionnent que sur votre propre machine. Pour qu'un chef de famille puisse ouvrir
son lien depuis son telephone, il faut heberger l'API et l'interface sur des services
accessibles publiquement.

Cette configuration utilise uniquement des offres gratuites/d'entree de gamme. **Verifiez
les conditions tarifaires actuelles au moment de l'inscription**, elles evoluent regulierement.

## Vue d'ensemble

```text
Chef de famille
  -> ouvre le lien Streamlit Community Cloud
       -> appelle l'API hebergee sur Render (ou Railway)
            -> lit/ecrit dans une base Postgres hebergee sur Neon (ou Supabase)
```

## 1. Pousser le code sur GitHub

Le depot git local a deja ete initialise. Creez un depot (prive de preference, les
donnees sont familiales) sur GitHub, puis :

```bash
git add -A
git commit -m "Initial commit"
git remote add origin <url-du-depot>
git push -u origin master
```

## 2. Base de donnees Postgres gratuite (Neon)

1. Creer un compte sur [neon.tech](https://neon.tech) et un nouveau projet.
2. Recuperer la chaine de connexion fournie (format `postgresql://user:password@host/dbname`).
3. L'adapter au format attendu par SQLAlchemy/psycopg2 en ajoutant `+psycopg2` :

   ```text
   postgresql+psycopg2://user:password@host/dbname
   ```

   C'est cette valeur qui ira dans `DATABASE_URL`.

*(Supabase propose une offre equivalente si vous preferez.)*

## 3. API sur Render

1. Creer un compte sur [render.com](https://render.com) et connecter le depot GitHub.
2. `render.yaml` (a la racine du depot) decrit deja le service : Render propose de
   creer un "Blueprint" a partir de ce fichier automatiquement.
   - Repertoire racine du service : `backend`
   - Build command : `pip install -r requirements.txt`
   - Start command : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Renseigner la variable d'environnement `DATABASE_URL` avec la chaine Neon de l'etape 2.
4. `SECRET_KEY` est generee automatiquement par Render (`generateValue: true`).
5. Une fois deploye, noter l'URL publique, par exemple :
   `https://family-data-collection-api.onrender.com`

   L'API sera accessible sous `https://.../api` (ex. `.../api/health`).

*(Alternative : Railway fonctionne aussi, il detecte `backend/Procfile`.)*

**Limite du plan gratuit Render** : le service se met en veille apres une periode
d'inactivite ; le premier appel apres veille peut prendre 30-60 secondes.

## 4. Interface sur Streamlit Community Cloud

1. Creer un compte sur [share.streamlit.io](https://share.streamlit.io) (connexion GitHub).
2. Deployer une nouvelle app :
   - Depot : le meme depot GitHub.
   - Fichier principal : `frontend_streamlit/app.py`.
3. Dans les parametres de l'app, section **Secrets**, ajouter :

   ```toml
   API_URL = "https://family-data-collection-api.onrender.com/api"
   PUBLIC_APP_URL = "https://<votre-app>.streamlit.app"
   ```

   (`app.py` lit `API_URL`/`PUBLIC_APP_URL` depuis `st.secrets` en priorite, avec
   repli sur les variables d'environnement en local — aucun changement de code requis.)

4. L'app est alors disponible sur une URL publique du type
   `https://<votre-app>.streamlit.app`.

## 5. Verification

1. Ouvrir l'app Streamlit publique, mode **Administrateur**, creer une branche de test.
2. Copier le lien genere (il doit commencer par `https://<votre-app>.streamlit.app`,
   pas par `localhost`).
3. Ouvrir ce lien dans un navigateur different (ou en navigation privee) pour simuler
   un chef de famille, verifier que le formulaire se charge et qu'on peut y ajouter une personne.
4. Supprimer la branche de test si besoin (ou la laisser en `draft`, elle n'est pas exportee
   tant qu'elle n'est pas verifiee).

## 6. Envoi aux chefs de famille

Une fois verifie, reprendre le message pret a l'emploi dans
[docs/message_whatsapp.md](message_whatsapp.md) en remplacant `[INSÉRER LE LIEN]`
par le lien genere pour chaque branche.
