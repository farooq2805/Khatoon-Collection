# Khatoon Collection admin dashboard

React + Vite + Tailwind. Talks to the store API (`https://api.khatooncollection.in/api`)
and shares the login with the classic dashboard (`localStorage.adminToken`).

```bash
cd dashboard
npm install
npm run dev      # http://localhost:5173/new/
npm run build    # dist/ (deploy/deploy.sh builds and publishes it automatically)
```

Pages: Overview, Orders (+ detail), Abandoned checkouts, Customers, Products.
Product editing, categories, coupons, reviews and banners still open in the classic dashboard.
