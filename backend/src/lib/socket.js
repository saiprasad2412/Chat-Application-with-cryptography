import express from "express";
import http from "http";
import { Server } from "socket.io";

//we will delete express app from index.js so that our server use this app for initialization
const app = express();
const server=http.createServer(app);

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
const io= new Server(server,{ cors:{origin:[allowedOrigin]}})

function getReceiverSocketId(userId){
    return userSocketMap[userId];
}
//online users map={userId:socketId}
const userSocketMap ={};

//use io.on to listen events except this one
//here socket is basically connected user 
// io.on("connection",(socket)=>{
//     const userId= socket.handshake?.query?.userId;

//     if(userId) userSocketMap[userId]=socket.id;

//     //io.emit() sends event to everyone -broadcast
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));

//     //socket.on is used to listen for events
//     socket.on("disconnect",()=>{
//         if(userId) delete userSocketMap[userId];
//         io.emit("getOnlineUsers", Object.keys(userSocketMap))
//     }) 

// })
io.on("connection", (socket) => {
  const userId = socket.handshake?.query?.userId;

  console.log("🔌 SOCKET CONNECTED");
  console.log("User ID:", userId);
  console.log("Socket ID:", socket.id);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  console.log("👥 USER SOCKET MAP:", userSocketMap);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("❌ SOCKET DISCONNECTED");
    console.log("User ID:", userId);
    console.log("Socket ID:", socket.id);

    if (userId) {
      delete userSocketMap[userId];
    }

    console.log("👥 USER SOCKET MAP AFTER DISCONNECT:", userSocketMap);

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export {app,server,io,getReceiverSocketId};