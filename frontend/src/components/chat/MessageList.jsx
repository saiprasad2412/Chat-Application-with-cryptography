import useScrollToBottom from "../../hooks/useScrollToBottom";

import { MessageBubble } from "./MessageBubble";

import { NoConversationPlaceholder } from "./NoConversationPlaceholder";

import { useSelectedConversation } from "../../hooks/useSelectedConversation";

export function MessageList() {
  const {
    activeConversation,
    activeConversationId,
  } = useSelectedConversation();

  // =========================================================
  // MESSAGES
  // =========================================================

  const messages =
    activeConversation?.messages || [];

  // =========================================================
  // LAST MESSAGE
  // =========================================================

  const lastMessage =
    messages.length > 0
      ? messages[messages.length - 1]
      : null;

  const lastMessageId =
    lastMessage?.id || null;

  // =========================================================
  // AUTO SCROLL
  // =========================================================

  const messagesScrollRef =
    useScrollToBottom(
      activeConversationId,
      lastMessageId
    );

  // =========================================================
  // DEBUG
  // =========================================================

  console.log(
    "🖥️ MESSAGE LIST ACTIVE CONVERSATION:",
    activeConversationId
  );

  console.log(
    "🖥️ MESSAGE LIST MESSAGES:",
    messages
  );

  console.log(
    "🖥️ MESSAGE COUNT:",
    messages.length
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {activeConversation ? (
        <div
          ref={messagesScrollRef}
          className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-2 py-3 sm:px-3 sm:py-4"
        >
          <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wide text-muted">
            Today
          </p>

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
            />
          ))}
        </div>
      ) : (
        <NoConversationPlaceholder />
      )}
    </div>
  );
}