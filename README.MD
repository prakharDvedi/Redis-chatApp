# Real-time Chat Application

A robust, full-stack chat application designed for seamless real-time communication. This project demonstrates a production-ready architecture for handling persistent messaging, user authentication, and media sharing.

## Problem Solution

Modern communication requires more than just text. It demands instant delivery, security, and rich media support. This application solves the problem of building a scalable realtime chat interface by decoupling the frontend presentation from reliable backend delivery systems, ensuring users stay connected even in unreliable network conditions.

## Architecture Overview

The application follows a client-server architecture:

- **Frontend (Client):** A React-based Single Page Application (SPA) that manages local state (Zustand) and establishes a persistent WebSocket connection for real-time updates.
- **Backend (Server):** A Node.js and Express Runtime that handles API requests (Auth, Users, Messages) and manages WebSocket events (Socket.IO).
- **Database:** MongoDB serves as the source of truth, storing user profiles and message history.
- **Security Layer:** Arcjet provides rate limiting and security analysis, while JWT ensures stateless authentication.
- **Media Service:** Cloudinary handles image optimization and storage.

## Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Real-time Engine:** Socket.IO
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Security:** Arcjet
- **Services:** Cloudinary (Media), Resend (Email)

### Frontend

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** TailwindCSS + DaisyUI
- **State Management:** Zustand
- **Routing:** React Router
- **HTTP Client:** Axios

## How to Run Locally

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas URI)
- Cloudinary Account
- Resend Account (Optional, for emails)
- Arcjet Key (Optional, for security)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/prakharDvedi/Redis-chatApp.git
    cd ChatApp-1
    ```

2.  **Backend Setup**

    ```bash
    cd backend
    npm install
    cp .env.example .env
    ```

    Update `.env` with your credentials:

    - `MONGO_URI`: Your MongoDB connection string.
    - `JWT_SECRET`: A secure random string.
    - `CLOUDINARY_*`: Your Cloudinary credentials.

3.  **Frontend Setup**

    ```bash
    cd ../frontend
    npm install
    ```

4.  **Start the Application**

    - **Backend:** `npm run dev` (Runs on port 5001 by default)
    - **Frontend:** `npm run dev` (Runs on port 5173)

    Access the app at `http://localhost:5173`.

## Deployment

This project is configured for deployment on **Render** using Blueprint (`render.yaml`).

1.  Push code to the `main` branch.
2.  Connect the repository to Render.
3.  Render will detect `render.yaml` and build both frontend and backend services automatically.
4.  Ensure Environment Variables are set in the Render dashboard.

## Known Limitations

- **Scalability:** Currently runs on a single node. WebSocket state is in-memory; scaling to multiple instances requires a Redis Adapter (Planned Upgrade).
- **Presence:** Online status is tracked in server memory, making it ephemeral on server restarts.
- **Search:** No full-text search capability for message history.
