# PalmAI — Setup & Deploy

## Run locally (3 steps)

### 1. Add your API key
Open `.env.local` and replace `your_key_here`:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx
```
Get your key at: https://console.anthropic.com

### 2. Install & run
```bash
npm install
npm run dev
```

### 3. Open browser
http://localhost:3000

---

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → import your repo
3. In Vercel: Settings → Environment Variables → add `ANTHROPIC_API_KEY`
4. Click Deploy

---

## Project structure
```
palmai/
├── app/
│   ├── layout.js              ← root layout
│   ├── page.jsx               ← full UI (guru image embedded)
│   └── api/
│       └── analyze/
│           └── route.js       ← Anthropic API call
├── .env.local                 ← YOUR API KEY (never commit this)
├── next.config.js
└── package.json
```
