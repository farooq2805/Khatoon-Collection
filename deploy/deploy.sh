#!/usr/bin/env bash
# Pull the latest code, build, and restart. Run on the server:
#   bash /var/www/khatoon-web/deploy/deploy.sh
set -euo pipefail
cd /var/www/khatoon-web

git fetch origin
git reset --hard "origin/${BRANCH:-main}"

if [ ! -f .env.production ]; then
  echo "Missing .env.production (see .env.example)"; exit 1
fi

npm ci --no-audit --no-fund
NODE_OPTIONS=--max-old-space-size=1536 npm run build

pm2 startOrReload deploy/ecosystem.config.js
pm2 save
echo "Deployed $(git log --oneline -1)"
