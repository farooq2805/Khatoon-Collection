#!/usr/bin/env bash
# Refreshes the long-lived Instagram access token (valid 60 days) so the
# homepage reels keep syncing. Runs monthly from root's crontab:
#   0 3 1 * * bash /home/khatooncollection/htdocs/khatooncollection.in/deploy/refresh-instagram-token.sh
set -euo pipefail

TOKEN_FILE=/home/khatooncollection/instagram-token.txt
[ -s "$TOKEN_FILE" ] || { echo "No token in $TOKEN_FILE"; exit 1; }

current=$(tr -d '[:space:]' < "$TOKEN_FILE")
response=$(curl -fsS "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${current}")
new=$(printf '%s' "$response" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const t=JSON.parse(s).access_token;if(!t)process.exit(1);process.stdout.write(t)})')

umask 077
printf '%s\n' "$new" > "$TOKEN_FILE.tmp" && mv "$TOKEN_FILE.tmp" "$TOKEN_FILE"
chown khatooncollection:khatooncollection "$TOKEN_FILE"
echo "Instagram token refreshed $(date -Is)"
