# 💰 FinTrack — Bilingual Personal Finance Tracker

A web app for tracking daily personal finances, available in both French and English.

## 📋 Description

FinTrack helps an individual user easily track their income and expenses day to day, without unnecessary complexity. The goal: answer three key questions in a few seconds — *How much do I have left this month? Where did my money go? Am I spending more or less than usual?*

## ✨ Features (V1)

- 🔐 Authentication (sign up / login with email and password)
- ➕ Quick transaction entry (income or expense) in under 10 seconds
- 🏷️ Predefined and customizable categories (food, transport, rent, health, leisure, savings...)
- 📊 Dashboard with current monthly balance, total income/expenses
- 🥧 Pie chart showing expense breakdown by category
- 📈 Statistics showing balance evolution over time
- 📝 Filterable and sortable transaction list
- 🌍 Bilingual interface (French / English), instant language switching

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React + TypeScript) |
| Routing | TanStack Router |
| Server data / caching | TanStack Query |
| Forms | TanStack Form |
| Tables | TanStack Table |
| Database | PostgreSQL |
| Authentication | Firebase Auth |
| Charts | Recharts |
| Internationalization | i18next |
| Styling | Tailwind CSS |

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL installed and running locally (or a remote instance)
- A Firebase account (for authentication)

### Steps

```bash
# 1. Clone the project
git clone <repo-url>
cd fintrack

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Fill in .env with your credentials (database, Firebase, etc.)

# 4. Run database migrations
npm run db:migrate

# 5. (Optional) Seed the database with default categories
npm run db:seed

# 6. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## 📁 Project Structure

```
src/
├── routes/          # Pages and routing (TanStack Router)
├── components/       # Reusable React components
├── hooks/            # Custom hooks
├── lib/               # Utilities, DB config, Firebase config
├── types/            # Shared TypeScript types
└── i18n/              # Translation files (fr.json, en.json)
```

## 🗃️ Data Model

**User**
`id, email, password_hash, preferred_language, created_at`

**Category**
`id, user_id (nullable), name_fr, name_en, icon, color`

**Transaction**
`id, user_id, amount, type (income/expense), category_id, date, note, created_at`

## 🗺️ Roadmap (post-MVP)

- [ ] Category budgets with overspending alerts
- [ ] Savings goals with progress tracking
- [ ] PDF / Excel report export
- [ ] Multi-currency support (FCFA, EUR, USD...)
- [ ] Mobile version (React Native / Expo)
- [ ] Entry reminder notifications
- [ ] Multi-device synchronization

## 📄 License

This is a personal / academic project.

## 👤 Author

Computer Engineering student — Polytechnique de Yaoundé
