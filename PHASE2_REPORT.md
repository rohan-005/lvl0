# 🚀 `lvl_0` Phase 2 Migration — Final Project & Architecture Report

---

## 📋 Executive Summary

The **`lvl_0`** project has been successfully migrated from a single monolithic backend into a **decoupled, microservices-based architecture** managed by an **API Gateway**, adhering strictly to incremental development, staged testing, and git workflow guidelines.

The frontend application no longer communicates directly with backend services or exposes individual internal ports to the browser. Instead, all HTTP REST API calls, static file requests, and Socket.IO WebSocket upgrades are routed exclusively through the **API Gateway** running on port `4000`.

---

## 🏛️ System Architecture

### Before vs. After

```text
BEFORE (Monolith):
Frontend (5173) ───► Backend Monolith (5000) [Auth, News, Games, Chat, Email, Sockets]

AFTER (API Gateway / Microservice Architecture):
Frontend (5173)
    │
    ▼ (Only VITE_API_GATEWAY_URL=http://localhost:4000 exposed to browser)
API Gateway (4000)
    ├──► User Service        (5001) [Auth, Profile, OTP Verification]
    ├──► Email Service       (5002) [Transactional Email Delivery]
    ├──► News/Game Service   (5003) [Gaming News Feed & RAWG Database]
    └──► Chat Room Service   (5004) [Chatrooms, DMs, Uploads & Socket.IO]
```

---

## 📁 Repository Structure

```text
lvl_0/
├── frontend/                     # React + Vite UI Application (Port 5173)
│   ├── src/
│   │   ├── config/apiConfig.js   # Centralized API Gateway configuration
│   │   ├── utils/axiosConfig.js  # Interceptor attaching JWT tokens to Gateway requests
│   │   ├── context/SocketContext.jsx # Socket.IO client pointing to Gateway
│   │   └── ...
├── gateway/                      # API Gateway Proxy (Port 4000)
│   ├── src/
│   │   ├── index.js              # Express Gateway entry point (CORS, Rate Limit, WS upgrade)
│   │   └── proxy.js              # http-proxy-middleware routing rules
│   ├── test-gateway.js           # Gateway integration test suite
│   └── package.json
├── services/                     # Independent Microservices
│   ├── user-service/             # Port 5001 — User Authentication & Profile
│   ├── email-service/            # Port 5002 — Email Delivery
│   ├── news-game-service/        # Port 5003 — News Feed & RAWG API Client
│   └── chat-room-service/        # Port 5004 — Real-time Chat & Socket.IO
├── shared/                       # Shared modules & utilities
├── .gitignore
├── PHASE2_REPORT.md
└── README.md
```

---

## 🛠️ Microservice Specifications

| Service | Port | Primary Responsibilities | Main Endpoints |
|---|---|---|---|
| **API Gateway** | `4000` | Central proxy, CORS, Rate limiting, WS upgrade | `/health`, `/api/*`, `/uploads/*`, `/socket.io/*` |
| **User Service** | `5001` | Auth, Register, Login, Profile, Password Reset, JWT | `/api/auth/*`, `/api/otp/*`, `/health` |
| **Email Service** | `5002` | Transactional & OTP Email delivery | `/api/email/send-otp`, `/api/email/send-reset-otp`, `/health` |
| **News & Game Service** | `5003` | Gaming News feed & RAWG game catalog | `/api/news`, `/api/games/*`, `/health` |
| **Chat Room Service** | `5004` | Chatrooms, DMs, attachments, Socket.IO WebSockets | `/api/chat/*`, `/uploads/*`, `/socket.io/*`, `/health` |

---

## 🔀 API Gateway Routing Table

The gateway uses `http-proxy-middleware` with `pathFilter` matching so that full URLs are preserved transparently during forwarding:

| Frontend Request Path | Gateway Action | Internal Target Service |
|---|---|---|
| `POST /api/auth/register` | Forward | `http://localhost:5001/api/auth/register` |
| `POST /api/auth/login` | Forward | `http://localhost:5001/api/auth/login` |
| `GET /api/auth/me` | Forward | `http://localhost:5001/api/auth/me` |
| `POST /api/otp/*` | Forward | `http://localhost:5001/api/otp/*` |
| `POST /api/email/*` | Forward | `http://localhost:5002/api/email/*` |
| `GET /api/news` | Forward | `http://localhost:5003/api/news` |
| `GET /api/games/*` | Forward | `http://localhost:5003/api/games/*` |
| `GET/POST /api/chat/*` | Forward | `http://localhost:5004/api/chat/*` |
| `GET /uploads/*` | Forward | `http://localhost:5004/uploads/*` |
| `GET /socket.io/*` | Proxy (HTTP/WS) | `http://localhost:5004/socket.io/*` |

---

## 🎨 Global UI Redesign & Aesthetics

The application user interface was overhauled to enforce a warm, modern light theme:

- **Color Palette**:
  - **White**: `#FFFFFF`
  - **Cream / Off-white**: `#FDFBF7`
  - **Beige Containers**: `#F5EFEB`
  - **Primary Brown**: `#4A2E2B`
  - **Accent Red**: `#C82333`
  - **Dark Brown Text**: `#2B1704`
- **Borders**: Sharp `2px solid #2B1704` across cards, inputs, modals, and buttons.
- **Notifications**: Replaced browser `alert()` popups with `react-hot-toast` configured in warm cream and sharp dark brown borders.

---

## 🧪 Verification & Test Suite Summary

All integration test suites were executed and verified against active microservices:

| Test Suite | Location | Total Tests | Status |
|---|---|---|---|
| **API Gateway Proxy** | [`gateway/test-gateway.js`](file:///home/frosthowl/work/lvl0/lvl0/gateway/test-gateway.js) | 10 / 10 | **PASSED** ✅ |
| **User Service** | [`services/user-service/test-user-service.js`](file:///home/frosthowl/work/lvl0/lvl0/services/user-service/test-user-service.js) | 7 / 7 | **PASSED** ✅ |
| **Email Service** | [`services/email-service/test-email-service.js`](file:///home/frosthowl/work/lvl0/lvl0/services/email-service/test-email-service.js) | 3 / 3 | **PASSED** ✅ |
| **News & Game Service** | [`services/news-game-service/test-news-game-service.js`](file:///home/frosthowl/work/lvl0/lvl0/services/news-game-service/test-news-game-service.js) | 3 / 3 | **PASSED** ✅ |
| **Chat Room Service** | [`services/chat-room-service/test-chat-service.js`](file:///home/frosthowl/work/lvl0/lvl0/services/chat-room-service/test-chat-service.js) | 5 / 5 | **PASSED** ✅ |
| **Frontend Production Build** | `cd frontend && npm run build` | 2829 modules | **COMPILED CLEANLY** ✅ |

---

## 📜 Git Commit History (Incremental Stages)

```text
892091c phase -2 : complete microservice refactoring and cleanup
9626c4c phase -2 : extract email service
fff42fd phase -2 : extract chat room service
efaac30 phase -2 : extract news and game service
07add1a phase -2 : extract user service
25ba829 phase -2 : establish api gateway proxy
283d48b phase -2 : redesign global light theme
8f4ba10 phase -2 : centralize environment configuration
9883def phase -2 : establish migration baseline
```

---

## 🚀 How to Run the Application Stack

### 1. Prerequisites
Start local MongoDB and Redis daemons:
```bash
mongod --fork --logpath ./data/mongod.log --dbpath ./data/db --port 27017
redis-server --daemonize yes
```

### 2. Start Microservices
```bash
# 1. API Gateway
cd gateway && npm start &

# 2. User Service
cd services/user-service && npm start &

# 3. Email Service
cd services/email-service && npm start &

# 4. News & Game Service
cd services/news-game-service && npm start &

# 5. Chat Room Service
cd services/chat-room-service && npm start &
```

### 3. Start Frontend Development Server
```bash
cd frontend && npm run dev
```

---

> Phase 2 migration is complete, verified, and committed.
