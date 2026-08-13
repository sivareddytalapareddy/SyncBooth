# SyncBooth — Technical Interview Guide & Architecture Notes

This document provides a comprehensive summary of the **SyncBooth** project for technical interviews, architectural discussions, and system design reviews.

---

## ⏱️ 30-Second Explanation

> "SyncBooth is a full-stack, real-time collaborative photo booth application built with React, Node.js, Express, MongoDB, Socket.IO, and WebRTC. It enables two remote users to register, log in, create a private booth with a shareable URL, and stream peer-to-peer live camera feeds. Users can apply retro photo filters, initiate a server-synchronized 3-2-1 countdown, composite both video feeds side-by-side on an HTML5 canvas, and download a custom photo strip."

---

## ⏱️ 2-Minute Explanation (Architecture & System Design)

> "Architecturally, SyncBooth follows a decoupled client-server model:
>
> 1. **Authentication & Session**: The backend is an Express REST API connected to MongoDB via Mongoose. Users register with hashed passwords using `bcrypt` (work factor 10). Session state is managed via JWT tokens stored in HTTP-only cookies and Bearer headers.
>
> 2. **Room Management**: When an authenticated user creates a booth, the backend generates a unique 6-character room code (e.g. `A7K92P`) and persists a `Room` document with a strict 2-user capacity limit.
>
> 3. **Signaling & WebRTC**: Once both users join the room, Socket.IO handles room membership and WebRTC signaling. The clients create an `RTCPeerConnection` configured with Google STUN servers. They exchange SDP offers, answers, and ICE candidates through the Socket.IO signaling channel to establish a direct, unthrottled peer-to-peer video connection.
>
> 4. **Synchronized Photo Capture**: When either user clicks 'Capture', the client emits a `start-countdown` event to Socket.IO. The server broadcasts a synchronized start timestamp to both clients, triggering a simultaneous 3-2-1 countdown overlay.
>
> 5. **Canvas Rendering & Download**: At zero, both clients capture their current local video frame and remote peer video frame, render them side-by-side on an HTML5 canvas context with active CSS/Canvas filters, append branding footers, and trigger an instant client-side download formatted as `syncbooth-ROOMCODE-YYYY-MM-DD.png`."

---

## 🔑 Authentication & Security Deep-Dive

* **Password Security**: Passwords are never stored in plain text. They are hashed asynchronously using `bcryptjs` with salt rounds set to `10`.
* **Database Isolation**: The `User` model defines a `toSafeObject()` method that strips `passwordHash` prior to sending any payload to the frontend.
* **Token Protection**: JWTs are signed with a server secret (`JWT_SECRET`) and sent to the browser inside an `HttpOnly`, `SameSite=lax` cookie, preventing client-side JavaScript from accessing raw tokens (XSS protection).
* **Middleware Authorization**: The `requireAuth` Express middleware extracts the token from cookies or the `Authorization: Bearer` header, verifies the signature, and populates `req.user` from MongoDB before passing control to route handlers.

---

## 🗄️ Database Schema & Room Rules

* **User Model**:
  * `_id`: ObjectId
  * `username`: String (required, trimmed)
  * `email`: String (required, unique index, lowercase)
  * `passwordHash`: String (required)
  * `createdAt`, `updatedAt`: Timestamps
* **Room Model**:
  * `_id`: ObjectId
  * `roomCode`: String (6-character alphanumeric, unique index)
  * `hostUserId`: Ref to `User`
  * `participantUserId`: Ref to `User` (default: null)
  * `status`: Enum (`WAITING`, `ACTIVE`, `CAPTURING`, `COMPLETED`, `CLOSED`)
* **Capacity Enforcement**: The backend enforces a hard limit of **2 participants** per room code. If a third user attempts to join, the API rejects the request with HTTP 409 Conflict ("Room is full"). Host departure immediately transitions the room to `CLOSED`.

---

## 🌐 WebRTC Peer-to-Peer Pipeline

1. **Initialization**: Client calls `navigator.mediaDevices.getUserMedia({ video: true, audio: false })` to acquire local video stream tracks.
2. **Offer Creation**: When a peer joins, the room host creates an `RTCPeerConnection` with STUN configuration (`stun:stun.l.google.com:19302`), attaches local video tracks, calls `createOffer()`, sets `setLocalDescription()`, and emits `offer` over Socket.IO.
3. **Answer Creation**: The joining peer receives the offer, sets `setRemoteDescription()`, calls `createAnswer()`, sets `setLocalDescription()`, and emits `answer` back over Socket.IO.
4. **ICE Candidate Exchange**: As local candidates are discovered by the browser's WebRTC engine (`pc.onicecandidate`), candidates are forwarded via socket events and added on the receiving peer with `pc.addIceCandidate()`. If candidates arrive before `setRemoteDescription`, they are buffered in a queue and flushed immediately after remote description confirmation.
5. **MediaStream Attachment**: Upon receiving the remote track (`pc.ontrack`), the remote `MediaStream` is assigned to `<video autoPlay playsInline ref={remoteVideoRef} />`.

---

## ⚡ Socket.IO Event Map

| Event Name | Direction | Description |
|---|---|---|
| `join-room` | Client $\rightarrow$ Server | Participant joins room by code |
| `room-joined` | Server $\rightarrow$ Client | Confirmation payload containing room state |
| `peer-joined` | Server $\rightarrow$ Peer | Notifies existing member that partner joined |
| `room-ready` | Server $\rightarrow$ Both | Emitted when 2 participants are connected (`ACTIVE`) |
| `offer` | Client $\leftrightarrow$ Client | WebRTC SDP offer payload |
| `answer` | Client $\leftrightarrow$ Client | WebRTC SDP answer payload |
| `ice-candidate` | Client $\leftrightarrow$ Client | WebRTC ICE candidate payload |
| `start-countdown` | Client $\rightarrow$ Server | Initiates synchronized photo capture |
| `countdown-started` | Server $\rightarrow$ Both | Coordinated timestamp to start 3-2-1 timer |
| `select-filter` | Client $\rightarrow$ Server | Broadcasts active filter selection |
| `peer-left` | Server $\rightarrow$ Client | Notifies partner of participant disconnection |

---

## 🛠️ Key JavaScript & Web Browser Concepts Used

* **Canvas API 2D Context**: Dual video frame drawing (`ctx.drawImage()`), horizontal mirroring (`ctx.translate()`, `ctx.scale(-1, 1)`), context filter styling (`ctx.filter = 'sepia(0.8)'`), and PNG data export (`canvas.toDataURL()`).
* **MediaDevices API**: Asynchronous `getUserMedia()` promise handling, hardware permission error catching (`NotAllowedError`, `NotFoundError`, `NotReadableError`), and track management.
* **React Hooks**: `useCallback` for memoized stream cleanup and capture functions, `useRef` for persistent DOM elements and candidate buffering queues, and `useEffect` for socket listener lifecycle binding.
* **Cookie & Header Credentials**: `fetch` options with `credentials: 'include'` for cross-origin cookie authentication.

---

## 💡 Real Challenges Encountered & Technical Solutions

1. **ICE Candidate Race Condition**:
   * *Problem*: In fast networks, ICE candidates were received before `pc.setRemoteDescription()` completed, causing DOMException candidate rejection errors.
   * *Solution*: Implemented a pending candidates queue (`pendingCandidatesRef`). ICE candidates received before remote description setup are pushed into the queue and flushed immediately after `setRemoteDescription()` resolves.

2. **Dual Stream Mirroring on Canvas**:
   * *Problem*: User cameras need horizontal mirroring for natural selfie preview, but simple canvas rendering inverted the partner feed incorrectly.
   * *Solution*: Utilized individual canvas transform states (`ctx.save()`, `ctx.translate()`, `ctx.scale(-1, 1)`, `ctx.restore()`) for each video frame rendering block.

3. **CORS Credentials with HTTP-Only Cookies**:
   * *Problem*: Browsers block cookie transmission on cross-origin `fetch` requests when `CORS` origin is set to wildcard `*`.
   * *Solution*: Configured Express `cors` middleware with explicit origin whitelist (`http://localhost:5173`) and `credentials: true`.

---

## ❓ 15 Likely Technical Interview Questions & Answers

#### 1. Why use WebRTC for video streams instead of streaming canvas frames via Socket.IO?
> Socket.IO uses WebSocket/TCP which guarantees ordered packet delivery, causing latency spikes and high server CPU utilization under continuous video data streams. WebSockets are designed for lightweight messages. WebRTC uses UDP-based media transport (SRTP/RTP) optimized for real-time video with minimal latency.

#### 2. Why store `passwordHash` instead of plaintext passwords?
> Storing plaintext passwords exposes user credentials if the database is compromised. Using `bcrypt` with salt rounds ensures passwords are cryptographically hashed and computationally expensive to brute-force or reverse lookup.

#### 3. How do you enforce the maximum 2-user capacity per room?
> Capacity is checked both at the REST API layer and inside the Socket.IO `join-room` handler in `RoomManager`. If `room.participants.length >= 2`, any subsequent join attempt throws a `ROOM_FULL` error and rejects the connection.

#### 4. What is the role of STUN servers in WebRTC?
> STUN (Session Traversal Utilities for NAT) servers allow browser clients to discover their public IP address and port mapping when operating behind NAT routers, enabling peer-to-peer connectivity across different networks.

#### 5. When would a TURN server be required?
> A TURN (Traversal Using Relays around NAT) server is required when both peers are behind restrictive symmetric NATs or corporate firewalls that block direct peer-to-peer UDP connections. The TURN server relays encrypted media traffic between the peers.

#### 6. How is the 3-2-1 photo countdown synchronized between two users?
> When a user clicks Capture, a `start-countdown` event is sent to the Node.js server. The server calculates a coordinated target timestamp and emits `countdown-started` to both clients simultaneously, ensuring countdown overlays step in sync.

#### 7. How are filters applied to the final saved image?
> The selected filter CSS string (e.g. `sepia(0.8) contrast(1.2)`) is assigned to `ctx.filter` on the 2D canvas context prior to executing `ctx.drawImage()`, baking the visual filter directly into the exported image pixels.

#### 8. What happens when the host user leaves the room?
> When the room host disconnects or leaves, `roomManager.leaveRoom()` marks the room status as `CLOSED`, notifies the remaining partner via `peer-left`, and deletes the room from memory and MongoDB.

#### 9. Why use HTTP-Only cookies for JWT storage?
> HTTP-Only cookies cannot be read or accessed by client-side JavaScript scripts (`document.cookie`), effectively neutralizing XSS (Cross-Site Scripting) attacks from stealing session tokens.

#### 10. How do you prevent camera devices from staying active in the background when navigating away?
> In `useCamera`, track teardown logic iterates over `stream.getTracks()` and invokes `track.stop()` on both component unmounting and room departure callbacks.

#### 11. How does the application handle a direct shareable URL like `/room/A7K92P`?
> On load, `App.jsx` parses the path or query parameters. If an unauthenticated user opens the link, the room code is stored as `pendingRoomCode` while prompting login. After authentication, the app automatically executes `joinRoom(pendingRoomCode)` and transitions to the shared booth view.

#### 12. What is the purpose of `res.cookie('token', ..., { sameSite: 'lax' })`?
> `SameSite=lax` ensures cookies are sent during top-level navigation while mitigating Cross-Site Request Forgery (CSRF) attacks by restricting automatic cookie attachment on cross-site sub-requests.

#### 13. How are non-adjacent canvas composite drawings isolated?
> By calling `ctx.save()` before applying canvas transformations (such as `translate` or `scale`) and calling `ctx.restore()` immediately after drawing each video frame.

#### 14. What is the database index strategy used in SyncBooth?
> Unique indexes are created on `User.email` and `Room.roomCode` to guarantee fast $O(1)$ lookups and prevent duplicate record creation at the MongoDB index layer.

#### 15. How would you scale Socket.IO across multiple server instances in production?
> By attaching `@socket.io/redis-adapter` connected to a Redis instance. This allows Socket.IO events and room broadcasts to pub/sub seamlessly across multiple Node.js process clusters or Kubernetes pods.
