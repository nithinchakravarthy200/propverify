# PropVerify — Full Stack Real Estate Platform

React + Vite frontend with Supabase backend (PostgreSQL, Auth, Storage).

## Stack
- **Frontend**: React 18, React Router, Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Auth**: Phone OTP (India-friendly)
- **Images**: Supabase Storage (property-images bucket)

## Features
- 🏠 Public listings with search & filters
- 📋 Property detail with Trust Scores, Legal Score, Sunlight
- 🔐 Phone OTP sign-in (no password)
- 🛡 Admin Panel: Dashboard, Properties CRUD, Analytics, Inquiries
- 📷 Multi-image upload per property (Supabase Storage)
- 📊 Analytics: views, inquiries chart, city breakdown
- 📬 Inquiries: captured from contact form, managed in admin

---

## Setup — Step by Step

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a region close to India (Singapore recommended)
3. Save your DB password

### 2. Run the Database Schema
1. Supabase Dashboard → **SQL Editor** → **New Query**
2. Paste the entire contents of `supabase-schema.sql`
3. Click **Run**

### 3. Enable Phone Auth
1. Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Phone** provider
3. For testing use Supabase's built-in OTP (no Twilio needed for dev)
4. For production: add Twilio credentials

### 4. Set Environment Variables
```bash
cp .env.example .env.local
```
Fill in from **Supabase → Settings → API**:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run Locally
```bash
npm install
npm run dev
# → http://localhost:5173
```

### 6. Make Yourself Admin
After your first Phone OTP login:
1. Supabase → **Table Editor** → `profiles`
2. Find your row (by phone number)
3. Set `role` = `admin`
4. Or run in SQL Editor:
```sql
UPDATE public.profiles SET role = 'admin' WHERE phone = '+91XXXXXXXXXX';
```

---

## Deploy to Vercel

### Add Environment Variables in Vercel
1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` → your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
3. Redeploy

### Push to GitHub (triggers auto-deploy)
```bash
git add .
git commit -m "Full stack upgrade — Supabase auth, admin panel, analytics"
git push origin main
```

---

## Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Homepage |
| `/listings` | Public | Search & filter |
| `/property/:id` | Public | Property detail |
| `/login` | Public | Phone OTP sign-in |
| `/admin` | Admin only | Dashboard |
| `/admin/properties` | Admin only | Manage listings |
| `/admin/add-property` | Admin only | Add new property |
| `/admin/edit-property/:id` | Admin only | Edit property |
| `/admin/inquiries` | Admin only | Manage leads |
| `/admin/analytics` | Admin only | Analytics |
