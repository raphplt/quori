# ========== Étape 1 : Build ==========
FROM node:20-alpine AS build
WORKDIR /repo
ENV NODE_ENV=development

# 1. Copier manifests racine + API (pour tirer parti du cache)
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# 2. Installer dépendances (workspaces).
# Si tu as un seul workspace API, ça installera tout ce qui est requis.
# On garde les dev deps pour pouvoir build.
RUN npm install --workspaces --include-workspace-root

# 3. Copier le reste du code
COPY . .

# 4. Build API
WORKDIR /repo/apps/api
RUN npm run build

# 5. Prune pour ne garder que prod (en retirant dev deps)
WORKDIR /repo
RUN npm prune --omit=dev || true

# ========== Étape 2 : Runtime ==========
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# 6. Copier artefacts build + node_modules
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/src/main.js"]