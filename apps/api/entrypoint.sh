#!/bin/sh
set -e

echo "Starting API..."
exec node dist/main.js
