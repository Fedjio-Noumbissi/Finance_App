# 💰 FinTrack — Gestion Financière Personnelle Bilingue

Application web de suivi des finances personnelles au quotidien, disponible en français et en anglais.

## 📋 Description

FinTrack permet à un utilisateur individuel de suivre facilement ses revenus et dépenses au quotidien, sans complexité inutile. L'objectif : répondre en quelques secondes à trois questions essentielles — *Combien me reste-t-il ce mois-ci ? Où est parti mon argent ? Ai-je dépensé plus ou moins que d'habitude ?*

## ✨ Fonctionnalités (V1)

- 🔐 Authentification (inscription / connexion par email et mot de passe)
- ➕ Ajout rapide de transactions (revenu ou dépense) en moins de 10 secondes
- 🏷️ Catégories prédéfinies et personnalisables (nourriture, transport, loyer, santé, loisirs, épargne...)
- 📊 Dashboard avec solde du mois, total des revenus/dépenses
- 🥧 Graphique de répartition des dépenses par catégorie
- 📈 Statistiques d'évolution du solde dans le temps
- 📝 Liste des transactions filtrable et triable
- 🌍 Interface bilingue français / anglais, changement instantané

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React + TypeScript) |
| Routing | TanStack Router |
| Données serveur / cache | TanStack Query |
| Formulaires | TanStack Form |
| Tableaux | TanStack Table |
| Base de données | PostgreSQL |
| Authentification | Firebase Auth |
| Graphiques | Recharts |
| Internationalisation | i18next |
| Styling | Tailwind CSS |

## 🚀 Installation

### Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL installé et lancé localement (ou une instance distante)
- Un compte Firebase (pour l'authentification)

### Étapes

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd fintrack

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Remplir .env avec vos identifiants (base de données, Firebase, etc.)

# 4. Lancer les migrations de base de données
npm run db:migrate

# 5. (Optionnel) Peupler la base avec les catégories par défaut
npm run db:seed

# 6. Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`.

## 📁 Structure du projet

```
src/
├── routes/          # Pages et routing (TanStack Router)
├── components/       # Composants React réutilisables
├── hooks/            # Hooks personnalisés
├── lib/               # Utilitaires, config DB, config Firebase
├── types/            # Types TypeScript partagés
└── i18n/              # Fichiers de traduction (fr.json, en.json)
```

## 🗃️ Modèle de données

**User**
`id, email, mot_de_passe_hash, langue_preferee, date_creation`

**Category**
`id, user_id (nullable), nom_fr, nom_en, icone, couleur`

**Transaction**
`id, user_id, montant, type (revenu/depense), category_id, date, note, date_creation`

## 🗺️ Roadmap (après le MVP)

- [ ] Budgets par catégorie avec alertes de dépassement
- [ ] Objectifs d'épargne avec suivi de progression
- [ ] Export PDF / Excel des rapports
- [ ] Support multi-devises (FCFA, EUR, USD...)
- [ ] Version mobile (React Native / Expo)
- [ ] Notifications de rappel de saisie
- [ ] Synchronisation multi-appareils

## 📄 Licence

Ce projet est un projet personnel / académique.

## 👤 Auteur

Étudiant en Génie Informatique — Polytechnique de Yaoundé
