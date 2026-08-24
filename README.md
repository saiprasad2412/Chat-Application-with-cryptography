# 💬 Secure Chat Application

A full-stack real-time chat application built using the MERN stack with real-time messaging, media sharing, authentication, unread message notifications, and AES-based message encryption.
<img width="1919" height="981" alt="image" src="https://github.com/user-attachments/assets/5214c599-6c5f-48bf-835e-128c25264be0" />


---

## 📌 Project Overview

This project is a real-time chat application that allows users to communicate through text messages and share images/videos.

The application uses:

- React for the frontend
- Node.js and Express.js for the backend
- MongoDB for database storage
- Socket.IO for real-time messaging
- Clerk for authentication
- ImageKit for media storage
- Zustand for frontend state management
- AES encryption for securing text messages

The main goal of this project is to demonstrate how a modern real-time messaging application can be combined with basic cryptographic techniques to provide an additional layer of security for message content.

---

# 🚀 Features

## 🔐 Authentication

Authentication is handled using **Clerk**.

Users can securely:

- Sign up
- Log in
- Log out
- Maintain authenticated sessions

> Cryptography is not currently used for authentication. Clerk handles authentication and session management.

---

## 💬 Real-Time Messaging

The application supports real-time text messaging using Socket.IO.

When a user sends a message:

1. The message is entered by the sender.
2. The message is encrypted using AES.
3. The encrypted message is sent to the backend.
4. The encrypted message is stored in MongoDB.
5. Socket.IO sends the message to the receiver.
6. The receiver decrypts the message on the frontend.
7. The receiver sees the original plaintext message.

### Message Flow

```text
Sender
   |
   | Plain Text
   ↓
AES Encryption
   |
   | Encrypted Text
   ↓
Backend API
   |
   ↓
MongoDB
   |
   ↓
Socket.IO
   |
   ↓
Receiver
   |
   ↓
AES Decryption
   |
   ↓
Plain Text
