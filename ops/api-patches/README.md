# API patches

The API (`api.khatooncollection.in`) runs on the VPS from compiled code only
(`/home/khatooncollection-api/htdocs/api.khatooncollection.in/dist`), with no source repository.
Changes to it are kept here so they are reviewable and repeatable.

| File | What it does |
|------|--------------|
| `services/reportEmails.js` | Redesigned owner emails: daily revenue report (8 AM IST) and website health report (6 AM IST). Revenue goes to farooq2805, sabirpathan1987 and khatooncollectionkc (@gmail.com); health to farooq2805@gmail.com. |
| `install.sh` | Installs the module, points both jobs at it, switches off the Shiprocket shipment job, restarts the API. Backs up originals to `/root/api-backup-before-report-emails`. `bash install.sh rollback` restores them. |
| `send-now.js` | Sends both emails immediately. |

Revenue counts only successfully paid orders (not cancelled). Orders still awaiting payment are shown separately.
The old Instagram-reel check is no longer part of the health status: homepage reels now come straight from Instagram's API.
