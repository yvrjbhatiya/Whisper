import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { FiMenu, FiSun, FiMoon, FiLock, FiHash, FiLogOut } from "react-icons/fi";
import { toast } from "react-toastify";
import socket from "../socket";
import { API_URL } from "../lib/config";
import Sidebar from "../utility/Sidebar";
import Messages from "../utility/Messages";
import InputBox from "../utility/InputBox";
import CreatePrivateRoomModal from "../utility/CreatePrivateRoomModal";
import JoinPrivateRoomModal from "../utility/JoinPrivateRoomModal";
import logo from "../images/logo.png";

function Chat({ user, token, onProfileChange, isDarkTheme, toggleTheme, onLogout }) {
  const name = user?.username || "";
  const displayName = user?.displayName || name || "there";
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createPrivate, setCreatePrivate] = useState(false);
  const [showJoinPrivate, setShowJoinPrivate] = useState(false);
  const roomRef = useRef("");
  roomRef.current = currentRoom;

  // live messages: one listener, filtered by the room I'm in
  useEffect(() => {
    const onMessage = (msg) => {
      if (msg.room && msg.room !== roomRef.current) return;
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("message", onMessage);
    return () => {
      socket.off("message", onMessage);
    };
  }, []);

  useEffect(() => {
    socket.auth = { token };
    socket.connect();
    return () => socket.disconnect();
  }, [token]);

  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  const loadRooms = useCallback(() => {
    fetch(`${API_URL}/api/rooms`, { headers: authHeaders })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setRooms).catch(() => toast.error("Couldn't load rooms."));
  }, [token]);
  useEffect(() => { loadRooms(); }, [loadRooms]);

  // history for the active room
  useEffect(() => {
    if (!currentRoom) return;
    let cancelled = false;
    setLoadingMessages(true);
    setMessages([]);
    fetch(`${API_URL}/api/messages/getMessages/${encodeURIComponent(currentRoom)}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error("Network response was not ok");
        return r.json();
      })
      .then((data) => !cancelled && setMessages(data))
      .catch(() => !cancelled && toast.error("Couldn't load earlier messages."))
      .finally(() => !cancelled && setLoadingMessages(false));
    return () => { cancelled = true; };
  }, [currentRoom, token]);

  const enterRoom = useCallback((name) => {
    if (roomRef.current && roomRef.current !== name) socket.emit("leaveRoom", roomRef.current);
    socket.emit("joinRoom", name);
    setCurrentRoom(name);
    setDrawerOpen(false);
  }, []);

  const joinRoom = (room) => {
    if (room.name === currentRoom) return setDrawerOpen(false);
    enterRoom(room.name);
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom", currentRoom);
    setCurrentRoom("");
    setMessages([]);
  };

  const createPrivateRoom = (roomName, isPrivate, password) => {
    fetch(`${API_URL}/api/rooms/createRoom`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ roomName, isPrivate, password }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (data.inviteId) toast.info(`Private room ID: ${data.inviteId}. Share this and the password with guests.`);
          toast.success(`Created “${roomName}”.`);
          setShowCreate(false);
          loadRooms();
        } else {
          toast.error("Couldn't create the room. Try again.");
        }
      })
      .catch(() => toast.error("Couldn't create the room. Try again."));
  };

  const joinPrivateRoom = (inviteId, password) => {
    fetch(`${API_URL}/api/rooms/join-private`, { method: "POST", headers: authHeaders, body: JSON.stringify({ inviteId, password }) })
      .then(async (r) => ({ ok: r.ok, data: await r.json() }))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error);
        setShowJoinPrivate(false);
        loadRooms();
        enterRoom(data.room.name);
        toast.success(`Joined ${data.room.name}.`);
      }).catch((error) => toast.error(error.message || "Couldn't join that room."));
  };

  const activeRoom = rooms.find((r) => r.name === currentRoom);

  const sidebarProps = {
    rooms, currentRoom, joinRoom, user, onLogout, token, onProfileChange,
    createPublicRoom: () => { setCreatePrivate(false); setShowCreate(true); setDrawerOpen(false); },
    createPrivateRoom: () => { setCreatePrivate(true); setShowCreate(true); setDrawerOpen(false); },
    joinPrivateRoom: () => { setShowJoinPrivate(true); setDrawerOpen(false); },
  };

  return (
    <div className="h-app flex bg-fog-50 text-ink-900 dark:bg-ink-900 dark:text-fog-100">
      {/* desktop sidebar */}
      <div className="hidden w-72 shrink-0 border-r border-fog-200 dark:border-ink-700 md:block lg:w-80">
        <Sidebar {...sidebarProps} />
      </div>

      {/* mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Rooms">
          <div className="absolute inset-0 animate-fade bg-ink-950/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm animate-slideIn shadow-2xl">
            <Sidebar {...sidebarProps} mobile onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-fog-200 bg-white/80 px-3 py-3 backdrop-blur dark:border-ink-700 dark:bg-ink-800/80 sm:px-6 safe-t">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open rooms"
            className="grid h-11 w-11 place-items-center rounded-full hover:bg-fog-100 dark:hover:bg-ink-700 md:hidden"
          >
            <FiMenu size={22} />
          </button>

          <div className="min-w-0 flex-1">
            {currentRoom ? (
              <div className="flex items-center gap-2">
                {activeRoom?.isPrivate ? <FiLock className="text-ember-500" size={18} /> : <FiHash className="text-iris-500" size={18} />}
                <h1 className="truncate font-display text-xl font-bold tracking-tight">{currentRoom}</h1>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:hidden">
                <img src={logo} alt="" width={24} height={24} className="rounded-md" />
                <span className="font-display text-xl font-bold">Whisper</span>
              </div>
            )}
          </div>

          {currentRoom && (
            <button
              onClick={leaveRoom}
              className="flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-ink-600 transition hover:bg-red-500/10 hover:text-red-500 dark:text-fog-300"
            >
              <FiLogOut size={16} />
              <span className="hidden sm:inline">Leave room</span>
            </button>
          )}
          <button
            onClick={toggleTheme}
            aria-label={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
            className="grid h-11 w-11 place-items-center rounded-full bg-fog-100 text-ink-700 transition hover:bg-fog-200 dark:bg-ink-700 dark:text-fog-200 dark:hover:bg-ink-600"
          >
            {isDarkTheme ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </header>

        {currentRoom ? (
          <>
            <Messages messages={messages} user={name} currentRoom={currentRoom} loading={loadingMessages} />
            <InputBox user={name} currentRoom={currentRoom} setMessages={setMessages} onLeave={leaveRoom} />
          </>
        ) : (
          <div className="aurora grid flex-1 place-items-center overflow-y-auto px-6 text-center">
            <div className="max-w-md animate-pop py-10">
              <img src={logo} alt="" width={72} height={72} className="mx-auto mb-6 animate-drift rounded-3xl" />
              <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Hey {displayName}, pick a room.
              </h2>
              <p className="mt-3 text-ink-600/80 dark:text-fog-300/80">
                Public rooms are open to everyone. Join a private room with its ID and password.
              </p>
              <button
                onClick={() => setDrawerOpen(true)}
                className="mt-7 rounded-xl bg-iris-600 px-6 py-3 font-semibold text-white shadow-lg shadow-iris-600/25 transition hover:bg-iris-500 active:scale-[.98] md:hidden"
              >
                Browse rooms
              </button>
              {rooms.length > 0 && (
                <p className="mt-7 hidden text-sm text-ink-600/60 dark:text-fog-300/50 md:block">
                  {rooms.length} room{rooms.length === 1 ? "" : "s"} available in the sidebar
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {showCreate && (
        <CreatePrivateRoomModal createPrivateRoom={createPrivateRoom} defaultPrivate={createPrivate} onClose={() => setShowCreate(false)} />
      )}
      {showJoinPrivate && <JoinPrivateRoomModal onJoin={joinPrivateRoom} onClose={() => setShowJoinPrivate(false)} />}
    </div>
  );
}

Chat.propTypes = {
  user: PropTypes.object,
  token: PropTypes.string,
  onProfileChange: PropTypes.func,
  isDarkTheme: PropTypes.bool,
  toggleTheme: PropTypes.func,
  onLogout: PropTypes.func,
};

export default Chat;
