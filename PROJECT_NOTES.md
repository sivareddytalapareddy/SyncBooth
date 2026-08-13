# SyncBooth — Project & Technical Interview Guide

> This document contains technical deep-dives, architectural explanations, core concept breakdowns, and likely interview questions for defending SyncBooth in full-stack JavaScript software engineering interviews.

---

## 1. 30-Second Pitch (Elevator Pitch)

"SyncBooth is a real-time collaborative web photobooth that allows two users anywhere in the world to connect their cameras, see each other live, apply synchronized filters, and take photos together on a single photobooth strip. Built with React, Node.js, Express, Socket.IO, and WebRTC, it establishes direct peer-to-peer video streams with low latency while using WebSockets for signaling and synchronized frame captures."

---

## 2. 2-Minute Architecture Explanation

"SyncBooth follows a decoupled client-server architecture:

1. **Frontend Layer**: Built using React and Vite. It uses custom React hooks (`useCamera`, `useWebRTC`, `useRoom`) to isolate side-effects like browser media streams, WebRTC connection lifecycles, and Socket.IO event listeners.
2. **Backend REST API**: Node.js and Express manage room creation, validation, and health checks with proper HTTP status codes.
3. **Signaling Server**: Socket.IO handles real-time signaling. When a user creates a room, a unique 6-character room code is generated in server memory. When a second peer joins, Socket.IO acts as an intermediary to exchange WebRTC session descriptions (SDP offers and answers) and ICE candidates.
4. **Peer-to-Peer WebRTC Channel**: Once signaling completes, the browsers establish a direct `RTCPeerConnection` using Google STUN servers. Media streams flow directly browser-to-browser without passing video through our server.
5. **Canvas Composition Engine**: When either participant triggers the camera, a synchronized WebSocket event initiates a 3-2-1 countdown on both screens. Upon capture, HTML5 Canvas composites local and remote video streams into a high-resolution, filter-processed photobooth strip for instant download."

---

## 3. Why WebRTC? (WebRTC vs Backend Video Relay)

### The Problem with Server Video Relaying
Sending camera frames to a backend server (e.g. via WebSocket base64 chunks or HTTP POST) and broadcasting them to the partner incurs:
- **Massive Server Bandwidth & Cost**: 2 camera streams at 720p 30fps require ~3-5 Mbps per user session. 1,000 active rooms would consume 3-5 Gbps bandwidth.
- **High Latency**: Server encoding and forwarding delays cause video lag (300ms - 1000ms).
- **High CPU Overhead**: Video transposing on Node.js blocks the event loop.

### Why WebRTC was Chosen
- **Ultra-Low Latency (<100ms)**: Direct peer-to-peer UDP transport using SRTP (Secure Real-time Transport Protocol).
- **Zero Video Infrastructure Cost**: The Node.js server only exchanges tiny JSON signaling payloads (~KB). Video data never touches the server.
- **Privacy & Security**: End-to-end encryption built directly into browser WebRTC implementations.

---

## 4. Why Socket.IO for Signaling?

WebRTC cannot discover peers on its own. It requires a signaling mechanism to exchange connection metadata before P2P streaming begins. 

Socket.IO was chosen because:
- **Bi-directional Full-Duplex Communication**: Low-overhead WebSocket messaging perfect for rapid SDP & ICE candidate exchanges.
- **Built-in Room Management**: `socket.join(roomId)` allows scoping events cleanly to specific 2-person booth channels.
- **Automatic Reconnection & Fallbacks**: Handles network drops and HTTP long-polling fallbacks automatically.

---

## 5. WebRTC Handshake Lifecycle Breakdown

```
[ Peer A (Host) ]                  [ Signaling Server ]                  [ Peer B (Joiner) ]
        |                                   |                                     |
        | ----- 1. join-room(A7K92P) ------>|                                     |
        |                                   |<----- 2. join-room(A7K92P) ---------|
        |<---- 3. peer-joined(Peer B) ------|                                     |
        |                                   |                                     |
        | 4. createOffer()                  |                                     |
        | 5. setLocalDescription(offer)     |                                     |
        | ----- 6. offer (SDP) ------------>|                                     |
        |                                   |---- 7. offer (SDP) ---------------->|
        |                                   |                                     | 8. setRemoteDescription(offer)
        |                                   |                                     | 9. createAnswer()
        |                                   |                                     | 10. setLocalDescription(answer)
        |                                   |<--- 11. answer (SDP) ---------------|
        |<---- 12. answer (SDP) ------------|                                     |
        |                                   |                                     |
        | 13. setRemoteDescription(answer)  |                                     |
        |                                   |                                     |
        | <=== 14. ICE Candidates Exchange (via Signaling) =====================> |
        |                                   |                                     |
        | ================== 15. DIRECT P2P MEDIA STREAM ESTABLISHED ============ |
```

---

## 6. JavaScript Fundamental Concepts Used

1. **Promises & Async/Await**: Used for `navigator.mediaDevices.getUserMedia()`, WebRTC `createOffer()`, `createAnswer()`, and REST `fetch` API calls.
2. **Event Loop & Asynchronous I/O**: Non-blocking Node.js server handling concurrent HTTP REST requests and Socket.IO events.
3. **HTML5 Canvas 2D API**: Context manipulation (`drawImage`, `translate`, `scale`, `filter`, `fillText`, `toDataURL`) for mirroring video and composite strip rendering.
4. **Browser Media API**: `MediaStream` and `MediaStreamTrack` lifecycle management (`getTracks()`, `track.stop()`).
5. **Closures & Scope**: Encapsulated state within custom hooks and Express middleware.
6. **ES6+ Modules & Destructuring**: Clean modular imports/exports across frontend and backend.

---

## 7. React Core Concepts Used

1. **Custom Hooks**:
   - `useCamera`: Encapsulates stream acquisition and track cleanup.
   - `useWebRTC`: Manages `RTCPeerConnection` instance and ICE negotiation.
   - `useRoom`: Manages Socket.IO room join/leave and state transitions.
2. **`useRef` Hook**: Preserves mutable references without triggering re-renders (e.g. `<video>` DOM elements, `RTCPeerConnection` instance, active `MediaStream`).
3. **`useEffect` Cleanup Functions**: Guaranteed teardown of camera tracks, socket listeners, timers, and WebRTC peer connections on component unmount.
4. **State Encapsulation**: Component-driven UI states (`WAITING`, `CONNECTED`, `CAPTURING`).

---

## 8. Backend Core Concepts Used

1. **RESTful API Design**: Structured endpoints (`POST /api/rooms`, `GET /api/rooms/:roomId`, `DELETE /api/rooms/:roomId`, `GET /api/health`) with explicit HTTP status codes (`201`, `200`, `400`, `404`, `409`, `500`).
2. **In-Memory State Management**: `RoomManager` class maintaining active rooms in a JS `Map` with validation and capacity checks.
3. **Express Middleware**: CORS cross-origin configuration and JSON body parsing.
4. **Socket.IO Channels**: Scoped messaging (`io.to(roomId).emit(...)` vs `socket.to(roomId).emit(...)`).

---

## 9. Real Technical Challenges & Solutions

### Challenge 1: Video Canvas Mirroring Offset
- **Problem**: Self-view video elements are CSS-mirrored (`transform: scaleX(-1)`), but drawing directly to Canvas without transformation resulted in un-mirrored, inverted photos.
- **Solution**: Implemented Canvas context translation prior to drawing: `ctx.translate(vW, 0); ctx.scale(-1, 1); ctx.drawImage(video, 0, 0);`.

### Challenge 2: Synchronized Frame Capture
- **Problem**: Local timers on separate devices desynchronized capture triggers due to system clock drift.
- **Solution**: Used Socket.IO server broadcast (`start-countdown`) to send a unified timestamp signal, ensuring both clients enter the 3-2-1 countdown simultaneously.

### Challenge 3: Stream Track Leaks on Unmount
- **Problem**: Leaving the photobooth page left webcam activity lights active on laptops.
- **Solution**: Added explicit cleanup logic in `useCamera` returning `() => stream.getTracks().forEach(track => track.stop())`.

---

## 10. 10 Likely Interview Questions & Answers

### Q1: What is the role of STUN and TURN servers in WebRTC?
**Answer**: STUN (Session Traversal Utilities for NAT) allows a browser behind a NAT router to discover its public IP and port so peers can connect. If NAT or firewall rules are too restrictive (e.g., Symmetric NAT), STUN fails, and TURN (Traversal Using Relays around NAT) acts as a fallback relay server to pass media traffic between peers.

### Q2: Why did you use `useRef` instead of `useState` for the WebRTC `RTCPeerConnection`?
**Answer**: `useState` triggers component re-renders every time state changes. `RTCPeerConnection` is a complex object with background event handlers (`ontrack`, `onicecandidate`). Storing it in `useRef` preserves the exact instance across renders without forcing unnecessary DOM updates.

### Q3: How do you handle room capacity limits in Node.js?
**Answer**: In `RoomManager.js`, when `joinRoom(roomId, socketId)` is called, we check `room.participants.length >= 2`. If full, we throw a custom error with code `ROOM_FULL`, returning an HTTP 409 status on REST or a `room-error` socket event to prevent the third socket from joining.

### Q4: Why stop video tracks explicitly when leaving a component?
**Answer**: Merely setting `video.srcObject = null` or unmounting a React component does NOT stop hardware webcam recording. Calling `track.stop()` releases the operating system hardware resource and turns off the camera indicator light.

### Q5: How does Canvas composite two separate video streams into one image?
**Answer**: We create an offscreen Canvas element whose width equals the combined width of both video streams (`vW * 2`). We apply selected CSS filters to `ctx.filter`, use `ctx.drawImage()` to draw the local video on the left half and the remote video on the right half, draw a vertical divider line, and export a single JPEG blob via `canvas.toDataURL()`.

### Q6: What happens if a participant unexpectedly disconnects?
**Answer**: The Socket.IO server detects the socket `disconnect` event, looks up active rooms owned by that socket via `roomManager.handleDisconnect(socketId)`, removes the user, updates room status back to `WAITING`, and notifies the remaining peer via a `peer-left` event so their UI immediately reflects partner disconnection.

### Q7: Why use REST API for room creation alongside Socket.IO?
**Answer**: Using REST for room creation (`POST /api/rooms`) allows stateless pre-validation, direct URL share links (`/?room=A7K92P`), and standard HTTP status codes (`201 Created`, `404 Not Found`) before attempting to open a persistent WebSocket connection.

### Q8: How are filters applied during capture?
**Answer**: Filter configurations map CSS filter strings (e.g. `sepia(50%) contrast(1.2)`) to both CSS classes for live video elements and the `ctx.filter` property on 2D Canvas context during capture, ensuring the preview and final output look identical.

### Q9: How do you prevent memory leaks with Socket.IO event listeners in React?
**Answer**: Inside `useEffect`, every `socket.on(event, handler)` has a corresponding `socket.off(event, handler)` in the effect cleanup function to ensure event listeners are destroyed when the component unmounts.

### Q10: How could this architecture scale to hundreds of thousands of users?
**Answer**: Since WebRTC media streaming is peer-to-peer, server bandwidth requirements remain minimal. The Socket.IO signaling layer can be scaled horizontally behind an NGINX load balancer using the Socket.IO Redis Adapter for inter-node communication, and room states can be moved from server memory to Redis.
