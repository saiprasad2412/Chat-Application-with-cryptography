# 💬 Real-Time Chat Application

A full-stack real-time chat application built using the MERN stack. The application supports real-time messaging, image/video sharing, online user status, unread message counts, authentication, and media uploads using ImageKit.

---

## 🚀 Features

### 🔐 Authentication

- User authentication using Clerk
- Protected chat routes
- User profile information
- Online/offline user status

### 💬 Real-Time Messaging

- One-to-one private conversations
- Real-time messages using Socket.IO
- Messages are stored in MongoDB
- Messages are delivered instantly to online users
- Automatic conversation updates
- Unread message count
- Chat history loading

### 📷 Media Sharing

Users can send:

- Images
- Videos

Media is uploaded using ImageKit and the returned URL is stored in MongoDB.

### 👥 Chat Sidebar

- Displays recent conversations
- Displays users
- Search users/conversations
- Shows online status
- Shows unread message count
- Select conversation to open chat

### 🟢 Online Status

Socket.IO is used to track connected users and display their online status.

### 📱 Responsive UI

The application supports:

- Desktop
- Tablet
- Mobile

The chat sidebar automatically adapts to smaller screens.

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- HeroUI
- Lucide React
- Zustand
- Axios
- Socket.IO Client
- Clerk Authentication

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- Multer
- ImageKit

## Deployment

- Render

---

# 📂 Project Structure

```text
chat-application/
│
├── backend/
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── message.controller.js
│   │   │   └── user.controller.js
│   │   │
│   │   ├── middleware/
│   │   │   └── upload.middleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── message.model.js
│   │   │   └── user.model.js
│   │   │
│   │   ├── routes/
│   │   │   ├── message.route.js
│   │   │   └── user.route.js
│   │   │
│   │   ├── lib/
│   │   │   ├── db.js
│   │   │   ├── imagekit.js
│   │   │   └── socket.js
│   │   │
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env
│
├── frontend/
│   │
│   ├── src/
│   │   │
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   └── AppLogo.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useSelectedConversation.js
│   │   │   └── useMediaQuery.js
│   │   │
│   │   ├── pages/
│   │   │   └── ChatPage.jsx
│   │   │
│   │   ├── store/
│   │   │   ├── useAuthStore.js
│   │   │   └── useChatStore.js
│   │   │
│   │   ├── lib/
│   │   │   └── utils.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── .env
│
├── Dockerfile
├── package.json
└── README.md


<img width="1908" height="959" alt="image" src="https://github.com/user-attachments/assets/f885ed43-4b17-4e91-8b82-a89edc93c770" />

