# SyncBooth — Production Deployment Guide

This guide details step-by-step instructions to deploy **SyncBooth** to production.

---

## 🏗 Architecture Overview

```
+------------------------------------+          +------------------------------------+
|          Frontend Client           |          |           Backend Server           |
|  (Vercel / Netlify / Cloudflare)   |  HTTPS   |     (Render / Railway / Fly.io)    |
|   React + Vite SPA on CDN Edge     |<-------->|   Express API & Socket.IO Signaling|
+------------------------------------+  Socket  +-----------------+------------------+
                                                                  |
                                                                  | Persistent SQLite
                                                                  v
                                                        +------------------+
                                                        |  SQLite / Cloud  |
                                                        |   syncbooth.db   |
                                                        +------------------+
```

---

## 🚀 Step 1: Prepare Git Repository

Ensure all changes are committed and pushed to your GitHub or Git hosting service:

```bash
# Verify working tree status
git status

# Commit any pending changes
git add .
git commit -m "Prepare SyncBooth for production deployment"
git push origin main
```

Ensure `.env`, `node_modules/`, and `.db` files are excluded by `.gitignore`.

---

## ⚡ Step 2: Deploy Backend Server

Deploy the Node.js Express + Socket.IO server to a cloud provider like **Render**, **Railway**, or **Fly.io**.

### Option A: Render (Web Service)
1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the **Root Directory** to `server`.
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `npm start` (runs `node src/server.js`).
7. Select your instance plan (e.g. Free or Starter).

---

## 🔑 Step 3: Configure Backend Environment Variables

In your backend provider dashboard (e.g., Render Environment Variables), add the following environment variables:

| Variable | Recommended Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Set Node.js production mode |
| `PORT` | `10000` (or host provided) | Server HTTP listening port |
| `CLIENT_URL` | `https://your-syncbooth-frontend.vercel.app` | Production frontend origin for CORS |
| `JWT_SECRET` | `generate_a_long_random_64_char_secret_string` | Secret key used to sign JWT authentication tokens |
| `DATABASE_PATH` | `./syncbooth.db` (or persistent disk path) | SQLite database storage path |

---

## 🗄️ Step 4: Configure Database

SyncBooth uses a persistent SQLite database (`syncbooth.db`) by default:

1. **Persistent Disk (Render/Railway)**: On Render, add a **Disk** mounted at `/var/data` and set `DATABASE_PATH=/var/data/syncbooth.db`.
2. **Auto-Initialization**: The database tables (`users`, `strips`) automatically self-initialize on first startup.

---

## 🌐 Step 5: Deploy Frontend Client

Deploy the React Vite application to **Vercel** or **Netlify**.

### Option A: Vercel
1. Log into [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Set **Root Directory** to `client`.
5. Framework Preset: **Vite**.
6. Build Command: `npm run build`
7. Output Directory: `dist`

---

## 🔧 Step 6: Configure Frontend Environment Variables

In Vercel / Netlify environment variable settings, configure:

| Variable | Value | Description |
|---|---|---|
| `VITE_SERVER_URL` | `https://your-backend-api.onrender.com` | Production backend server URL |

> ⚠️ **Note**: After adding `VITE_SERVER_URL`, trigger a re-deploy on Vercel so Vite bakes the production URL into the client bundle.

---

## 🔗 Step 7: Connect Frontend to Backend

Verify that your deployed frontend can communicate with your backend:

1. Open your browser DevTools network tab on the deployed frontend (`https://your-syncbooth-frontend.vercel.app`).
2. Verify that API calls target `https://your-backend-api.onrender.com/api/health`.
3. Check for successful `200 OK` status response.

---

## 🛡️ Step 8: Configure CORS & WebSockets

1. Ensure `CLIENT_URL` on the backend matches the exact origin of your production frontend (e.g. `https://your-syncbooth-frontend.vercel.app`).
2. Do **not** use `CLIENT_URL=*` in production.
3. Socket.IO will automatically establish WebSocket connections over HTTPS (`wss://`).

---

## 🧪 Step 9: Test Production Authentication Flow

Run the end-to-end verification checklist on the live site:

1. Visit `https://your-syncbooth-frontend.vercel.app/register`.
2. Register a new user (`Name: Production Test`, `Email: test@example.com`).
3. Verify successful creation and immediate authentication state in Navbar.
4. Log out and navigate to `/login`.
5. Log in with `test@example.com` and verify profile page access.
6. Verify session persistence after hard-refreshing the page.

---

## 📷 Step 10: Test Real-Time Photobooth Session

1. Click **Create Shared Booth** on Window A to get a room code (e.g. `X9K2P1`).
2. Open Window B (or send link to another device) `/?room=X9K2P1`.
3. Allow camera access.
4. Confirm low-latency WebRTC P2P stream connection.
5. Apply live CSS filters and trigger 3-2-1 snapshot countdown.
6. Download the composited photobooth strip JPEG file.

---

## 📋 Security Posture Checklist

- [x] Passwords salted and hashed with `bcryptjs` (cost factor 10).
- [x] JWT sessions signed with secret `JWT_SECRET`.
- [x] Strict CORS origin validation on Express REST API & Socket.IO.
- [x] HTTPS enforced on WebRTC media streams (`getUserMedia` requires HTTPS).
- [x] Sensitive backend credentials protected in `.env`.
