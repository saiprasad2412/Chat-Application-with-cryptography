import { create } from "zustand";
import { persist } from "zustand/middleware";

import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

import { encryptMessage } from "../lib/crypto";

export const useChatStore = create(
  persist(
    (set, get) => ({
      // ==========================================
      // STATE
      // ==========================================

      users: [],
      conversations: [],
      messages: [],

      selectedUser: null,
      activeConversationId: null,

      // ==========================================
      // UNREAD COUNTS
      // ==========================================

      unreadCounts: {},

      isConversationsLoading: false,
      isUsersLoading: false,
      isMessagesLoading: false,
      isSendingMedia: false,

      searchQuery: "",
      sidebarTab: "chats",
      composerText: "",
      isSoundEnabled: true,

      messageSocketHandler: null,

      // ==========================================
      // GET USERS
      // ==========================================

      getUsers: async () => {
        set({ isUsersLoading: true });

        try {
          const res = await axiosInstance.get("/messages/users");

          set((state) => ({
            users: res.data,

            selectedUser:
              state.selectedUser &&
              res.data.some(
                (user) => user._id === state.selectedUser._id,
              )
                ? state.selectedUser
                : null,
          }));
        } catch (error) {
          console.log("❌ Error in getUsers:", error.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      // ==========================================
      // GET CONVERSATIONS
      // ==========================================

      getConversations: async () => {
        set({ isConversationsLoading: true });

        try {
          const res = await axiosInstance.get(
            "/messages/conversations",
          );

          set({
            conversations: res.data,
          });
        } catch (error) {
          console.log(
            "❌ Error in getConversations:",
            error.message,
          );
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      // ==========================================
      // GET MESSAGES
      // ==========================================

      getMessages: async (userId) => {
        if (!userId) return;

        console.log("📥 GETTING MESSAGES FOR:", userId);

        set({
          isMessagesLoading: true,
        });

        try {
          const res = await axiosInstance.get(
            `/messages/${userId}`,
          );

          console.log(
            "📨 ENCRYPTED MESSAGES RECEIVED FROM API:",
            res.data,
          );

          // IMPORTANT:
          // Keep encrypted messages inside the store.
          // They will be decrypted in useSelectedConversation.js.
          set({
            messages: res.data,
          });
        } catch (error) {
          console.error(
            "❌ Error getting messages:",
            error,
          );

          toast.error(
            error.response?.data?.message ||
              "Failed to load messages",
          );
        } finally {
          set({
            isMessagesLoading: false,
          });
        }
      },

      // ==========================================
      // SEND MESSAGE
      // ==========================================

      sendMessage: async (messageData) => {
        const { selectedUser } = get();

        if (!selectedUser) {
          console.log("❌ No selected user");
          return false;
        }

        try {
          console.log(
            "📤 SENDING MESSAGE TO:",
            selectedUser._id,
          );

          const res = await axiosInstance.post(
            `/messages/send/${selectedUser._id}`,
            messageData,
          );

          const newMessage = res.data;

          console.log(
            "✅ MESSAGE SAVED:",
            newMessage,
          );

          set((state) => {
            const alreadyExists = state.messages.some(
              (message) =>
                String(message._id) ===
                String(newMessage._id),
            );

            if (alreadyExists) {
              return {
                composerText: "",
              };
            }

            return {
              messages: [
                ...state.messages,
                newMessage,
              ],
              composerText: "",
            };
          });

          // Update sidebar
          get().getConversations();

          return true;
        } catch (error) {
          console.error(
            "❌ Error sending message:",
            error,
          );

          toast.error(
            error.response?.data?.message ||
              "Failed to send message",
          );

          return false;
        }
      },

      // ==========================================
      // SUBSCRIBE TO SOCKET MESSAGES
      // ==========================================

      subscribeToMessages: () => {
        console.log(
          "📡 Subscribing to ALL incoming messages",
        );

        // Remove previous listener
        const previousHandler =
          get().messageSocketHandler;

        if (previousHandler) {
          console.log(
            "🧹 Removing previous message handler",
          );

          window.removeEventListener(
            "socket:newMessage",
            previousHandler,
          );
        }

        // ==========================================
        // SOCKET MESSAGE HANDLER
        // ==========================================

        const handler = (event) => {
          const newMessage = event.detail;

          console.log(
            "🔥🔥🔥 CHAT STORE RECEIVED MESSAGE 🔥🔥🔥",
          );

          console.log(
            "📨 Incoming encrypted message:",
            newMessage,
          );

          // ==========================================
          // CURRENT USER
          // ==========================================

          const currentUser =
            useAuthStore.getState().authUser;

          const currentUserId =
            currentUser?._id;

          console.log(
            "👤 CURRENT USER:",
            currentUserId,
          );

          if (!currentUserId) {
            console.log(
              "❌ Current user not available",
            );

            return;
          }

          // ==========================================
          // MESSAGE DETAILS
          // ==========================================

          const senderId = String(
            newMessage.senderId,
          );

          const receiverId = String(
            newMessage.receiverId,
          );

          console.log(
            "📤 MESSAGE SENDER:",
            senderId,
          );

          console.log(
            "📥 MESSAGE RECEIVER:",
            receiverId,
          );

          // ==========================================
          // ONLY PROCESS MESSAGES RECEIVED BY ME
          // ==========================================

          if (
            receiverId !==
            String(currentUserId)
          ) {
            console.log(
              "⏭️ This message is not for current user",
            );

            return;
          }

          // ==========================================
          // CONVERSATION ID
          // ==========================================

          const messageConversationId =
            senderId;

          console.log(
            "💬 MESSAGE CONVERSATION ID:",
            messageConversationId,
          );

          // ==========================================
          // CURRENT ACTIVE CHAT
          // ==========================================

          const activeConversationId =
            get().activeConversationId;

          console.log(
            "🎯 Active conversation:",
            activeConversationId,
          );

          // ==========================================
          // PREVENT DUPLICATE MESSAGE
          // ==========================================

          const currentMessages =
            get().messages;

          const alreadyExists =
            currentMessages.some(
              (message) =>
                String(message._id) ===
                String(newMessage._id),
            );

          if (alreadyExists) {
            console.log(
              "⚠️ MESSAGE ALREADY EXISTS:",
              newMessage._id,
            );

            return;
          }

          // ==========================================
          // CHAT IS OPEN WITH THIS USER
          // ==========================================

          if (
            String(activeConversationId) ===
            String(messageConversationId)
          ) {
            console.log(
              "✅ MESSAGE BELONGS TO CURRENT OPEN CHAT",
            );

            set((state) => ({
              messages: [
                ...state.messages,
                newMessage,
              ],
            }));

            console.log(
              "🎉 MESSAGE ADDED TO OPEN CHAT",
            );

            get().getConversations();

            return;
          }

          // ==========================================
          // CHAT IS CLOSED OR DIFFERENT CHAT IS OPEN
          // ==========================================

          console.log(
            "📌 MESSAGE STORED WHILE CHAT IS CLOSED OR DIFFERENT CHAT IS OPEN",
          );

          set((state) => ({
            messages: [
              ...state.messages,
              newMessage,
            ],

            // Increase unread count
            unreadCounts: {
              ...state.unreadCounts,

              [messageConversationId]:
                (state.unreadCounts[
                  messageConversationId
                ] || 0) + 1,
            },
          }));

          console.log(
            "📨 TOTAL MESSAGES IN THIS CONVERSATION:",
            get().unreadCounts[
              messageConversationId
            ],
          );

          console.log(
            "🔢 UNREAD COUNTS:",
            get().unreadCounts,
          );

          // Update sidebar conversations
          console.log(
            "🔄 Updating conversations...",
          );

          get().getConversations();
        };

        // Save handler
        set({
          messageSocketHandler: handler,
        });

        // Register handler
        window.addEventListener(
          "socket:newMessage",
          handler,
        );

        console.log(
          "✅ MESSAGE HANDLER REGISTERED",
        );
      },

      // ==========================================
      // UNSUBSCRIBE
      // ==========================================

      unsubscribeFromMessages: () => {
        const handler =
          get().messageSocketHandler;

        if (handler) {
          console.log(
            "🧹 UNSUBSCRIBING FROM MESSAGES",
          );

          window.removeEventListener(
            "socket:newMessage",
            handler,
          );
        }

        set({
          messageSocketHandler: null,
        });
      },

      // ==========================================
      // SET SELECTED USER
      // ==========================================

      setSelectedUser: (selectedUser) => {
        set({
          selectedUser,
        });
      },

      // ==========================================
      // SET ACTIVE CONVERSATION
      // ==========================================

      setActiveConversationId: (
        activeConversationId,
      ) => {
        console.log(
          "🎯 SET ACTIVE CONVERSATION:",
          activeConversationId,
        );

        set((state) => {
          const selectedUser =
            state.users.find(
              (user) =>
                user._id ===
                activeConversationId,
            ) ||
            state.conversations.find(
              (user) =>
                user._id ===
                activeConversationId,
            ) ||
            null;

          console.log(
            "👤 SELECTED USER:",
            selectedUser,
          );

          // ==========================================
          // CLEAR UNREAD COUNT
          // ==========================================

          const updatedUnreadCounts = {
            ...state.unreadCounts,
          };

          if (activeConversationId) {
            delete updatedUnreadCounts[
              activeConversationId
            ];
          }

          return {
            activeConversationId,

            selectedUser,

            messages: [],

            unreadCounts: updatedUnreadCounts,
          };
        });

        console.log(
          "📖 MARKED CONVERSATION AS READ:",
          activeConversationId,
        );
      },

      // ==========================================
      // SEARCH
      // ==========================================

      setSearchQuery: (searchQuery) => {
        set({
          searchQuery,
        });
      },

      // ==========================================
      // SIDEBAR TAB
      // ==========================================

      setSidebarTab: (sidebarTab) => {
        set({
          sidebarTab,
        });
      },

      // ==========================================
      // COMPOSER TEXT
      // ==========================================

      setComposerText: (composerText) => {
        set({
          composerText,
        });
      },

      // ==========================================
      // SOUND
      // ==========================================

      setSoundEnabled: (isSoundEnabled) => {
        set({
          isSoundEnabled,
        });
      },

      // ==========================================
      // SEND TEXT MESSAGE
      // ==========================================

      sendTextMessage: async (conversationId) => {
        const messageText =
          get().composerText.trim();

        if (
          !conversationId ||
          !messageText
        ) {
          return false;
        }

        // ==========================================
        // AES ENCRYPTION
        // ==========================================

        const encryptedText =
          encryptMessage(messageText);

        console.log(
          "🔐 ORIGINAL MESSAGE:",
          messageText,
        );

        console.log(
          "🔐 ENCRYPTED MESSAGE:",
          encryptedText,
        );

        return get().sendMessage({
          text: encryptedText,
        });
      },

      // ==========================================
      // SEND MEDIA MESSAGE
      // ==========================================

      sendMediaMessage: async ({
        conversationId,
        file,
      }) => {
        if (
          !conversationId ||
          !file
        ) {
          return false;
        }

        const formData = new FormData();

        // Media is NOT encrypted.
        formData.append("media", file);

        set({
          isSendingMedia: true,
        });

        try {
          return await get().sendMessage(
            formData,
          );
        } finally {
          set({
            isSendingMedia: false,
          });
        }
      },
    }),

    // ==========================================
    // PERSIST
    // ==========================================

    {
      name: "imessage-storage",

      partialize: (state) => ({
        isSoundEnabled:
          state.isSoundEnabled,

        // Do NOT persist unread counts.
        // They represent the current session.
      }),
    },
  ),
);