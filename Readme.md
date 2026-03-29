# lvl_0

A full-stack gaming hub and developer platform built using the MERN stack, featuring real-time chat, game discovery, news aggregation, and community-driven interactions.

Live Demo: https://lvl-0.vercel.app/

---

## Overview

lvl_0 is a modern gaming platform designed to bring together gamers, communities, and developers through structured content and real-time interaction.

The platform integrates WebSockets with a scalable backend architecture to support dynamic features such as chat systems, game data integration, and user authentication.

---

## Features

### Game System

* Browse and explore games
* Detailed game information
* Integration with RAWG API

### Real-Time Chat System

* Community-based chat rooms
* Live messaging using Socket.IO
* Message interactions (upvote, downvote, reactions)
* Typing indicators
* Message timestamps
* Moderation features (mute, delete, pin)

### News System

* Gaming news feed
* Categorized and dynamic content

### Authentication System

* JWT-based authentication
* User registration and login
* OTP-based password reset
* Secure token management

### User System

* User profiles
* Avatar support
* Role-based access control

---

## Tech Stack

### Frontend

* React.js (Vite)
* Tailwind CSS and custom CSS
* Axios
* Socket.IO Client

### Backend

* Node.js
* Express.js
* Socket.IO
* JWT Authentication

### Database

* MongoDB (Mongoose)

### External APIs

* RAWG Game API

---

## Architecture

```
Frontend (React)
      ↓
REST APIs + WebSockets
      ↓
Backend (Node + Express)
      ↓
MongoDB Database
```

---

## Folder Structure

```
lvl0/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── service/
│   ├── socket/
│   ├── utils/
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── context/
    │   ├── ui_components/
    │   └── utils/
    └── vite.config.js
```

---

## Key Modules

### Backend

* Authentication system using JWT and OTP
* Real-time chat system using Socket.IO
* Game APIs integrated with RAWG
* News APIs
* Email service for OTP handling

### Frontend

* Context API for authentication and sockets
* Modular UI component architecture
* Real-time chat interface
* Game and news pages

---

## API Endpoints

### Authentication

* POST /api/auth/register
* POST /api/auth/login
* POST /api/auth/logout

### Games

* GET /api/games

### Chat

* GET /api/chat
* WebSocket-based communication

### News

* GET /api/news

### OTP

* POST /api/otp/forgot-password

---

## Socket Events

* user:join
* message:send
* message:receive
* user:leave

---

## Installation and Setup

### Clone the Repository

```bash
git clone https://github.com/rohan-005/lvl_0.git
cd lvl0
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file in the backend directory:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
RAWG_API_KEY=your_rawg_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
CLIENT_URL=https://lvl-0.vercel.app
```

---

## Future Enhancements

* AI-based recommendation system
* Integration with in-house Unity games
* Advanced analytics dashboard
* Achievement system
* Multiplayer support

---

## Why This Project Matters

* Demonstrates full-stack development with MERN
* Combines REST APIs with real-time communication
* Built with scalable and modular architecture
* Suitable for production-level deployment and portfolio use

---

## Contributing

1. Fork the repository
2. Create a new branch
3. Commit changes
4. Submit a pull request

---

## Author

Rohan 
Full Stack Developer and Game Developer
