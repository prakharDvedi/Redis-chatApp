# Real-Time Chat Application

A production-ready chat application demonstrating distributed systems architecture, security best practices, and real-time communication at scale.

## Problem Statement

Modern chat applications require more than basic CRUD operations. They need:

- **Persistent connections** for instant message delivery
- **Distributed state management** across multiple server instances
- **Security measures** to prevent spam and abuse
- **Graceful degradation** when services fail
- **Consistent environments** from development to production

This project solves these challenges using industry-standard tools and patterns.

**Key Design Decisions:**

### 1. Hybrid State Management

- **Redis**: Online users, rate limit counters (ephemeral, fast)
- **MongoDB**: Messages, user profiles, last seen (persistent)
- **In-Memory Map**: Socket ID lookup (connection-specific)

**Why?** Each storage layer optimized for its use case. Redis for speed, MongoDB for persistence, memory for socket routing.

### 2. Containerization with Docker

All services run in isolated containers orchestrated by Docker Compose.

**Benefits:**

- Consistent environments (dev = staging = prod)
- Easy service scaling
- Dependency isolation
- One-command startup

### 3. Rate Limiting via Redis Token Bucket

Messages limited to 10 per minute per user using Redis atomic operations.

**Why Redis?**

- `INCR` is atomic (no race conditions)
- TTL auto-expires counters
- Shared state across multiple backend instances

## Tech Stack

### Backend

- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Real-time:** Socket.IO
- **Databases:** MongoDB (Mongoose), Redis (ioredis)
- **Authentication:** JWT + bcryptjs
- **Security:** Arcjet (SQL injection, bot detection), Redis rate limiting
- **Media:** Cloudinary
- **Email:** Resend

### Frontend

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** TailwindCSS + DaisyUI
- **State:** Zustand
- **HTTP Client:** Axios
- **Routing:** React Router

### Infrastructure

- **Containerization:** Docker + Docker Compose
- **Orchestration:** 3-service architecture (Backend, MongoDB, Redis)

## Features

### Core Functionality

- Real-time messaging with Socket.IO
- User authentication & authorization
- Image sharing via Cloudinary
- Message persistence in MongoDB

### Backend Engineering Highlights

- **Online Presence Tracking**: Redis Sets with automatic expiry
- **Last Seen Timestamps**: Saved to MongoDB on disconnect
- **Rate Limiting**: Token bucket algorithm (10 msg/min)
- **Graceful Degradation**: Chat works even if Redis fails
- **Error Handling**: Try/catch with fallback strategies
- **Structured Logging**: Console logging (ready for Winston upgrade)

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Resend account (optional, for emails)

### Environment Variables

Create `backend/.env`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development

JWT_SECRET=your_secure_random_string

RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=ChatApp

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
```

### Running with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/prakharDvedi/Redis-chatApp.git
cd ChatApp-1

# Start all services
docker compose up --build

# Access the app
# Frontend: http://localhost:5173
# Backend: http://localhost:5001
```

**What This Does:**

1. Builds Node.js backend container
2. Pulls MongoDB 7 and Redis 7-alpine images
3. Creates isolated network for service communication
4. Mounts volumes for data persistence
5. Starts all services with health checks

### Running Locally (Development)

```bash
# Backend
cd backend
npm install
npm run dev  # Port 5001

# Frontend (new terminal)
cd frontend
npm install
npm run dev  # Port 5173
```

**Note:** Local mode requires separate MongoDB and Redis installations.

## Architecture Deep Dive

### Rate Limiting Implementation

**Problem:** Malicious users can spam thousands of messages.

**Solution:** Redis-based token bucket algorithm.

```javascript
// Each user gets 10 tokens per minute
Key: ratelimit:messages:{userId}
Value: Message count (integer)
TTL: 60 seconds

// On each message:
1. INCR counter (atomic)
2. If counter == 1, set EXPIRE 60
3. If counter > 10, reject with HTTP 429
```

**Why This Works:**

- Atomic operations prevent race conditions
- Redis TTL auto-cleans old counters
- Shared across multiple backend instances
- O(1) performance

### Online Presence System

**Problem:** How to track "who's online" across server restarts?

**Solution:** Hybrid Redis + In-Memory approach.

```javascript
// Redis SET (persistent, shared)
SADD online_users {userId}  // When user connects
SREM online_users {userId}  // When user disconnects

// In-Memory Map (fast lookup)
userSocketMap[userId] = socketId  // For sending messages

// MongoDB (historical)
User.lastSeen = new Date()  // When user goes offline
```

**Benefits:**

- Redis: Survives server restarts
- In-Memory: Fast socket ID lookup
- MongoDB: Shows "Last seen X minutes ago"

### Graceful Degradation

**Philosophy:** Services will fail. Plan for it.

**Implementation:**

```javascript
try {
  await redis.sadd("online_users", userId);
} catch (error) {
  console.error("Redis failed:", error.message);
  // Chat continues! Just no persistent presence
}
```

**Result:** If Redis crashes, users can still send messages. Degraded UX > broken app.

## Security Measures

1. **Rate Limiting**: 10 messages/minute per user
2. **JWT Authentication**: Stateless, secure sessions
3. **Arcjet Protection**: SQL injection, bot detection
4. **Input Validation**: Message content sanitization
5. **CORS Configuration**: Restricted origins
6. **Password Hashing**: bcryptjs with salt rounds

## Known Limitations

### Scalability

- **WebSocket state in-memory**: Scaling requires Redis Adapter for Socket.IO
- **Single Redis instance**: Production needs Redis Cluster for HA
- **No horizontal scaling yet**: Load balancer would need session affinity

### Features

- **No message search**: Full-text search requires Elasticsearch/MongoDB Atlas Search
- **No typing indicators**: Planned enhancement using Redis Pub/Sub
- **No read receipts**: Requires additional state tracking
- **No group chats**: Current architecture is 1-on-1 only

### Infrastructure

- **No CI/CD**: Manual deployment process
- **No monitoring**: Needs Prometheus/Grafana for observability
- **Basic logging**: Console logs (should upgrade to Winston/Pino)

## Deployment

Configured for deployment on Render using `render.yaml`:

- Automatic builds on git push
- Environment variable management
- Free tier compatible

For production:

1. Update `MONGO_URI` to production database
2. Set `NODE_ENV=production`
3. Configure Redis persistence (RDB/AOF)
4. Add SSL/TLS certificates
5. Set up monitoring and alerts

## Performance Optimizations

1. **Docker Layer Caching**: `package.json` copied before code
2. **Alpine Images**: 5MB vs 100MB+ base images
3. **Redis for Hot Data**: Sub-millisecond reads
4. **Lazy Loading**: Messages fetched on-demand
5. **Image Optimization**: Cloudinary CDN
