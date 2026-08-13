# SyncBooth — Production Deployment Guide

This guide details step-by-step instructions to deploy **SyncBooth** to production.

---

## 🏗 Architecture Overview

```
+------------------------------------+          +------------------------------------+
|          Frontend Client           |          |           Backend Server           |
|  (Vercel / Netlify / Cloudflare)   |  HTTPS   |     (Render / Railway / Fly.io)    |
|   React + Vite SPA on CDN Edge     |<-------->|   Express API & Socket.IO Signaling|
+------------------------------------+  Socket  +------------------------------------+
```

---

## 🚀 Step 1: Push Working Code to GitHub

Ensure all changes are committed and pushed:

```bash
git status
git add .
git commit -m "fix: remove native sqlite3 dependency to resolve GLIBC Linux deployment error"
git push origin main
```

Ensure `.env` and `node_modules/` are excluded by `.gitignore`.

---

## ⚡ Step 2: Configure Render Backend Deployment

Deploy the Node.js Express + Socket.IO server to **Render**:

1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `sivareddytalapareddy/SyncBooth`.
4. Configure service settings:
   - **Name**: `syncbooth-backend`
   - **Root Directory**: `server`
   - **Environment / Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

---

## 🔑 Step 3: Configure Backend Environment Variables

In Render **Environment Variables** tab, add:

| Variable | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Set Node.js production environment |
| `PORT` | `5001` (or leave default port assigned by Render) | Server listening port |
| `CLIENT_URL` | `https://your-frontend.vercel.app` (or `*` during initial setup) | Allowed origin for CORS |
| `JWT_SECRET` | `your_secure_random_64_character_jwt_secret` | Secret key for JWT signing |

---

## 🌐 Step 4: Deploy Frontend Client (Vercel)

1. Log into [Vercel Dashboard](https://vercel.com/new).
2. Import repository `sivareddytalapareddy/SyncBooth`.
3. Set **Root Directory**: `client`.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Add **Environment Variable**:
   - `VITE_SERVER_URL` = `https://your-backend-api.onrender.com` (Your Render backend URL)
8. Click **Deploy**.

---

## 🛡️ Step 5: Configure CORS & WebSockets

1. Update `CLIENT_URL` on Render to match your exact production frontend URL (e.g. `https://syncbooth.vercel.app`).
2. Socket.IO will automatically establish WebSocket connections over HTTPS (`wss://`).

---

## 📋 Security Posture Checklist

- [x] Pure JS authentication layer (zero native C++ compilation or GLIBC issues).
- [x] Passwords salted and hashed with `bcryptjs`.
- [x] JWT sessions signed with secret `JWT_SECRET`.
- [x] Strict CORS origin validation on Express REST API & Socket.IO.
- [x] HTTPS enforced on WebRTC media streams (`getUserMedia` requires HTTPS).
- [x] Sensitive backend credentials protected in `.env`.
