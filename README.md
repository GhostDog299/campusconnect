# CampusConnect

A university-specific academic network for students, peers, and professors.  
Built with **React + Vite** (frontend) and **Node.js + Express** (backend).

---

## What's included

| Feature | Description |
|---|---|
| .edu Auth | Register/login with university email only |
| Major Feed | Post updates visible to your major cohort |
| People | Discover and connect with peers and faculty |
| Resources | Upload and download notes, practice exams, guides |
| Study Groups | Create or join groups with meeting times and locations |
| Profile | Skills, bio, stats, reputation score |

Demo accounts (pre-seeded):
- `alex@university.edu` / `demo123` — Year 3 Software Engineering student  
- `priya@university.edu` / `demo123` — Year 2 Mechatronics student  
- `j.okafor@university.edu` / `demo123` — Professor account  

---

## Local development (5 minutes)

### Prerequisites
- Node.js 18+ installed ([nodejs.org](https://nodejs.org))
- A terminal

### Steps

```bash
# 1. Clone or download this project
cd campusconnect

# 2. Install all dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# 3. Set up the server environment
cp server/.env.example server/.env
# Open server/.env and change JWT_SECRET to any random string

# 4. Start both servers at once (from root folder)
npm run dev
```

Then open **http://localhost:5173** in your browser.

The React app runs on port 5173.  
The API server runs on port 3001.  
Vite proxies `/api/*` requests to the backend automatically.

---

## Hosting on Vercel + Railway (recommended free tier)

This app has two parts: a frontend (Vercel) and a backend (Railway).

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial CampusConnect"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/campusconnect.git
git push -u origin main
```

### Step 2 — Deploy the backend on Railway

1. Go to [railway.app](https://railway.app) and sign up (free tier available)
2. Click **New Project → Deploy from GitHub repo**
3. Select your `campusconnect` repo
4. Railway auto-detects Node.js — set the **Root Directory** to `server`
5. Under **Variables**, add:
   - `JWT_SECRET` = any long random string (e.g. 64 random characters)
   - `CLIENT_URL` = `https://your-app.vercel.app` (you'll fill this in after Step 3)
   - `PORT` = `5000`
6. Deploy — Railway gives you a URL like `https://campusconnect.up.railway.app`

### Step 3 — Deploy the frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New → Project** and import your repo
3. Set **Root Directory** to `client`
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = your Railway URL (e.g. `https://campusconnect.up.railway.app`)
5. Open `client/vercel.json` and replace `your-backend-url.railway.app` with your actual Railway URL
6. Click **Deploy** — Vercel gives you a URL like `https://campusconnect.vercel.app`

### Step 4 — Connect them

Go back to Railway and update `CLIENT_URL` to your Vercel URL.  
Redeploy the backend. Done!

---

## Project structure

```
campusconnect/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Sidebar, shared UI helpers
│   │   ├── context/         # AuthContext (global user state)
│   │   ├── pages/           # Feed, People, Resources, Groups, Profile
│   │   ├── App.jsx          # Router + layout
│   │   └── index.css        # Full design system
│   ├── index.html
│   └── vite.config.js       # Dev proxy config
│
└── server/                  # Node.js + Express backend
    ├── index.js             # All routes + in-memory DB
    └── .env.example         # Environment variable template
```

---

## Moving to a real database (next step)

The backend currently uses **in-memory storage** — data resets on restart. To persist data:

1. Install PostgreSQL or use [Supabase](https://supabase.com) (free hosted Postgres)
2. Install the `pg` package: `npm install pg`
3. Replace the `db` object in `server/index.js` with SQL queries
4. Use [Prisma](https://prisma.io) as an ORM to make this easier — it generates types from your schema

Recommended schema tables: `users`, `posts`, `comments`, `resources`, `study_groups`, `group_members`, `connections`

---

## Customisation

**Change allowed universities**: In `server/index.js`, modify the `.edu` check in `/api/auth/register` to validate specific domains:
```js
const allowedDomains = ["utoronto.ca", "mcmaster.ca", "uwaterloo.ca"];
const domain = email.split("@")[1];
if (!allowedDomains.includes(domain)) return res.status(400).json({ error: "University not supported yet" });
```

**Add majors**: Edit the `MAJORS` array in `client/src/components/Shared.jsx`

**Change branding/colors**: All CSS variables are in `client/src/index.css` under `:root`

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Vite |
| Backend | Node.js, Express |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Styling | Pure CSS with CSS variables |
| Fonts | Syne (display), DM Sans (body) |
| Hosting | Vercel (frontend), Railway (backend) |
| Database | In-memory (swap for Postgres in production) |
