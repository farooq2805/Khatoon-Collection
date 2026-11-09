# Deploying khatooncollection.in on our own server

The storefront runs on the same Ubuntu server as the API (72.62.196.65), behind Nginx, managed by PM2 on port 3003.

```
Browser ──HTTPS──> Nginx (:443) ──> Next.js (PM2, 127.0.0.1:3003) ──> api.khatooncollection.in
```

## 1. Copy the environment variables from Vercel

Vercel → khatoon-collection → Settings → Environment Variables. Note the values for every key listed in `.env.example`.
Generate a new `PROSPECTS_API_KEY` (any long random string, e.g. `openssl rand -hex 32`).

## 2. One-time server setup (SSH in as root)

```bash
curl -fsSL https://raw.githubusercontent.com/farooq2805/Khatoon-Collection/main/deploy/setup-server.sh -o setup-server.sh
bash setup-server.sh
nano /var/www/khatoon-web/.env.production      # paste the values from step 1
bash /var/www/khatoon-web/deploy/deploy.sh
pm2 startup                                      # run the command it prints, so the site survives reboots
```

Check the app answers locally: `curl -I http://127.0.0.1:3003` should return `200`.

## 3. Nginx

```bash
cp /var/www/khatoon-web/deploy/nginx-khatooncollection.conf /etc/nginx/sites-available/khatooncollection.in
ln -s /etc/nginx/sites-available/khatooncollection.in /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 4. Point the domain at the server

At the domain registrar / DNS provider:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `72.62.196.65` (replaces `76.76.21.21`) |
| A | `www` | `72.62.196.65` (replace the Vercel CNAME/A) |

Remove any AAAA records pointing at Vercel. Then remove the domain from the Vercel project (Settings → Domains) so Vercel stops claiming it.

## 5. HTTPS (after DNS has switched — check with `nslookup khatooncollection.in`)

```bash
certbot --nginx -d khatooncollection.in -d www.khatooncollection.in --redirect
```

Certbot renews automatically.

## Updating the site later

Push to `main` on GitHub, then on the server:

```bash
bash /var/www/khatoon-web/deploy/deploy.sh
```

## Troubleshooting

- Logs: `pm2 logs khatoon-web`
- Restart: `pm2 restart khatoon-web`
- Build killed / "JavaScript heap out of memory": the server needs more RAM or swap (setup script adds 2 GB swap on small servers).
