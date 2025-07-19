# Étape 1 : build dans la racine
FROM node:20-alpine AS build
WORKDIR /repo

# Copier uniquement ce qui sert à résoudre les deps
COPY package*.json ./
# Copier les dossiers packages et apps s'ils existent
COPY packages ./packages 2>/dev/null || true
COPY apps ./apps 2>/dev/null || true
COPY apps/api/package*.json ./apps/api/

RUN npm install --omit=dev --workspaces --include-workspace-root

# Copier le reste du code
COPY . .

# Construire seulement l'API
WORKDIR /repo/apps/api
RUN npm run build
RUN npm prune --omit=dev

# Étape 2 : image finale légère
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# Copier node_modules du build (monorepo)
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/package*.json ./
COPY --from=build /repo/apps/api/package*.json ./apps/api/
COPY --from=build /repo/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/main.js"]
