#!/bin/sh
set -e

echo "Running DB migrations..."

# Cherche le script compilé
for p in \
  dist/scripts/run-migrations.js \
  dist/src/scripts/run-migrations.js \
  dist/apps/api/scripts/run-migrations.js
do
  if [ -f "$p" ]; then
    node "$p"
    FOUND=1
    break
  fi
done

if [ -z "$FOUND" ]; then
  echo "run-migrations.js introuvable. Contenu de dist:"
  ls -R dist
  exit 1
fi

echo "Starting API..."
exec node dist/main.js
