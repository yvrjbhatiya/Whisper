import {
  FiLock,
  FiHash,
  FiX,
  FiSearch,
  FiTrash2,
  FiMessageCircle,
  FiLogIn,
  FiEdit,
} from "react-icons/fi";
import { useMemo, useState } from "react";
import Avatar from "./Avatar";

const FILTERS = [
  { id: "direct", label: "Direct", icon: FiMessageCircle },
  { id: "private", label: "Private", icon: FiLock },
  { id: "public", label: "Public", icon: FiHash },
];

const inFilter = (room, id) =>
  id === "direct"
    ? room.isDirect
    : id === "private"
      ? room.isPrivate && !room.isDirect
      : !room.isPrivate && !room.isDirect;

function Sidebar({
  rooms = [],
  currentRoom,
  joinRoom,
  createPublicRoom,
  createPrivateRoom,
  joinPrivateRoom,
  startDirectMessage,
  deleteRoom,
  presence = {},
  onClose,
  mobile,
}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("direct");

  const trimmedQuery = query.trim().toLowerCase();
  const hasQuery = trimmedQuery.length > 0;

  // Every action is one tap away - no menu to open first.
  const run = (action) => () => {
    action?.();
    onClose?.();
  };

  const quickActions = [
    { label: "New message", Icon: FiEdit, tint: "bg-iris-500/10 text-iris-600 dark:text-iris-300", onClick: run(startDirectMessage) },
    { label: "Public room", Icon: FiHash, tint: "bg-sky-500/10 text-sky-600 dark:text-sky-300", onClick: run(createPublicRoom) },
    { label: "Private room", Icon: FiLock, tint: "bg-ember-500/10 text-ember-500", onClick: run(createPrivateRoom) },
    { label: "Join with ID", Icon: FiLogIn, tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", onClick: run(joinPrivateRoom) },
  ];

  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map(({ id }) => {
          const list = rooms.filter((room) => inFilter(room, id));
          return [id, { total: list.length, unread: list.reduce((sum, room) => sum + (room.unreadCount || 0), 0) }];
        })
      ),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const text = `${room.displayName || ""} ${room.name || ""} ${room.peerUsername || ""} ${room.inviteId || ""}`.toLowerCase();
      if (hasQuery) return text.includes(trimmedQuery);
      return inFilter(room, activeFilter);
    });
  }, [rooms, trimmedQuery, hasQuery, activeFilter]);

  const renderRow = (room) => {
    const active = room.name === currentRoom;
    const Icon = room.isDirect ? FiMessageCircle : room.isPrivate ? FiLock : FiHash;
    const online = room.isDirect && room.peerId ? presence[String(room.peerId)] : false;

    return (
      <li key={room.name} className="group flex items-center gap-2">
        <button
          type="button"
          onClick={() => joinRoom(room)}
          aria-current={active ? "page" : undefined}
          className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all duration-200 ${
            active
              ? "bg-iris-600 text-white shadow-lg shadow-iris-600/20"
              : "bg-fog-100 text-ink-700 hover:bg-fog-200 dark:bg-ink-900 dark:text-fog-200 dark:hover:bg-ink-700"
          }`}
        >
          {room.isDirect ? (
            <span className="relative shrink-0">
              <Avatar
                name={room.peerUsername || room.displayName}
                avatar={room.peerAvatar}
                size={32}
                className={active ? "ring-2 ring-white/80" : ""}
              />
              {online && (
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 bg-emerald-500 ${
                    active ? "border-iris-600" : "border-fog-100 dark:border-ink-900"
                  }`}
                  title="Online"
                />
              )}
            </span>
          ) : (
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                active ? "bg-white/20 text-white" : room.isPrivate ? "bg-ember-500/10 text-ember-500" : "bg-iris-500/10 text-iris-500"
              }`}
            >
              <Icon size={16} />
            </span>
          )}

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{room.displayName || room.name}</span>

            {room.isPrivate && room.inviteId && (
              <span className={`mt-0.5 block truncate text-[10px] tracking-wider ${active ? "text-white/70" : "text-ink-600/75 dark:text-fog-300/80"}`}>
                ID: {room.inviteId}
              </span>
            )}
          </span>

          {room.unreadCount > 0 && !active && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ember-500 px-1 text-[10px] font-bold text-white">
              {room.unreadCount > 99 ? "99+" : room.unreadCount}
            </span>
          )}
        </button>

        {room.isPrivate && room.isOwner && (
          <button
            type="button"
            onClick={() => deleteRoom(room)}
            aria-label={`Delete ${room.name}`}
            title="Delete room"
            className="rounded-lg p-2 text-red-500 opacity-70 transition hover:bg-red-500/10 hover:opacity-100"
          >
            <FiTrash2 size={15} />
          </button>
        )}
      </li>
    );
  };

  // What to offer when the current tab has nothing in it.
  const emptyActions =
    activeFilter === "public"
      ? [{ label: "Create a public room", onClick: run(createPublicRoom), primary: true }]
      : activeFilter === "private"
        ? [
            { label: "Create a private room", onClick: run(createPrivateRoom), primary: true },
            { label: "Join with an ID", onClick: run(joinPrivateRoom) },
          ]
        : [{ label: "Start a message", onClick: run(startDirectMessage), primary: true }];

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden bg-white safe-t dark:bg-ink-950">
      <header className="flex min-h-[60px] items-center justify-between border-b border-transparent pl-[18px] pr-3 sm:pl-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight dark:text-white">Whisper</h1>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close rooms"
            className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-fog-100 dark:hover:bg-ink-700"
          >
            <FiX size={20} />
          </button>
        )}
      </header>

      {/* Search */}
      <div className="mt-2 px-4 pb-1">
        <div className="relative">
          <FiSearch size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/75" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            aria-label="Search conversations"
            className="w-full rounded-xl border border-fog-200 bg-fog-100 py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-iris-500 focus:ring-2 focus:ring-iris-500/20 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-600/75 transition hover:bg-fog-200 dark:hover:bg-ink-700"
            >
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Quick actions: create / join are always visible */}
      <section className="px-4 pb-1 pt-2" aria-label="Start something new">
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map(({ label, Icon, tint, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="group flex items-center gap-2.5 rounded-xl border border-fog-200 bg-white px-2.5 py-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-iris-500/40 hover:shadow-md active:scale-95 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-iris-400/40"
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-110 ${tint}`}>
                <Icon size={16} />
              </span>
              <span className="min-w-0 truncate text-[13px] font-semibold text-ink-800 dark:text-fog-100">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Category tabs, with unread badges */}
      <div className="px-4 pt-3">
        <div className="flex gap-1 rounded-xl bg-fog-100 p-1 dark:bg-ink-900" role="tablist">
          {FILTERS.map(({ id, label, icon: Icon }) => {
            const active = activeFilter === id;
            const { total, unread } = counts[id];

            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveFilter(id)}
                className={`relative flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-white text-iris-600 shadow-sm dark:bg-ink-700 dark:text-iris-400"
                    : "text-ink-600/75 hover:text-ink-800 dark:text-fog-300/80"
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
                <span className="text-[10px] opacity-60">{total}</span>
                {unread > 0 && !active && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-ember-500" aria-label={`${unread} unread`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room list */}
      <nav className="scroll-thin mt-3 flex-1 overflow-y-auto px-4 pb-4" aria-label="Conversations">
        {filteredRooms.length > 0 ? (
          <ul className="space-y-2">{filteredRooms.map(renderRow)}</ul>
        ) : (
          <div className="flex flex-col items-center justify-center px-1 py-3 text-center">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-fog-100 dark:bg-ink-900">
              {activeFilter === "public" ? (
                <FiHash size={23} className="text-iris-500" />
              ) : activeFilter === "private" ? (
                <FiLock size={23} className="text-ember-500" />
              ) : (
                <FiMessageCircle size={23} className="text-iris-500" />
              )}
            </div>

            <p className="text-sm font-semibold">{hasQuery ? "No conversations found" : "Nothing here yet"}</p>

            <p className="mt-1 text-xs text-ink-600/75 dark:text-fog-300/80">
              {hasQuery ? "Try another search term." : "Get started with one tap:"}
            </p>

            {!hasQuery && (
              <div className="mt-3 flex w-full flex-col gap-2">
                {emptyActions.map(({ label, onClick, primary }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={onClick}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
                      primary
                        ? "bg-iris-600 text-white shadow-lg shadow-iris-600/20 hover:bg-iris-500"
                        : "border border-fog-200 text-ink-700 hover:bg-fog-100 dark:border-ink-700 dark:text-fog-200 dark:hover:bg-ink-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;