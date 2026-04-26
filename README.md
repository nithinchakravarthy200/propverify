# TrustOS — Real Estate Truth Platform

A clean, production-ready real estate website inspired by 99acres and MagicBricks, built with React + Vite.

## Features
- 🏠 Home page with hero search, featured properties, city explorer
- 🔍 Listings page with filters (city, type, BHK, budget, status, RERA)
- 📋 Property detail with gallery, Trust Scores, legal info, contact form
- 🏗 Builder profile with Trust Index, compliance record, projects
- ✅ TrustOS scores: Builder Trust Index, Legal Score, Sunlight Score
- 📱 Fully responsive

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
```

Output goes to `dist/` folder.

## Deploy to Vercel

### Option 1 — Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2 — GitHub + Vercel Dashboard

1. Push this repo to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - TrustOS real estate platform"
git remote add origin https://github.com/YOUR_USERNAME/trustos.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Vercel auto-detects Vite — no extra configuration needed
5. Click **Deploy** ✅

The `vercel.json` file handles SPA routing automatically.

## Deploy to GitHub Pages

```bash
npm run build
# Then push the dist/ folder to gh-pages branch
```

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx / .css
│   ├── Footer.jsx / .css
│   ├── PropertyCard.jsx / .css
│   └── SearchBar.jsx / .css
├── pages/
│   ├── Home.jsx / .css
│   ├── Listings.jsx / .css
│   ├── PropertyDetail.jsx / .css
│   └── BuilderDetail.jsx / .css
├── data/
│   └── properties.js       ← Mock data (replace with API)
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## Customization

- **Add real data**: Replace `src/data/properties.js` with API calls
- **Add pages**: Create files in `src/pages/` and add routes in `App.jsx`
- **Change colors**: Edit CSS variables in `src/index.css`
- **Add map**: Integrate Google Maps or Mapbox in `PropertyDetail.jsx`
