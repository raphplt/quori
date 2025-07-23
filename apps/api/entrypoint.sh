#!/bin/sh
set -e

echo "Running DB migrations..."
node dist/src/scripts/run-migrations.js

echo "Starting API..."
exec node dist/src/main.js
