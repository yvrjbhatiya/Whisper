import { FiLock, FiHash, FiPlus, FiX, FiSearch, FiLogOut, FiEdit3 } from "react-icons/fi";
import { useState } from "react";
import Avatar from "./Avatar";
import logo from "../images/logo.png";
import { API_URL } from "../lib/config";

function Sidebar({ rooms, currentRoom, joinRoom, createPrivateRoom, user, onLogout, onClose, mobile, onProfileChange, token }) {
  const [query, setQuery] = useState("");
  const filtered = rooms.filter((r) => r.name?.toLowerCase().includes(query.toLowerCase()));
  const pub = filtered.filter((r) => !r.isPrivate);
  const priv = filtered.filter((r) => r.isPrivate);

  const Row = ({ room }) => {
    const active = room.name === currentRoom;
    return (
      <li>
        <button
          onClick={() => joinRoom(room)}
          aria-current={active ? "true" : undefined}
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
            active
              ? "bg-iris-600 text-white shadow-md shadow-iris-600/25"
              : "text-ink-700 hover:bg-fog-100 dark:text-fog-200 dark:hover:bg-ink-700/60"
          }`}
        >
          {room.isPrivate ? (
            <FiLock size={16} className={active ? "text-white" : "text-ember-500"} />
          ) : (
            <FiHash size={16} className={active ? "text-white" : "text-iris-500"} />
          )}
          <span className="flex-1 truncate font-medium">{room.name}</span>
        </button>
      </li>
    );
  };

  return (
    <aside className="flex h-full w-full flex-col bg-white dark:bg-ink-800 safe-t">
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="" width={30} height={30} className="rounded-lg" />
          <span className="font-display text-xl font-bold tracking-tight">Whisper</span>
        </div>
        {mobile && (
          <button onClick={onClose} aria-label="Close rooms" className="grid h-10 w-10 place-items-center rounded-full hover:bg-fog-100 dark:hover:bg-ink-700">
            <FiX size={20} />
          </button>
        )}
      </div>

      <div className="px-4">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/50 dark:text-fog-300/50" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a room"
            aria-label="Find a room"
            className="w-full rounded-xl bg-fog-100 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-ink-600/50 focus:ring-2 focus:ring-iris-500/40 dark:bg-ink-900 dark:placeholder:text-fog-300/40"
          />
        </div>
      </div>

      <nav className="scroll-thin mt-4 flex-1 overflow-y-auto px-3" aria-label="Rooms">
        <h2 className="px-3 pb-1 text-xs font-semibold text-ink-600/60 dark:text-fog-300/50">Public rooms</h2>
        <ul className="space-y-1">
          {pub.map((r) => <Row key={r.name} room={r} />)}
        </ul>
        {pub.length === 0 && <p className="px-3 py-2 text-sm text-ink-600/60 dark:text-fog-300/50">{query ? "No match." : "No public rooms yet."}</p>}

        <h2 className="mt-5 px-3 pb-1 text-xs font-semibold text-ink-600/60 dark:text-fog-300/50">Private rooms</h2>
        <ul className="space-y-1">
          {priv.map((r) => <Row key={r.name} room={r} />)}
        </ul>
        {priv.length === 0 && <p className="px-3 py-2 text-sm text-ink-600/60 dark:text-fog-300/50">{query ? "No match." : "Create one to chat with a password."}</p>}
      </nav>

      <div className="space-y-3 border-t border-fog-200 p-4 dark:border-ink-700">
        <button
          onClick={createPrivateRoom}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-iris-500/60 py-2.5 text-sm font-semibold text-iris-600 transition hover:bg-iris-500/10 dark:text-iris-400"
        >
          <FiPlus size={16} /> New room
        </button>
        <div className="flex items-center gap-3">
          <Avatar name={user.username} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.displayName || user.username}</p>
            <p className="truncate text-xs text-ink-600/60 dark:text-fog-300/50">@{user.username}</p>
          </div>
          <button onClick={() => {
            const displayName = window.prompt("Display name", user.displayName || user.username);
            if (displayName === null) return;
            const bio = window.prompt("Bio", user.bio || "");
            if (bio === null) return;
            fetch(`${API_URL}/api/users/me`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ displayName, bio }) })
              .then((r) => r.ok ? r.json() : Promise.reject()).then((data) => onProfileChange(data.user));
          }} aria-label="Edit profile" title="Edit profile" className="grid h-10 w-10 place-items-center rounded-full text-ink-600 hover:bg-fog-100 dark:text-fog-300 dark:hover:bg-ink-700"><FiEdit3 size={16} /></button>
          <button onClick={onLogout} aria-label="Log out" title="Log out" className="grid h-10 w-10 place-items-center rounded-full text-ink-600 transition hover:bg-fog-100 hover:text-red-500 dark:text-fog-300 dark:hover:bg-ink-700">
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
