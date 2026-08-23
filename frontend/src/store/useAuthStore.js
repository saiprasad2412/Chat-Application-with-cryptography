import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });

    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });

      get().connectSocket(res.data);
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  clearAuth: () => {
    set({
      authUser: null,
      isCheckingAuth: false,
      onlineUsers: [],
    });

    get().disconnectSocket();
  },

  connectSocket: (user) => {
    if (!user) return;

    // Don't create another socket if one already exists
    if (get().socket) {
      console.log("⚠️ Socket already exists");
      return;
    }

    console.log("🔌 CONNECTING SOCKET FOR USER:", user._id);

    const socket = io(BASE_URL, {
      query: {
        userId: user._id,
      },
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("✅ SOCKET CONNECTED:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ SOCKET DISCONNECTED");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ SOCKET CONNECTION ERROR:", error.message);
    });

    socket.on("getOnlineUsers", (userIds) => {
      console.log("👥 ONLINE USERS:", userIds);

      set({
        onlineUsers: userIds,
      });
    });

    // ==========================================
    // RECEIVE NEW MESSAGE FROM SOCKET.IO
    // ==========================================

    socket.on("newMessage", (newMessage) => {
      console.log("🔥🔥🔥 AUTH STORE RECEIVED NEW MESSAGE 🔥🔥🔥");
      console.log("New message:", newMessage);

      // Send the message from AuthStore to ChatStore
      window.dispatchEvent(
        new CustomEvent("socket:newMessage", {
          detail: newMessage,
        }),
      );

      console.log("📢 SENT MESSAGE TO CHAT STORE");
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;

    if (socket) {
      console.log("🔌 DISCONNECTING SOCKET");

      socket.removeAllListeners();
      socket.disconnect();
    }

    set({
      socket: null,
      onlineUsers: [],
    });
  },
}));