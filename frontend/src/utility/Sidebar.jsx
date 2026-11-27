import {
  FiLock,
  FiHash,
  FiPlus,
  FiX,
  FiSearch,
  FiTrash2,
  FiMessageCircle,
} from "react-icons/fi";
import { FiChevronDown, FiUsers, FiLogIn } from "react-icons/fi";
import { useMemo, useState } from "react";
import logo from "../images/logo.png";

function Sidebar({
  rooms = [],
  currentRoom,
  joinRoom,
  createPublicRoom,
  createPrivateRoom,
  joinPrivateRoom,
  startDirectMessage,
  deleteRoom,
  onClose,
  mobile,
}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("public");
  const [actionsOpen, setActionsOpen] = useState(false);

  const filters = [
    { id: "public", label: "Public", icon: FiHash },
    { id: "private", label: "Private", icon: FiLock },
    { id: "direct", label: "Direct", icon: FiMessageCircle },
  ];

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesQuery = (room.displayName || room.name || "")
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesType =
        activeFilter === "public"
          ? !room.isPrivate && !room.isDirect
          : activeFilter === "private"
            ? room.isPrivate && !room.isDirect
            : room.isDirect;

      return matchesQuery && matchesType;
    });
  }, [rooms, query, activeFilter]);

  const Row = ({ room }) => {
    const active = room.name === currentRoom;

    const Icon = room.isDirect
      ? FiMessageCircle
      : room.isPrivate
        ? FiLock
        : FiHash;

    return (
      <li className="group flex items-center gap-2">
        <button
          onClick={() => joinRoom(room)}
          aria-current={active ? "page" : undefined}
          className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
            active
              ? "bg-iris-600 text-white shadow-lg shadow-iris-600/20"
              : "text-ink-700 hover:bg-fog-100 dark:text-fog-200 dark:hover:bg-ink-700"
          }`}
        >
          <Icon
            size={17}
            className={
              active
                ? "shrink-0 text-white"
                : room.isPrivate
                  ? "shrink-0 text-ember-500"
                  : "shrink-0 text-iris-500"
            }
          />

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {room.displayName || room.name}
            </span>

            {room.isPrivate && room.inviteId && (
              <span
                className={`mt-0.5 block truncate text-[10px] tracking-wider ${
                  active
                    ? "text-white/70"
                    : "text-ink-600/50 dark:text-fog-300/50"
                }`}
              >
                ID: {room.inviteId}
              </span>
            )}
          </span>
        </button>

        {room.isPrivate && room.isOwner && (
          <button
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

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden bg-white dark:bg-ink-800 safe-t">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-iris-500/10">
            <img
              src={logo}
              alt=""
              width={30}
              height={30}
              className="rounded-lg"
            />
          </div>

          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">
              Whisper
            </h1>
          </div>
        </div>

        {mobile && (
          <button
            onClick={onClose}
            aria-label="Close rooms"
            className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-fog-100 dark:hover:bg-ink-700"
          >
            <FiX size={20} />
          </button>
        )}
      </header>

      {/* Search */}
      <div className="px-4">
        <div className="relative">
          <FiSearch
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/40"
          />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            aria-label="Search conversations"
            className="w-full rounded-xl border border-fog-200 bg-fog-100 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-iris-500 focus:ring-2 focus:ring-iris-500/20 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
          />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="relative p-4 dark:border-ink-700">
        <button
          type="button"
          onClick={() => setActionsOpen((open) => !open)}
          aria-expanded={actionsOpen}
          className="flex h-11 w-full items-center justify-between rounded-xl bg-iris-600 px-4 text-sm font-semibold text-white shadow-lg shadow-iris-600/15 transition hover:bg-iris-500 active:scale-[0.99]"
        >
          <span className="flex items-center gap-2">
            <FiPlus size={17} />
            Create or join
          </span>

          <FiChevronDown
            size={17}
            className={`transition-transform duration-200 ${
              actionsOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {actionsOpen && (
          <>
            {/* Outside click overlay */}
            <button
              type="button"
              aria-label="Close actions menu"
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setActionsOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute top-full left-4 right-4 z-20  overflow-hidden rounded-xl border border-fog-200 bg-white p-1.5 shadow-2xl dark:border-ink-700 dark:bg-ink-800">
              <button
                type="button"
                onClick={() => {
                  setActionsOpen(false);
                  createPublicRoom?.();
                  onClose?.();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink-700 transition hover:bg-fog-100 dark:text-fog-200 dark:hover:bg-ink-700"
              >
                <FiHash size={17} className="text-iris-500" />
                Create public room
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionsOpen(false);
                  createPrivateRoom?.();
                  onClose?.();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink-700 transition hover:bg-fog-100 dark:text-fog-200 dark:hover:bg-ink-700"
              >
                <FiLock size={17} className="text-ember-500" />
                Create private room
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionsOpen(false);
                  joinPrivateRoom?.();
                  onClose?.();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink-700 transition hover:bg-fog-100 dark:text-fog-200 dark:hover:bg-ink-700"
              >
                <FiLogIn size={17} className="text-ink-400" />
                Join private room
              </button>

              <div className="my-1 border-t border-fog-200 dark:border-ink-700" />

              <button
                type="button"
                onClick={() => {
                  setActionsOpen(false);
                  startDirectMessage?.();
                  onClose?.();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink-700 transition hover:bg-fog-100 dark:text-fog-200 dark:hover:bg-ink-700"
              >
                <FiUsers size={17} className="text-iris-500" />
                New direct message
              </button>
            </div>
          </>
        )}
      </div>

      {/* Category filters */}
      <div className="px-4">
        <div className="flex gap-1 rounded-xl bg-fog-100 p-1 dark:bg-ink-900">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const count = rooms.filter((room) =>
              filter.id === "public"
                ? !room.isPrivate && !room.isDirect
                : filter.id === "private"
                  ? room.isPrivate && !room.isDirect
                  : room.isDirect,
            ).length;

            const active = activeFilter === filter.id;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                aria-pressed={active}
                className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-white text-iris-600 shadow-sm dark:bg-ink-700 dark:text-iris-400"
                    : "text-ink-600/60 hover:text-ink-800 dark:text-fog-300/60"
                }`}
              >
                <Icon size={14} />
                <span>{filter.label}</span>
                <span className="text-[10px] opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Room list */}
      <nav
        className="scroll-thin mt-4 flex-1 overflow-y-auto px-4 pb-4"
        aria-label="Conversations"
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-600/50 dark:text-fog-300/50">
            {filters.find((f) => f.id === activeFilter)?.label} Rooms
          </h2>

          <span className="text-xs text-ink-600/40">
            {filteredRooms.length} rooms
          </span>
        </div>

        {filteredRooms.length > 0 ? (
          <ul className="space-y-1.5">
            {filteredRooms.map((room) => (
              <Row key={room.name} room={room} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-fog-100 dark:bg-ink-900">
              {activeFilter === "public" ? (
                <FiHash size={23} className="text-iris-500" />
              ) : activeFilter === "private" ? (
                <FiLock size={23} className="text-ember-500" />
              ) : (
                <FiMessageCircle size={23} className="text-iris-500" />
              )}
            </div>

            <p className="text-sm font-semibold">
              {query ? "No conversations found" : "Nothing here yet"}
            </p>

            <p className="mt-1 text-xs text-ink-600/50 dark:text-fog-300/50">
              {query
                ? "Try another search term."
                : "Create or join a room to get started."}
            </p>
          </div>
        )}
      </nav>

      
    </aside>
  );
}

export default Sidebar;
