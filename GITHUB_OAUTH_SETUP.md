# Configuration de l'authentification GitHub OAuth

## Problème résolu : "redirect_uri is not associated with this application"

Ce problème se produit quand l'URL de callback configurée dans votre application GitHub OAuth ne correspond pas à celle utilisée par votre API backend.

## Configuration GitHub OAuth

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Cliquez sur "New OAuth App" ou éditez une app existante
3. Configurez les URLs suivantes :

### URL de callback correcte pour l'API Backend :

```
http://localhost:3001/api/auth/github/callback
```

### Configuration complète :

- **Application name**: Quori
- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback`

## Variables d'environnement

### Backend (.env dans apps/api/) :

```bash
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN=7d

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Session Configuration
SESSION_SECRET=dev-session-secret-key
```

## URLs importantes :

- **Initier l'authentification GitHub** : `http://localhost:3001/api/auth/github`
- **Callback GitHub** : `http://localhost:3001/api/auth/github/callback`
- **Page de login frontend** : `http://localhost:3000/auth/login`

## Points importants :

1. **API Backend uniquement** : L'authentification GitHub OAuth est gérée entièrement par le backend NestJS
2. **URL de callback** : Doit être `http://localhost:3001/api/auth/github/callback` (avec le prefix /api/)
3. **Redirection après authentification** : L'API redirige vers le frontend avec le token JWT

## Production

Pour la production, remplacez `localhost:3001` par votre domaine API et `localhost:3000` par votre domaine frontend :

```
https://api.votre-domaine.com/api/auth/github/callback
```

GITHUB_CLIENT_SECRET=your-github-client-secret

# Frontend URL

FRONTEND_URL=http://localhost:3000

```

## Points importants :

1. **Une seule app GitHub OAuth** : Utilisez les mêmes `CLIENT_ID` et `CLIENT_SECRET` pour le frontend et l'API
2. **URL de callback NextAuth** : Doit être `http://localhost:3000/api/auth/callback/github`
3. **Synchronisation avec l'API** : L'authentification se fait via NextAuth, puis synchronise avec votre API backend

## Production

Pour la production, remplacez `localhost:3000` par votre domaine :

```

https://votre-domaine.com/api/auth/callback/github

```

```
