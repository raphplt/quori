# Quori

**Quori** convertit automatiquement vos commits & pull-requests GitHub/GitLab
en posts LinkedIn prêts à publier.

## Monorepo

| Path        | Stack                        | Rôle                       |
| ----------- | ---------------------------- | -------------------------- |
| apps/web    | Next 15, Tailwind, shadcn/ui | Interface utilisateur      |
| apps/api    | NestJS 10, TypeORM, Redis    | API REST + Webhooks GitHub |
| apps/docs   | Next static export           | Documentation publique     |
| packages/\* | Core logic, UI, configs      | Code partagé               |

## Démarrage rapide

```bash
npm install        # à la racine
npm run dev        # lance l'application
```

### Tester les webhooks GitHub

Configurez l'URL `https://<sous-domaine>.loca.lt/webhooks/github` dans les
paramètres de votre GitHub App puis installez l'app depuis le dashboard.

## Architecture

### Frontend (apps/web)

- **Next.js 15** avec App Router et React Server Components
- **Tailwind CSS v4** pour le styling
- **shadcn/ui** pour les composants
- **Zustand** pour la gestion d'état
- **React Query** pour la gestion des données
- **React Hook Form + Zod** pour les formulaires
- **Framer Motion** pour les animations

### Backend (apps/api)

- **NestJS 10** avec TypeScript strict
- **TypeORM** avec PostgreSQL
- **Redis** pour le cache et les queues
- **Passport** pour l'authentification
- **Swagger** pour la documentation API
- **BullMQ** pour les tâches asynchrones

## Scripts disponibles

```bash
# Développement
npm run dev:web     # Lance le frontend Next.js
npm run dev:api     # Lance l'API NestJS en mode watch

# Build & Test
npm run build       # Build tous les projets
npm run lint        # Lint tous les projets
npm run test        # Test tous les projets
npm run check-types # Vérification TypeScript

# Format
npm run format      # Format avec Prettier
```

## Configuration

### Variables d'environnement

**apps/api/.env**

````bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/quori"

# Redis
REDIS_URL="redis://localhost:6379"

# GitHub
GITHUB_CLIENT_ID="your_github_app_id"
GITHUB_CLIENT_SECRET="your_github_app_secret"
GITHUB_WEBHOOK_SECRET="your_webhook_secret"

# OpenAI
OPENAI_API_KEY="sk-..."

# Sessions & Encryption
SESSION_SECRET="your-session-secret-key"
ENCRYPTION_KEY="change-me"

**apps/web/.env.local**
```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"
````

## API Quota

Deux routes sont disponibles pour suivre la consommation d'appels OpenAI :

```http
POST /api/generate
GET  /api/quota
```

- `POST /api/generate` : génère un contenu et consomme 1 quota. Authentification JWT requise.
- `GET /api/quota` : retourne l'utilisation courante `{ used: number, remaining: number }`.
- `GET /api/templates` : liste les templates de style disponibles.

La limite est fixée à **5 requêtes par utilisateur et par jour**. Au-delà, l'API renvoie `429 Quota journalier dépassé`.

Pour ajouter un nouveau template global, insérez un enregistrement dans la table `templates` (nom, description, promptModifier). Les templates rattachés à une installation doivent renseigner la colonne `installation_id`.

## Configuration LinkedIn

Définissez les variables d'environnement suivantes dans `apps/api/.env` pour activer la connexion LinkedIn :

```
LINKEDIN_CLIENT_ID=<votre id>
LINKEDIN_CLIENT_SECRET=<votre secret>
LINKEDIN_REDIRECT_URI=http://localhost:3001/api/auth/linkedin/callback
```

## Workflow de développement

1. **Webhook GitHub** reçoit push/PR → parse les changements
2. **Queue BullMQ** traite les événements de manière asynchrone
3. **OpenAI GPT-4** génère le post LinkedIn en français
4. **Frontend** affiche les posts avec options d'édition
5. **Utilisateur** copie/colle ou publie directement

## Roadmap (30 jours)

### Week 1: Foundation

- [x] Setup monorepo with Turbo
- [x] NestJS API with Prisma
- [x] Next.js frontend with Tailwind
- [ ] GitHub webhook endpoint
- [ ] Basic authentication

### Week 2: Core Features

- [ ] Git event parsing logic
- [ ] OpenAI integration for post generation
- [ ] Basic UI for post management
- [ ] Redis queues for async processing

### Week 3: Polish

- [ ] Post editing interface
- [ ] LinkedIn formatting preview
- [ ] Error handling & monitoring
- [ ] Basic analytics

### Week 4: Launch

- [ ] Stripe integration (freemium model)
- [ ] Production deployment
- [ ] Documentation complète
- [ ] Beta testing

## Contributing

```bash
# Clone
git clone <repo-url>
cd quori

# Install
npm install

# Setup databases (local development)
docker-compose up -d  # PostgreSQL + Redis

# Run migrations
cd apps/api
npx prisma migrate dev

# Start development
npm run dev:api    # Terminal 1
npm run dev:web    # Terminal 2
```

## Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui, Radix UI
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Animation**: Framer Motion
- **Auth**: NextAuth.js (future)

### Backend

- **Framework**: NestJS 10
- **Database**: PostgreSQL + Prisma
- **Cache**: Redis + BullMQ
- **Auth**: Passport.js (JWT + OAuth)
- **API Docs**: Swagger/OpenAPI
- **Validation**: class-validator

### DevOps

- **Monorepo**: Turborepo
- **Package Manager**: npm workspaces
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (frontend) + Railway (backend)

## License

MIT © Quori Team
