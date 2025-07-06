# Migration GitHub OAuth App vers GitHub App

Ce document décrit la transition de Quori vers une **GitHub App** unique permettant de recevoir les events `push` et `pull_request`.

## 1. Plan de migration

1. **Création de l\'App** sur GitHub avec les paramètres :
   - Callback: `https://api.quori.app/github/callback`
   - Webhook: `https://api.quori.app/webhooks/github`
   - Permissions : `Contents` *(Read-only)*, `Pull requests` *(Read)*, `Metadata` *(Read)*
   - Événements: `push`, `pull_request`
2. **Déploiement de l\'endpoint `/webhooks/github`** dans l\'API NestJS.
3. **Onboarding utilisateur** : lien d\'installation de l\'App sur ses repositories.
4. **Migration des anciens webhooks OAuth** via le script `scripts/migrate-installation.ts`.
5. **Monitoring** et déploiement progressif (canary). Si incident majeur, rollback en réactivant les anciens webhooks.

## 2. Spécification technique

- **Endpoint**: `POST /webhooks/github`
- **Sécurité**:
  - Vérification de l\'en-tête `X-Hub-Signature-256` (HMAC SHA-256)
  - Gestion de l\'idempotence via l\'ID `X-GitHub-Delivery` stocké en base/Redis
- **Permissions GitHub App**: `Contents: Read-only`, `Pull requests: Read`, `Metadata: Read`
- **Obtention des tokens**: échange JWT → `access_token` d\'installation valable 1 h
- **Queue**: BullMQ + Redis, nom `github-events`
- **Payloads**: ceux des events `push` et `pull_request` officiels de GitHub

## 3. Exemple de code NestJS

```ts
@Post('/webhooks/github')
async handleWebhook(@Req() req: Request, @Body() body: any) {
  this.webhookService.verifySignature(req);
  await this.webhookService.enqueueEvent(req.headers['x-github-delivery'] as string, body);
  return { status: 'queued' };
}
```

## 4. Script de transition utilisateur

1. L\'utilisateur clique sur **Install App** et autorise les dépôts souhaités.
2. Lancer `npm run migrate:repos -- --token <OAUTH_TOKEN> --installation <ID>` pour ajouter les anciens dépôts à l\'installation via REST.

## 5. Checklist sécurité & conformité

- Secrets stockés dans `env` ou vault (clé privée, secret webhook)
- Rotation régulière et permissions minimales
- Journaux d\'accès aux webhooks conservés 30 jours
- Données personnelles limitées (RGPD)
- Tokens chiffrés au repos
