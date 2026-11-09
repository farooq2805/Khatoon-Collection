# Deploying khatooncollection.in

The storefront runs on the Hostinger VPS (72.62.196.65, CloudPanel on Ubuntu 24.04), next to the API.

```
Browser ──HTTPS──> Nginx (CloudPanel site, rate limited) ──> Next.js (PM2 "khatoon-web", 127.0.0.1:3003) ──> api.khatooncollection.in
```

| What | Where |
|------|-------|
| Live code | `/home/khatooncollection/htdocs/khatooncollection.in` |
| Previous release (rollback) | `/home/khatooncollection/release-previous` |
| Env vars | `.env.production` in the live folder (copied into every release) |
| Nginx site | `/etc/nginx/sites-enabled/khatooncollection.in.conf` (edit via CloudPanel → Sites → Vhost) |
| Process | `pm2 list` / `pm2 logs khatoon-web` (as root) |

## Deploy the latest `main`

Open Hostinger → VPS → Web console (or SSH as root) and run:

```bash
bash /home/khatooncollection/htdocs/khatooncollection.in/deploy/deploy.sh
```

It builds in a separate folder while the current site keeps running, then swaps it in.

Something wrong after a deploy? Roll back:

```bash
ROLLBACK=1 bash /home/khatooncollection/htdocs/khatooncollection.in/deploy/deploy.sh
```

## Rate limiting

The vhost limits each IP to 20 requests/second (burst 40) and answers `429` beyond that.
If you edit the vhost in CloudPanel, keep these lines:

- top of the file: `limit_req_zone $binary_remote_addr zone=khatoon_web:10m rate=20r/s;` and `limit_req_status 429;`
- in `location /`, before `proxy_pass`: `limit_req zone=khatoon_web burst=40 nodelay;`

## SSL

CloudPanel → Sites → khatooncollection.in → SSL/TLS → Actions → New Let's Encrypt Certificate
(or `clpctl lets-encrypt:install:certificate --domainName=khatooncollection.in --subjectAlternativeName=www.khatooncollection.in`).
It only works while the domain's DNS points at 72.62.196.65.
