# SyncBooth — Real-Time Collaborative Photo Booth

> A modern, full-stack WebRTC collaborative photobooth application that allows users to create private room sessions, invite partners via shareable links or room codes, stream camera feeds peer-to-peer in real-time, apply 20 live filters, trigger synchronized countdown captures, and generate downloadable photobooth strips.

---

## 📌 Problem Statement

Traditional virtual photobooth applications either operate strictly in isolation (single user) or rely on high-latency server video relaying that consumes immense server bandwidth and degrades stream quality. 

**SyncBooth** solves this by establishing direct, low-latency **WebRTC Peer-to-Peer** video channels between participants while utilizing a lightweight **Node.js + Socket.IO** signaling server for connection negotiation and capture state synchronization.

---

## ✨ Features

- 📹 **Real-Time P2P Video Streaming**: Direct browser-to-browser WebRTC media channels with STUN NAT traversal.
- 🎟️ **Room System**: Generate unique 6-character room codes (`e.g. A7K92P`) or share direct URLs (`/?room=A7K92P`) with a strict 2-participant room capacity limit.
- ⏱️ **Synchronized Countdown**: WebSocket-event-triggered 3-2-1 countdown ensure both participants capture the exact same frame simultaneously.
- 🎨 **20 Curated Image Filters**: Real-time CSS filter previews applied seamlessly to both live video streams and canvas output.
- 📸 **Canvas Photo Composite**: High-resolution 2D Canvas composition algorithm generating custom vertical photobooth strips with white borders and branding.
- 💾 **Instant JPEG Download**: One-click download of session strips with automatic local storage preservation of user preferences.
- 👤 **Solo Booth Mode**: Single-user photobooth mode for quick individual captures.
- 🛡️ **Robust Error Handling**: User-friendly banners for camera permission denials, full rooms, invalid codes, or peer disconnects.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18, Vite |
| **Styling & Theme** | Vanilla CSS3 (Custom Design System, Responsive Glassmorphism) |
| **Real-Time Video** | WebRTC (`RTCPeerConnection`, `getUserMedia`) |
| **Real-Time Signaling** | Socket.IO Client |
| **Canvas API** | HTML5 Canvas 2D Rendering Context |
| **Backend Runtime** | Node.js, Express |
| **Signaling Server** | Socket.IO Server |
| **Testing** | Vitest, Supertest |

---

## 📐 Architecture & WebRTC Signaling Flow

```
+------------------+                    +------------------+
|   Browser A      |                    |    Browser B     |
| (Room Host)      |                    | (Joining Peer)   |
+--------+---------+                    +--------+---------+
         |                                       |
         | 1. POST /api/rooms (Create Room)     |
         |------------------------------------->|
         | 2. Socket: join-room (A7K92P)        |
         |=====================================>|
         |                                       | 3. Socket: join-room (A7K92P)
         |                                       |<=============================
         | 4. Socket: peer-joined                |
         |<======================================|
         |                                       |
         |------------ WebRTC Signaling ------------|
         |                                       |
         | 5. Offer (SDP)                        |
         |======================================>|
         | 6. Answer (SDP)                       |
         |<======================================|
         | 7. ICE Candidates                     |
         |<=====================================>|
         |                                       |
         |========== WebRTC P2P Stream ==========|
         | <===================================> |
         |   (Direct MediaStream Video/Audio)    |
         |                                       |
         | 8. Socket: start-countdown           |
         |======================================>|
         | 9. Canvas Draw & Strip Download       |
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)

### Installation

1. **Clone or Navigate to Project Root**:
   ```bash
   cd "synce booth"
   ```

2. **Install All Dependencies**:
   ```bash
   npm run install:all
   ```

3. **Environment Setup**:
   The default `.env` files are pre-configured:
   - Server (`server/.env`): `PORT=5001`, `CLIENT_URL=http://localhost:5173`
   - Client (`client/.env`): `VITE_SERVER_URL=http://localhost:5001`

---

## 🏃 Running Locally

Run both backend server and frontend client concurrently:

```bash
# Terminal 1: Backend Server (Port 5001)
npm run server

# Terminal 2: Frontend Client (Port 5173)
npm run client
```

Or start server and client individually:

```bash
# Backend Server
cd server && npm run dev

# Frontend Client
cd client && npm run dev
```

---

## 🧪 Testing

### Running Automated Server Tests
```bash
npm test
# OR
cd server && npm test
```

### Manual Testing Protocol (Two Windows / Devices)
1. Open `http://localhost:5173` in **Browser Window A**.
2. Click **Create Shared Booth** to generate a room code (e.g. `A7K92P`).
3. Open a second **Browser Window B** (or Incognito Window).
4. Enter the room code `A7K92P` or visit `http://localhost:5173/?room=A7K92P`.
5. Grant camera permissions on both windows.
6. Verify WebRTC connection connects automatically and both video feeds display side-by-side.
7. Click the **Snap Camera** button in either window: verify both windows trigger the synchronized 3-2-1 countdown simultaneously.
8. Click **Download Photobooth Strip** to save the generated JPEG strip.

---

## ⚠️ Known Limitations

- **TURN Server Requirement**: WebRTC connection establishment uses public Google STUN servers (`stun:stun.l.google.com:19302`). In strict corporate networks or symmetric NAT environments, a TURN server (e.g., Coturn) is required for relay fallback.
- **HTTPS for Local Network Device Testing**: Browsers restrict `navigator.mediaDevices.getUserMedia()` to `localhost` or HTTPS origins. Testing across separate physical devices on local Wi-Fi requires HTTPS or enabling browser flags.

---

## 🔮 Future Roadmap

- 🗄️ **MongoDB Integration**: Persistent room analytics, gallery history, and cloud upload storage.
- ☁️ **AWS S3 / Cloudinary Storage**: Direct cloud sharing links for captured photobooth strips.
- 🔒 **User Authentication**: User profiles, saved favorite filters, and personal photo album galleries.
