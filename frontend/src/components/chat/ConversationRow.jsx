export function ConversationRow({
  user,
  selected,
  onSelect,
  unreadCount = 0,
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50 ${
        selected ? "bg-muted" : ""
      }`}
    >
      {/* ======================================
          AVATAR
      ====================================== */}

      <div className="relative shrink-0">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {user.initials}
          </div>
        )}

        {/* ONLINE DOT */}

        {user.isOnline ? (
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-green-500" />
        ) : null}
      </div>

      {/* ======================================
          USER INFO
      ====================================== */}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`truncate text-sm ${
              unreadCount > 0
                ? "font-bold"
                : "font-medium"
            }`}
          >
            {user.name}
          </p>

          {/* ==================================
              UNREAD COUNT
          ================================== */}

          {unreadCount > 0 ? (
            <span className="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          ) : null}
        </div>

        {/* ====================================
            EMAIL / SUBTITLE
        ==================================== */}

        {user.peer?.subtitle ? (
          <p className="truncate text-xs text-muted">
            {user.peer.subtitle}
          </p>
        ) : null}
      </div>
    </button>
  );
}