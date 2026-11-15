# École Zahrat Al Madaeen — site web

Site de l’école (Nouvelle Médina 3, Ben Arous) en **français et en arabe**, avec un formulaire d’admission unique (pré-inscription ou test selon le niveau) et un **Espace école** privé pour suivre les demandes.

- Front : HTML/CSS/JS sans framework, construit avec [Vite](https://vite.dev)
- Données et connexion : [Supabase](https://supabase.com) (Postgres + Auth + Realtime)
- Hébergement : [Netlify](https://netlify.com)

## Pages

| Français          | Arabe                | Contenu                                   |
|-------------------|----------------------|-------------------------------------------|
| `/`               | `/ar/`               | Accueil (page longue)                     |
| `/ecole/`         | `/ar/ecole/`         | Histoire, valeurs, équipe                 |
| `/pedagogie/`     | `/ar/pedagogie/`     | Niveaux, concours, résultats, clubs       |
| `/admissions/`    | `/ar/admissions/`    | Formulaire unique, documents, frais       |
| `/actualites/`    | `/ar/actualites/`    | Actualités                                |
| `/contact/`       | `/ar/contact/`       | Coordonnées, itinéraire                   |
| `/espace/`        | —                    | Espace école (non indexé)                 |

```
src/pages/fr/*.html   contenu de chaque page en français  ← c’est ici qu’on modifie les textes
src/pages/ar/*.html   contenu de chaque page en arabe
build/layout.js       en-tête, menu, pied de page, barre mobile (FR + AR), balises SEO
build/site.js         assemble les pages, gère <x-photo>, génère sitemap.xml et robots.txt
index.html, ecole/index.html, ar/…   fichiers d’entrée (une ligne chacun, ne pas modifier)
src/styles.css        styles (droite-à-gauche automatique pour l’arabe)
src/main.js           menu ; charge forms.js / espace.js seulement sur leur page
src/forms.js          formulaire d’admission → Supabase (messages FR/AR)
src/espace.js         Espace école : connexion, liste, suivi, export CSV
src/assets/photos/    les photos (voir plus bas)
public/og.jpg         image d’aperçu pour Facebook / WhatsApp
supabase/schema.sql   tables, sécurité (RLS), temps réel
netlify.toml          build et en-têtes Netlify
```

Chaque fichier de `src/pages/` commence par un bloc `<!--meta {...}-->` (titre et description pour Google). Une modification de texte doit être faite dans les deux langues.

**Adresse du site** : les liens absolus (sitemap, aperçus Facebook, Google) utilisent la variable `URL` fournie par Netlify. Avec un nom de domaine à soi, ajouter la variable d’environnement `SITE_URL=https://www.exemple.tn` sur Netlify.

## 1. Supabase

1. Créer un projet sur supabase.com (région la plus proche : Europe, ex. Frankfurt).
2. **SQL Editor → New query**, coller `supabase/schema.sql`, **Run**.
3. **Authentication → Users → Add user** : e-mail et mot de passe de l’administration, cocher *Auto confirm user*.
4. Donner l’accès à l’Espace école à ce compte (SQL Editor) :
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'zahratalmadaeen3@gmail.com';
   ```
5. **Authentication → Sign In / Providers** : désactiver *Allow new users to sign up* (seuls les comptes créés à la main peuvent se connecter).
6. **Project Settings → API** : copier *Project URL* et la clé *anon public*.

Sécurité : les visiteurs (clé anon) peuvent **uniquement ajouter** une demande. Ils ne peuvent ni lire ni modifier les demandes. Seuls les comptes listés dans `public.admins` lisent les demandes et changent leur suivi. La clé anon peut donc être publique ; ne jamais mettre la clé `service_role` dans le site.

## 2. En local

```bash
cp .env.example .env      # puis coller l’URL et la clé anon
npm install
npm run dev               # http://localhost:5173
```

Sans `.env`, le site fonctionne mais les formulaires proposent l’envoi par WhatsApp à la place.

## 3. Netlify

1. Pousser le dossier sur GitHub, puis **Add new site → Import an existing project**.
2. Build command `npm run build`, publish directory `dist` (déjà dans `netlify.toml`).
3. **Site configuration → Environment variables** : ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`, puis relancer un déploiement.
4. Optionnel : brancher le nom de domaine de l’école dans **Domain management**.

**Déploiement automatique** : le projet Netlify est relié au dépôt GitHub `youssefbesbes/ecole-zahrat-el-madaen`. Chaque `git push` sur `main` reconstruit et publie le site (réglages de build dans `netlify.toml`).

Publication manuelle depuis l’ordinateur (secours) : `npm run deploy`.

Adresse : https://zahrat-al-madaeen.netlify.app — si l’équipe Netlify a la « Team protection » activée, passer l’accès visiteurs en public dans **Project configuration → Access & security**.

## Photos de l’école

Dans les pages, une photo s’écrit `<x-photo slot="equipe" alt="Description"></x-photo>` : le fichier `src/assets/photos/equipe.jpg` est inséré au build. Si le fichier n’existe pas, un cadre décoratif vide s’affiche. Le texte `alt` (description pour les malvoyants et Google) est écrit dans chaque page, en français et en arabe.

| Fichier                 | Emplacement                                         |
|-------------------------|-----------------------------------------------------|
| `classe.jpg`            | Accueil, cercle du haut                             |
| `galerie-1.jpg` … `galerie-4.jpg` | Accueil : « La vie à l’école »         |
| `fete-resultats.jpg`    | Accueil : bloc rentrée                              |
| `equipe.jpg`            | L’école : l’équipe                                  |
| `sixieme.jpg`           | Pédagogie : affiche « 2e au niveau national » (affichée entière, `fit="contain"`) |
| `news-*.jpg`            | Actualités                                          |

Les photos actuelles viennent de la page Facebook publique de l’école (recadrées et compressées). Pour les photos d’élèves, s’assurer que l’école a l’accord des parents.

`.jpg`, `.jpeg`, `.png`, `.webp` et `.avif` sont acceptés. Réduire les photos à environ 1600 px de large (moins de 400 Ko) avant de les ajouter.

## Espace école

Adresse : `https://<site>/#espace` (le lien n’apparaît dans le menu qu’une fois connecté). On y voit toutes les demandes en direct, on les filtre par type, on change leur suivi (Nouvelle → Famille contactée → Test confirmé → Inscrit / Sans suite) et on exporte la liste en CSV pour Excel.
