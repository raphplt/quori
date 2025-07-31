# Endpoints SSE (Server-Sent Events)

Ce document décrit les endpoints SSE implémentés pour fournir des mises à jour en temps réel.

## Authentification

Tous les endpoints SSE nécessitent un token JWT valide passé en paramètre de requête :

```
GET /endpoint/stream?token=YOUR_JWT_TOKEN
```

## Endpoints disponibles

### 1. Événements GitHub avec mises à jour

**Endpoint :** `GET /github/events/stream`

**Description :** Stream des événements GitHub avec mises à jour en temps réel.

**Événements émis :**

- `events` : Liste initiale des événements
- `new-event` : Nouvel événement reçu
- `events-update` : Mise à jour de la liste des événements

**Exemple de réponse :**

```json
{
  "type": "events",
  "events": [
    {
      "delivery_id": "123",
      "event": "push",
      "repo_full_name": "user/repo",
      "status": "processed",
      "received_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. Statistiques des posts

**Endpoint :** `GET /github/posts/stats/stream`

**Description :** Stream des statistiques des posts par statut.

**Événements émis :**

- `stats` : Statistiques initiales (compteurs)
- `posts-by-status` : Posts par statut (données complètes)
- `stats-update` : Mise à jour des statistiques
- `posts-update` : Mise à jour des posts par statut

**Exemple de réponse :**

```json
{
  "type": "stats",
  "stats": {
    "drafts": 5,
    "ready": 2,
    "scheduled": 3,
    "published": 10,
    "failed": 1
  }
}
```

### 3. Quota utilisateur

**Endpoint :** `GET /quota/stream`

**Description :** Stream du quota utilisateur avec mises à jour.

**Événements émis :**

- `quota` : Quota initial
- `quota-update` : Mise à jour du quota

**Exemple de réponse :**

```json
{
  "type": "quota",
  "quota": {
    "used": 3,
    "remaining": 2
  }
}
```

### 4. Count des événements (existant)

**Endpoint :** `GET /github/events/length/stream`

**Description :** Stream du nombre total d'événements.

**Événements émis :**

- `count` : Nombre d'événements

**Exemple de réponse :**

```json
{
  "type": "count",
  "count": 150
}
```

## Configuration CORS

Tous les endpoints SSE incluent les headers CORS appropriés :

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: Cache-Control, Last-Event-ID
Cache-Control: no-cache
Connection: keep-alive
Content-Type: text/event-stream; charset=utf-8
```

## Gestion des erreurs

En cas d'erreur d'authentification :

- Status : 401 Unauthorized
- Message : "Token required" ou "Invalid token"

## Reconnexion automatique

Les clients SSE gèrent automatiquement la reconnexion avec un backoff exponentiel :

- Tentatives maximales : 3
- Délai initial : 1 seconde
- Délai maximum : 30 secondes

## Utilisation côté client

```javascript
const eventSource = new EventSource(
  '/api/github/posts/stats/stream?token=YOUR_TOKEN',
);

eventSource.addEventListener('stats', (event) => {
  const data = JSON.parse(event.data);
  console.log('Stats mises à jour:', data.stats);
});

eventSource.addEventListener('posts-by-status', (event) => {
  const data = JSON.parse(event.data);
  console.log('Posts mis à jour:', data.postsByStatus);
});

eventSource.onerror = (error) => {
  console.error('Erreur SSE:', error);
};
```
