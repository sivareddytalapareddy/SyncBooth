# SyncBooth — Real-Time Collaborative Photo Booth

A full-stack, real-time collaborative photo booth web application built with **React**, **Node.js**, **Express**, **MongoDB**, **Socket.IO**, and **WebRTC**. SyncBooth allows two remote users anywhere in the world to join a private booth, stream live video feeds to each other peer-to-peer, apply vintage photo filters, initiate a synchronized 3-2-1 countdown, composite both video frames into a shared canvas, and download a custom photo strip.

---

## 🌟 Key Features

* **User Authentication & Security**:
  * Registration, login, and logout flow.
  * Passwords hashed securely using `bcrypt` (work factor 10). Password hashes are never returned to the frontend.
  * JWT session tokens issued via HTTP-only cookies and Bearer headers.
  * Protected REST API routes and authentication middleware.

* **Room Management & 2-User Capacity**:
  * Private booth creation generating a unique 6-character uppercase room code (e.g., `A7K92P`).
  * Direct shareable URLs (`/room/A7K92P`).
  * Strict maximum capacity of **2 participants** per room (Host & Guest).
  * Room status transitions: `WAITING` $\rightarrow$ `ACTIVE` $\rightarrow$ `CAPTURING` $\rightarrow$ `COMPLETED` $\rightarrow$ `CLOSED`.
  * Real-time notification when a partner connects or disconnects.

* **WebRTC Peer-to-Peer Video Streaming**:
  * Direct browser-to-browser media streaming using `RTCPeerConnection`.
  * Socket.IO used exclusively for WebRTC signaling (`offer`, `answer`, `ice-candidate`).
  * Google STUN server configuration (`stun:stun.l.google.com:19302`).
  * Explicit track teardown (`stream.getTracks().forEach(t => t.stop())`) when leaving rooms or unmounting components to avoid background camera usage.

* **Filter System**:
  * Pre-configured CSS & Canvas filters: `Normal`, `Vintage`, `Noir`, `Warm`, `Cool`.
  * Selected filters applied live to both camera previews and correctly drawn during final Canvas image rendering.
  * Optional real-time filter selection synchronization across peers.

* **Synchronized 3-2-1 Photo Capture**:
  * Coordinated server timestamp broadcast when either user clicks **Capture**.
  * Synchronized 3... 2... 1... CAPTURE countdown across both clients.
  * Canvas API composite rendering combining local and remote video frames side-by-side with active filters.
  * Photobooth flash animation effect on snapshot completion.

* **Photobooth Strip Download**:
  * Dual-photo / multi-photo strip rendering with custom branding footer.
  * Automated download with custom filename format: `syncbooth-ROOMCODE-YYYY-MM-DD.png`.

---

## 📐 Architecture & Data Flow

### Full-Stack Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                       React Frontend                        │
│                   (Vite / HTML5 / CSS3)                     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
       HTTP / REST API                  Socket.IO Signaling
   (Auth & Room Endpoints)             (WebRTC & Sync Events)
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Node.js / Express Server                 │
│               (JWT Auth, Room Manager, Socket.IO)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                          Mongoose ORM
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       MongoDB Database                      │
│                    (User & Room Schemas)                    │
└─────────────────────────────────────────────────────────────┘
```

### Real-Time Signaling & WebRTC P2P Flow
```
  User A (Browser 1)           Node.js / Socket.IO           User B (Browser 2)
          │                            │                             │
          ├────────── join-room ──────►│                             │
          │                            │◄────────── join-room ───────┤
          │                            │                             │
          │◄──────── peer-joined ──────┤                             │
          │                            ├────────── room-ready ──────►│
          │                            │                             │
          ├─────────── offer ─────────►│                             │
          │                            ├──────────── offer ─────────►│
          │                            │◄────────── answer ──────────┤
          │◄────────── answer ─────────┤                             │
          │                            │                             │
          ├─────── ice-candidate ─────►│                             │
          │                            ├─────── ice-candidate ──────►│
          │                            │                             │
          │====================== WebRTC P2P =======================│
          │                   MediaStream (Video)                    │
          │==========================================================│
```

---

## 🔒 Security & Password Hashing

* **Password Protection**: Passwords are never stored in plain text. `bcryptjs` is used to hash passwords with salt rounds prior to saving to MongoDB.
* **Database Isolation**: The `passwordHash` field is stripped by model helper methods (`toSafeObject()`) before sending any user object to the client.
* **Token Protection**: JWTs are stored in HTTP-only cookies with `SameSite=lax` configuration to protect against XSS and CSRF token theft.

---

## 🛠️ Environment Variables

Create `.env` files based on the included `.env.example` templates:

### Root / Server `.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/syncbooth
JWT_SECRET=your_jwt_secret_key_change_in_production
CLIENT_URL=http://localhost:5173
```

### Client `.env` (`client/.env`)
```env
VITE_SERVER_URL=http://localhost:5000
```

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js**: v18+ or v20+ installed
* **MongoDB**: Running on `localhost:27017` (or remote MongoDB connection string)

### Installation & Execution

1. **Install Dependencies for Server & Client**:
   ```bash
   npm run install:all
   ```
   *(Or individually: `cd server && npm install` and `cd client && npm install`)*

2. **Start MongoDB**:
   ```bash
   mongod --dbpath /path/to/data/db
   ```

3. **Start Server (Port 5000)**:
   ```bash
   npm run server
   ```

4. **Start Client (Port 5173)**:
   ```bash
   npm run client
   ```

5. **Run Server Unit & Integration Tests**:
   ```bash
   npm test
   ```

6. **Build Client Production Package**:
   ```bash
   npm run build
   ```

---

## 🧪 Testing with Two Sessions / Devices

To verify full end-to-end real-time video streaming, synchronized countdowns, and combined canvas photo capture:

1. Open Browser Window 1 (e.g. Chrome):
   * Navigate to `http://localhost:5173`.
   * Click **Create Account** and register `User A` (`usera@example.com`).
   * Click **Create Booth** to receive a room code (e.g., `A7K92P`).
   * Copy the shareable room link (`http://localhost:5173/room/A7K92P`).

2. Open Browser Window 2 (e.g. Chrome Incognito or Firefox):
   * Navigate to the copied shareable room link (`http://localhost:5173/room/A7K92P`).
   * Click **Create Account** or **Login** as `User B` (`userb@example.com`).
   * Upon login, you will automatically join room `A7K92P`.

3. **Verify**:
   * User A sees User B's live video stream.
   * User B sees User A's live video stream.
   * Either user selects a filter (e.g. Vintage or Noir).
   * Either user clicks **CAPTURE**.
   * Both screens display **3... 2... 1... CAPTURE** simultaneously.
   * Both clients render the combined canvas photo strip containing both video frames.
   * Click **Download Photobooth Strip** to save `syncbooth-A7K92P-YYYY-MM-DD.png`.

---

## 📝 Known Limitations

* **TURN Server Configuration**: The application is configured with public Google STUN servers (`stun:stun.l.google.com:19302`). In strict corporate networks or double-NAT environments, WebRTC P2P connections may require a TURN server (e.g. Coturn).
* **HTTPS Requirement for MediaDevices**: Modern browsers restrict camera access (`getUserMedia`) to `localhost` or secure HTTPS origins.
* **Socket.IO In-Memory Scaling**: In a multi-server production deployment, Socket.IO adapter with Redis Pub/Sub would be required to coordinate signaling across multiple Node.js instances.
