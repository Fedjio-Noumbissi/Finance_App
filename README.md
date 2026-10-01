# Finance App

TanStack Start (React + TypeScript) · TanStack Router · TanStack Query · Tailwind CSS 4 · PostgreSQL + Drizzle ORM · Firebase Auth

## Créer le projet Firebase (5 min)

1. Ouvrez <https://console.firebase.google.com> → **Ajouter un projet**
   - nom : `gestion-finance`, Google Analytics : **désactivé** (inutile ici)
2. Menu **Build → Authentication → Get started**
   - onglet **Sign-in method** → **Email/Password** → **Enable** → **Enregistrer**
3. Onglet **Settings** (dans Authentication) → **Domaines autorisés** → **Ajouter un domaine** → `localhost`
4. Menu **Build → Authentication → Web** (`</>`) → **Créer une application**
   - nom : `web`, cochez **Firebase Hosting** (ou non, ça n'est pas utilisé ici)
5. Copiez l'objet `firebaseConfig` affiché et remplissez `.env` :

```bash
VITE_FIREBASE_API_KEY="AIza..."
VITE_FIREBASE_AUTH_DOMAIN="gestion-finance.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="gestion-finance"
VITE_FIREBASE_STORAGE_BUCKET="gestion-finance.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abc123"
```

6. Redémarrez `npm run dev`, puis testez sur <http://localhost:3000/signup>.

### Firebase Admin (optionnel, pour la synchronisation PostgreSQL)

**Paramètres du projet → Comptes de service → Générer une nouvelle clé privée**, puis :

```bash
FIREBASE_PROJECT_ID="gestion-finance"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@gestion-finance.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

Sans ces variables, l'authentification fonctionne normalement mais le profil n'est pas recopié
dans la table `users` (le tableau de bord affiche « synchronisation désactivée »).
**Ne committez jamais ce fichier de clé :** il donne un accès complet au projet Firebase.

## Authentification

| Route | Accès | Rendu |
| --- | --- | --- |
| `/` | public | SSR |
| `/login`, `/signup` | public, redirige vers `/dashboard` si connecté | SSR |
| `/_protected/*` | **connecté uniquement** | client (`ssr: false`) |

- `src/lib/firebase.ts` — initialisation paresseuse du SDK client (ne casse pas le SSR public si la config est absente)
- `src/lib/auth/store.ts` — store global (`useSyncExternalStore`) : `status`, `user`, `profileSynced`
- `src/lib/auth/context.tsx` — `AuthProvider`, `useAuth()`, `useUser()`, `signIn`, `signUp`, `signOut`
- `src/lib/auth/guard.ts` — `requireAuth` / `redirectIfAuthenticated`, utilisés dans `beforeLoad`
- `src/lib/auth/sync.ts` — server function `syncUserProfile` : vérifie l'ID token côté serveur puis upsert dans `users`
- `src/routes/_protected.tsx` — layout protégé ; toute page ajoutée dans `src/routes/_protected/` est protégée automatiquement

Les mots de passe ne sont jamais stockés en base : `mot_de_passe_hash` est désormais nullable et
l'identité est portée par `users.firebase_uid`.

## Base de données

Copiez `.env.example` vers `.env` et renseignez `DATABASE_URL`.

```bash
npm run db:generate   # génère une migration depuis src/lib/db/schema.ts
npm run db:migrate    # applique les migrations en attente
npm run db:seed       # insère les 7 catégories par défaut (idempotent)
npm run db:studio     # interface web Drizzle Studio
```

Schéma dans `src/lib/db/schema.ts`, client dans `src/lib/db/index.ts`, SQL généré dans `drizzle/`.

Tables : `users`, `categories` (`user_id` nul = catégorie par défaut), `transactions` (`type` enum `revenu` / `depense`).

---

# Getting Started

To run this application:

```bash
npm install
npm run dev
```

# Building For Production

To build this application for production:

```bash
npm run build
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Remove `@tailwindcss/vite` and `tailwindcss` from `package.json`



## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')
  
  useEffect(() => {
    getServerTime().then(setTime)
  }, [])
  
  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).



# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
