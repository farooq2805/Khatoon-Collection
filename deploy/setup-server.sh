#!/usr/bin/env bash
# One-time setup on the Ubuntu server (72.62.196.65). Run as root:
#   bash setup-server.sh
set -euo pipefail

REPO=https://github.com/farooq2805/Khatoon-Collection.git
APP_DIR=/var/www/khatoon-web

# Node 20 LTS + PM2 (skip if already installed for the API)
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
command -v pm2 >/dev/null || npm install -g pm2
command -v certbot >/dev/null || apt-get install -y certbot python3-certbot-nginx

# Next.js builds need ~1.5 GB RAM; add swap on small servers
if [ "$(free -m | awk '/Mem:/{print $2}')" -lt 3000 ] && ! swapon --show | grep -q swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

if ss -ltn | grep -q ':3003 '; then
  echo "Port 3003 is already in use; change it in deploy/ecosystem.config.js and the nginx file"; exit 1
fi

[ -d "$APP_DIR/.git" ] || git clone "$REPO" "$APP_DIR"
cd "$APP_DIR"
git checkout "${BRANCH:-main}"

if [ ! -f .env.production ]; then
  cp .env.example .env.production
  echo "Fill in $APP_DIR/.env.production, then run: bash $APP_DIR/deploy/deploy.sh"
  exit 0
fi
