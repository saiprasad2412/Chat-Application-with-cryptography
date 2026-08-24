import { useMediaQuery } from "./useMediaQuery";

import { formatMessageTime } from "../lib/utils";

import { useChatStore } from "../store/useChatStore";

import { useAuthStore } from "../store/useAuthStore";

import { decryptMessage } from "../lib/crypto";

export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase();
}
// MAP USER + MESSAGES TO UI CONVERSATION

function mapUserToConversation({
  user,
  messages,
  authUser,
  onlineUsers,
}) {
  const mappedMessages = messages.map((message) => {
    //! DECRYPT TEXT MESSAGE

    let decryptedText = message.text || "";

    // Only try to decrypt when text exists
    if (message.text) {
      decryptedText = decryptMessage(message.text);
    }

    return {
      // MessageBubble expects "id"
      id: message._id || message.id,

      // DETERMINE WHO SENT THE MESSAGE

      role:
        String(message.senderId) ===
        String(authUser?._id)
          ? "me"
          : "them",

      //! DECRYPTED TEXT FOR UI

      text: decryptedText,

      time: formatMessageTime(
        message.createdAt
      ),

      // Images and videos are NOT encrypted
      imageUrl: message.image,

      videoUrl: message.video,
    };
  });

  return {
    id: user._id || user.id,

    peer: {
      name:
        user.fullName ||
        user.name ||
        "",

      subtitle:
        user.email || "",

      isOnline:
        onlineUsers.includes(
          user._id || user.id
        ),

      avatarUrl:
        user.profilePic,

      initials: getInitials(
        user.fullName ||
        user.name ||
        ""
      ),
    },

    messages: mappedMessages,
  };
}

export function useSelectedConversation() {
  const activeConversationId =
    useChatStore(
      (state) => state.activeConversationId
    );

  const conversations =
    useChatStore(
      (state) => state.conversations
    );

  const users =
    useChatStore(
      (state) => state.users
    );

  const messages =
    useChatStore(
      (state) => state.messages
    );

  const authUser =
    useAuthStore(
      (state) => state.authUser
    );

  const onlineUsers =
    useAuthStore(
      (state) => state.onlineUsers
    );

  const isLargeScreen =
    useMediaQuery(
      "(min-width: 1024px)"
    );

  const selectedUser =
    activeConversationId
      ? users.find(
          (user) =>
            String(user._id) ===
            String(activeConversationId)
        ) ||
        conversations.find(
          (user) =>
            String(
              user._id || user.id
            ) ===
            String(activeConversationId)
        )
      : null;

  const activeConversation =
    selectedUser
      ? mapUserToConversation({
          user: selectedUser,
          messages,
          authUser,
          onlineUsers,
        })
      : null;

  return {
    activeConversation,

    activeConversationId,

    isLargeScreen,
  };
}