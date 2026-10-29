# Dossier de validation — Stage Auspify Technologies

**Stagiaire :** Nada Missaoui
**Programme :** Full Stack Development Internship (4 semaines) — **4 tâches sur 6 au choix**
**Période :** 19/10/2026 → 19/11/2026
**Dépôt de code (public) :** https://github.com/nadamissaoui/auspify-internship

---

## 1. Tâches livrées

> Le programme demande de réaliser **4 tâches sur les 6** proposées. Les tâches 1 à 4
> ci-dessous répondent à cette exigence (les tâches 5 et 6, avancées, ne sont pas requises).

| # | Tâche | Stack | Statut | Code | Captures | Vidéo |
|---|---|---|---|---|---|---|
| 1 | Portfolio personnel (site en ligne) | HTML, CSS, JS | Terminé | [task1-portfolio](./task1-portfolio) | [4 captures](./screenshots) | [démo](./videos/task1-portfolio.webm) |
| 2 | Student Management System | Node.js, Express, MongoDB | Terminé | [task2-student-management](./task2-student-management) | [3 captures](./screenshots) | [démo](./videos/task2-student-management.webm) |
| 3 | Expense Tracker (JWT) | Node.js, Express, MongoDB, JWT | Terminé | [task3-expense-tracker](./task3-expense-tracker) | [3 captures](./screenshots) | [démo](./videos/task3-expense-tracker.webm) |
| 4 | E-Commerce Website (client + admin) | Node.js, Express, MongoDB, JWT | Terminé | [task4-ecommerce](./task4-ecommerce) | [3 captures](./screenshots) | [client](./videos/task4-ecommerce-checkout.webm) · [admin](./videos/task4-ecommerce-admin.webm) |

Site du portfolio en ligne : https://nadamissaoui.github.io/portfolio-nada-missaoui/

## 2. Preuves de fonctionnement

- **13 captures d'écran** (desktop + mobile) : dossier [`screenshots/`](./screenshots)
- **5 vidéos de démonstration** (WebM) : dossier [`videos/`](./videos) — voir [`videos/README.md`](./videos/README.md)
- **3 backends testés** : `GET /api/health` renvoie `HTTP 200` + `"database": "connected"` pour les tâches 2, 3 et 4.

## 3. Lancer les projets

Chaque backend sert aussi son frontend. Aucune base de données à installer :
une instance MongoDB en mémoire démarre automatiquement.

```bash
cd task2-student-management/server && npm install && npm start   # http://localhost:5000
cd task3-expense-tracker/server    && npm install && npm start   # http://localhost:5001
cd task4-ecommerce/server          && npm install && npm start   # http://localhost:5002
```

| Tâche | URL locale | Compte de démonstration |
|---|---|---|
| 1 | ouvrir `task1-portfolio/index.html` | — |
| 2 | http://localhost:5000 | — |
| 3 | http://localhost:5001 | créer un compte |
| 4 | http://localhost:5002 | `admin@auspify.com` / `admin123` |

## 4. Soumission officielle (brief Auspify)

Le brief impose 4 éléments + un formulaire :

| Élément demandé | Statut |
|---|---|
| Code source du projet | ✅ dépôt GitHub |
| Captures d'écran des tâches terminées | ✅ 13 captures |
| Lien du dépôt GitHub | ✅ https://github.com/nadamissaoui/auspify-internship |
| Vidéo de démonstration (optionnelle) | ✅ 5 vidéos |
| **Formulaire / portail de soumission** (communiqué séparément par Auspify) | ⬜ à remplir |

> Le brief précise : *« A submission form or portal will be shared separately for final
> evaluation and project verification. »* → si tu ne l'as pas reçu, écris à
> **support@auspify.com** (ou via www.auspify.com) pour le demander.

**Critères d'évaluation annoncés :** avancement des tâches, qualité du code,
responsive design, design de l'interface, créativité, présentation professionnelle,
fonctionnalité du projet.

**Éligibilité au certificat :** tâches terminées + soumission correcte + vérification
de base du projet.

## 5. Checklist de validation

- [x] Les 4 tâches développées et fonctionnelles
- [x] Code source versionné (Git) et publié sur GitHub (dépôt public)
- [x] README détaillé par tâche + README général
- [x] Captures d'écran pour chaque tâche
- [x] Vidéo de démonstration pour chaque tâche
- [x] Comptes de test / instructions de lancement fournis
- [ ] Formulaire / portail de soumission Auspify rempli
- [ ] Fiche d'évaluation du stagiaire remplie et signée par l'encadrant entreprise
- [ ] Attestation de stage signée et cachetée par Auspify Technologies

## 6. Contact

- Email : nada.missaoui@esprit.tn
- LinkedIn : https://linkedin.com/in/missaoui-nada-261140365
