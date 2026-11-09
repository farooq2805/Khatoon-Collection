#!/usr/bin/env bash
# Installs the redesigned owner emails into the API and switches off Shiprocket.
# Run on the VPS as root:
#   bash install.sh            install (safe to run again)
#   bash install.sh rollback   restore the files from before the first install
set -euo pipefail

API=/home/khatooncollection-api/htdocs/api.khatooncollection.in
DIST=$API/dist
BACKUP=/root/api-backup-before-report-emails
RAW=https://raw.githubusercontent.com/farooq2805/Khatoon-Collection/main/ops/api-patches
FILES="jobs/dailySalesReportCron.js jobs/dailyHealthCheckCron.js server.js"

if [ "${1:-}" = "rollback" ]; then
  for f in $FILES; do cp -p "$BACKUP/$(basename $f)" "$DIST/$f"; done
  rm -f "$DIST/services/reportEmails.js"
  pm2 restart khatooncollection-api >/dev/null && echo "Rolled back"
  exit 0
fi

# 1. Back up the originals once
if [ ! -d "$BACKUP" ]; then
  mkdir -p "$BACKUP"
  for f in $FILES; do cp -p "$DIST/$f" "$BACKUP/"; done
fi

# 2. New email module
curl -fsSL "$RAW/services/reportEmails.js" -o "$DIST/services/reportEmails.js"

# 3. Revenue cron -> new report
sed -i 's#require("../services/dailySalesReport")#require("../services/reportEmails")#' "$DIST/jobs/dailySalesReportCron.js"

# 4. Health check keeps its checks, emails the new design
H=$DIST/jobs/dailyHealthCheckCron.js
if ! grep -q 'sendHealthEmailReportLegacy' "$H"; then
  sed -i 's/^async function sendHealthEmailReport(report) {/async function sendHealthEmailReportLegacy(report) {/' "$H"
  cat >> "$H" <<'EOF'
// Redesigned health email (services/reportEmails.js)
async function sendHealthEmailReport(report) {
    return require("../services/reportEmails").sendHealthEmail(report);
}
EOF
fi

# 5. Shiprocket is not used: stop the 4-hourly shipment job
sed -i 's#^(0, shipmentCron_1.startShipmentCron)();#// Shiprocket not used: (0, shipmentCron_1.startShipmentCron)();#' "$DIST/server.js"

# 6. Verify, then restart
for f in services/reportEmails.js $FILES; do node --check "$DIST/$f"; done
grep -q 'require("../services/reportEmails")' "$DIST/jobs/dailySalesReportCron.js"
grep -q '^// Shiprocket not used' "$DIST/server.js"
pm2 restart khatooncollection-api >/dev/null
sleep 5
pm2 list | grep -q 'khatooncollection-api.*online'
echo "Installed. API $(curl -s -o /dev/null -w '%{http_code}' https://api.khatooncollection.in/api/categories)"
