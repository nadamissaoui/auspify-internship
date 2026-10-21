# Portfolio - Nada Missaoui

Portfolio professionnel de Nada Missaoui, Ingénieure en Informatique
spécialité Génie Logiciel. Réalisé dans le cadre du stage Full Stack
Development chez Auspify Technologies (Task 1).

## Pages

| Fichier | Contenu |
| --- | --- |
| `index.html` | Accueil : hero, statistiques, expertise, projets phares |
| `about.html` | Profil, expériences, formation, compétences, certifications, langues |
| `projects.html` | Tous les projets avec filtres (professionnel, académique, IA, stage) |
| `contact.html` | Coordonnées et formulaire de contact validé |

## Fonctionnalités

- Design sombre moderne avec dégradés et effets glass
- Responsive (mobile, tablette, desktop) avec menu hamburger
- Animations d'apparition au scroll (IntersectionObserver)
- Filtres dynamiques des projets
- Formulaire de contact validé en JavaScript + envoi via `mailto`
- Aucune dépendance JS externe (polices Google Fonts uniquement)

## Lancer le site

Avec Node.js :

```bash
npx --yes serve . -l 8000
```

Puis ouvrir http://localhost:8000

Ou simplement ouvrir `index.html` dans un navigateur.

## Personnaliser

### Photo de profil

1. Ajouter la photo dans `assets/photo.jpg`
2. Dans `index.html`, remplacer `<span>NM</span>` par :
   ```html
   <img src="assets/photo.jpg" alt="Nada Missaoui" />
   ```
3. Dans `about.html`, remplacer `<div>NM</div>` par :
   ```html
   <img src="assets/photo.jpg" alt="Nada Missaoui" />
   ```

### Liens des projets

Les projets n'ont pas encore de liens publics. Ajouter les liens réels
(GitHub, démo) dans `projects.html` si disponibles.

## Déploiement

### GitHub Pages

```bash
git init
git add .
git commit -m "Task 1: portfolio website"
git branch -M main
git remote add origin https://github.com/USERNAME/portfolio.git
git push -u origin main
```

Puis GitHub -> Settings -> Pages -> Source : `main` / root.
URL : `https://USERNAME.github.io/portfolio/`

### Vercel

1. Importer le dépôt sur https://vercel.com
2. Framework preset : Other
3. Deploy

## Checklist de soumission

- [ ] Code source sur GitHub
- [ ] Captures d'écran desktop et mobile des 4 pages
- [ ] Lien du site déployé
- [ ] Vidéo de démonstration (optionnel)
