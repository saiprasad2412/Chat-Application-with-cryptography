import { useWallpaper } from "../context/wallpaper";
import { useChatStore } from "../store/useChatStore";
import { useSelectedConversation } from "../hooks/useSelectedConversation";
import { useEffect } from "react";

import ChatSidebar from "../components/chat/ChatSidebar";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessageList } from "../components/chat/MessageList";
import { ChatComposer } from "../components/chat/ChatComposer";

function ChatPage() {
  const { frameStyle } = useWallpaper();

  // ==========================================
  // CHAT STORE
  // ==========================================

  const getConversations = useChatStore(
    (state) => state.getConversations,
  );

  const getMessages = useChatStore(
    (state) => state.getMessages,
  );

  const getUsers = useChatStore(
    (state) => state.getUsers,
  );

  const subscribeToMessages = useChatStore(
    (state) => state.subscribeToMessages,
  );

  const unsubscribeFromMessages = useChatStore(
    (state) => state.unsubscribeFromMessages,
  );

  // ==========================================
  // SELECTED CONVERSATION
  // ==========================================

  const {
    activeConversation,
    activeConversationId,
    isLargeScreen,
  } = useSelectedConversation();

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    console.log(
      "🚀 CHAT PAGE INITIALIZED",
    );

    getUsers();
    getConversations();
  }, [
    getUsers,
    getConversations,
  ]);

  // ==========================================
  // IMPORTANT:
  // SUBSCRIBE TO SOCKET ONCE
  //
  // DO NOT PUT activeConversationId HERE.
  //
  // We need to receive messages even when
  // no conversation is currently open.
  // ==========================================

  useEffect(() => {
    console.log(
      "📡 STARTING GLOBAL MESSAGE SUBSCRIPTION",
    );

    // Subscribe without requiring an active chat
    subscribeToMessages();

    return () => {
      console.log(
        "🧹 CLEANING GLOBAL MESSAGE SUBSCRIPTION",
      );

      unsubscribeFromMessages();
    };
  }, [
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // ==========================================
  // LOAD MESSAGES WHEN CHAT IS OPENED
  //
  // This is separate from socket subscription.
  // ==========================================

  useEffect(() => {
    if (!activeConversationId) {
      console.log(
        "💬 NO ACTIVE CONVERSATION",
      );

      return;
    }

    console.log(
      "📂 ACTIVE CONVERSATION:",
      activeConversationId,
    );

    console.log(
      "📥 LOADING MESSAGES FOR:",
      activeConversationId,
    );

    getMessages(activeConversationId);
  }, [
    activeConversationId,
    getMessages,
  ]);

  // ==========================================
  // DEBUG
  // ==========================================

  console.log(
    "🖥️ CHAT PAGE ACTIVE CONVERSATION:",
    activeConversationId,
  );

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden p-2 sm:p-3 md:p-8"
      style={frameStyle}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden rounded-2xl border border-border bg-background text-foreground">
        {/* ====================================
            SIDEBAR
        ==================================== */}

        <ChatSidebar />

        {/* ====================================
            CHAT AREA
        ==================================== */}

        <div
          className={`flex-1 flex-col overflow-hidden ${
            !isLargeScreen &&
            !activeConversationId
              ? "hidden lg:flex"
              : "flex"
          }`}
        >
          <ChatHeader />

          <MessageList />

          {activeConversation ? (
            <ChatComposer />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;