#!/usr/bin/env bash
# Build the latest code in a fresh folder, then swap it in with a few seconds of downtime.
# Run on the VPS as root:   bash /home/khatooncollection/htdocs/khatooncollection.in/deploy/deploy.sh
# Roll back:                ROLLBACK=1 bash .../deploy.sh
set -euo pipefail

HOME_DIR=/home/khatooncollection
LIVE=$HOME_DIR/htdocs/khatooncollection.in
NEW=$HOME_DIR/release-new
PREV=$HOME_DIR/release-previous
BRANCH=${BRANCH:-main}

if [ "${ROLLBACK:-0}" = "1" ]; then
  [ -d "$PREV" ] || { echo "No previous release to roll back to"; exit 1; }
  mv "$LIVE" "$HOME_DIR/release-failed-$(date +%s)" && mv "$PREV" "$LIVE"
  pm2 restart khatoon-web && echo "Rolled back"; exit 0
fi

API_ENV=/home/khatooncollection-api/htdocs/api.khatooncollection.in/.env
DASHBOARD_WEBROOT=/home/khatooncollection-api/htdocs/dashboard.khatooncollection.in

# The store shares the API's database (abandoned-cart storage); copy the
# connection string over once, without printing it.
if ! grep -q '^DATABASE_URL=' "$LIVE/.env.production" && grep -q '^DATABASE_URL=' "$API_ENV"; then
  grep '^DATABASE_URL=' "$API_ENV" >> "$LIVE/.env.production"
fi

rm -rf "$NEW"
git clone -q --depth 1 -b "$BRANCH" https://github.com/farooq2805/Khatoon-Collection.git "$NEW"
cp "$LIVE/.env.production" "$NEW/"
cp -a "$LIVE/.well-known" "$NEW/" 2>/dev/null || true
cd "$NEW"
npm ci --no-audit --no-fund
npm run build

# Admin dashboard (dashboard/): published as app.html + app-assets/ in the
# dashboard webroot. Nginx sends the rebuilt pages to app.html and everything
# else to the classic dashboard (index.html + assets/) on the same domain.
if [ -d "$NEW/dashboard" ]; then
  (cd "$NEW/dashboard" && npm ci --no-audit --no-fund && npm run build)
  rm -rf "$DASHBOARD_WEBROOT/app-assets.tmp"
  cp -a "$NEW/dashboard/dist/app-assets" "$DASHBOARD_WEBROOT/app-assets.tmp"
  cp "$NEW/dashboard/dist/index.html" "$DASHBOARD_WEBROOT/app.html.tmp"
  # keep the previous build's chunks so open tabs don't break mid-deploy
  cp -an "$DASHBOARD_WEBROOT/app-assets/." "$DASHBOARD_WEBROOT/app-assets.tmp/" 2>/dev/null || true
  rm -rf "$DASHBOARD_WEBROOT/app-assets"
  mv "$DASHBOARD_WEBROOT/app-assets.tmp" "$DASHBOARD_WEBROOT/app-assets"
  mv "$DASHBOARD_WEBROOT/app.html.tmp" "$DASHBOARD_WEBROOT/app.html"
  rm -rf "$DASHBOARD_WEBROOT/new"
  chown -R khatoon_sftp:khatooncollection-api "$DASHBOARD_WEBROOT/app-assets" "$DASHBOARD_WEBROOT/app.html"
  rm -rf "$NEW/dashboard/node_modules"
fi

rm -rf "$PREV"
mv "$LIVE" "$PREV"
mv "$NEW" "$LIVE"
chown -R khatooncollection:khatooncollection "$LIVE"
pm2 restart khatoon-web

sleep 5
code=$(curl -sk -o /dev/null -w '%{http_code}' --resolve khatooncollection.in:443:127.0.0.1 https://khatooncollection.in/)
echo "Deployed $(git -c safe.directory='*' -C "$LIVE" log --oneline -1) - homepage HTTP $code"
[ "$code" = "200" ] || echo "WARNING: homepage not 200; run with ROLLBACK=1 to restore the previous release"
