import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import logo from "../images/logo.png";
import {
  FiMenu,
  FiSun,
  FiMoon,
  FiLock,
  FiHash,
  FiMessageCircle,
  FiLogOut,
  FiUser,
  FiChevronDown,
} from "react-icons/fi";
import { toast } from "react-toastify";
import socket from "../socket";
import { API_URL } from "../lib/config";
import Sidebar from "../utility/Sidebar";
import Messages from "../utility/Messages";
import InputBox from "../utility/InputBox";
import CreatePrivateRoomModal from "../utility/CreatePrivateRoomModal";
import JoinPrivateRoomModal from "../utility/JoinPrivateRoomModal";
import ProfilePage from "../utility/ProfilePage";
import DirectMessageModal from "../utility/DirectMessageModal";

const isDirectRoom = (room) =>
  Boolean(
    room?.isDirect ||
      room?.isDM ||
      room?.type === "direct" ||
      room?.type === "dm" ||
      room?.roomType === "direct",
  );

function Chat({
  user,
  token,
  onProfileChange,
  isDarkTheme,
  toggleTheme,
  onLogout,
}) {
  const username = user?.username || "";
  const displayName = user?.displayName || username || "there";

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createPrivate, setCreatePrivate] = useState(false);
  const [showJoinPrivate, setShowJoinPrivate] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDirectMessage, setShowDirectMessage] = useState(false);

  const roomRef = useRef("");
  const accountRef = useRef(null);
  roomRef.current = currentRoom;

  // Close the account dropdown when clicking outside it or pressing Escape.
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setDrawerOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Keep one listener for each socket event and only append messages for this room.
  useEffect(() => {
    const onMessage = (message) => {
      if (message.room && message.room !== roomRef.current) return;
      setMessages((previous) => [...previous, message]);
    };

    const onMessageUpdated = (message) => {
      setMessages((previous) =>
        previous.map((item) => (item._id === message._id ? message : item)),
      );
    };

    const onMessageDeleted = (message) => {
      setMessages((previous) =>
        previous.map((item) => (item._id === message._id ? message : item)),
      );
    };

    socket.on("message", onMessage);
    socket.on("messageUpdated", onMessageUpdated);
    socket.on("messageDeleted", onMessageDeleted);

    return () => {
      socket.off("message", onMessage);
      socket.off("messageUpdated", onMessageUpdated);
      socket.off("messageDeleted", onMessageDeleted);
    };
  }, []);

  useEffect(() => {
    if (!token) return undefined;

    socket.auth = { token };
    socket.connect();

    return () => socket.disconnect();
  }, [token]);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const loadRooms = useCallback(() => {
    fetch(`${API_URL}/api/rooms`, { headers: authHeaders })
      .then((response) => {
        if (!response.ok) throw new Error("Couldn't load rooms.");
        return response.json();
      })
      .then(setRooms)
      .catch(() => toast.error("Couldn't load rooms."));
  }, [token]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Load message history whenever the active room changes.
  useEffect(() => {
    if (!currentRoom) {
      setMessages([]);
      setLoadingMessages(false);
      return undefined;
    }

    let cancelled = false;
    setLoadingMessages(true);
    setMessages([]);

    fetch(
      `${API_URL}/api/messages/getMessages/${encodeURIComponent(currentRoom)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setMessages(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Couldn't load earlier messages.");
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentRoom, token]);

  const enterRoom = useCallback((roomName) => {
    if (!roomName) return;

    if (roomRef.current && roomRef.current !== roomName) {
      socket.emit("leaveRoom", roomRef.current);
    }

    socket.emit("joinRoom", roomName);
    setCurrentRoom(roomName);
    setDrawerOpen(false);
    setShowProfile(false);
  }, []);

  const joinRoom = (room) => {
    if (!room?.name) return;

    if (room.name === currentRoom) {
      setDrawerOpen(false);
      return;
    }

    enterRoom(room.name);
  };

  const leaveRoom = () => {
    if (currentRoom) socket.emit("leaveRoom", currentRoom);
    setCurrentRoom("");
    setMessages([]);
  };

  const createPrivateRoom = (roomName, isPrivate, password) => {
    fetch(`${API_URL}/api/rooms/createRoom`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ roomName, isPrivate, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          toast.error("Couldn't create the room. Try again.");
          return;
        }

        if (data.inviteId) {
          toast.info(
            `Private room ID: ${data.inviteId}. Share this and the password with guests.`,
          );
        }

        toast.success(`Created “${roomName}”.`);
        setShowCreate(false);
        loadRooms();
      })
      .catch(() => toast.error("Couldn't create the room. Try again."));
  };

  const joinPrivateRoomRequest = (inviteId, password) => {
    fetch(`${API_URL}/api/rooms/join-private`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ inviteId, password }),
    })
      .then(async (response) => ({
        ok: response.ok,
        data: await response.json(),
      }))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || "Couldn't join that room.");

        setShowJoinPrivate(false);
        loadRooms();
        enterRoom(data.room.name);
        toast.success(`Joined ${data.room.name}.`);
      })
      .catch((error) =>
        toast.error(error.message || "Couldn't join that room."),
      );
  };

  const startDirectMessage = (targetUsername) => {
    fetch(`${API_URL}/api/rooms/direct`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ username: targetUsername }),
    })
      .then(async (response) => ({
        ok: response.ok,
        data: await response.json(),
      }))
      .then(({ ok, data }) => {
        if (!ok) {
          throw new Error(data.error || "Couldn't start a direct message.");
        }

        setShowDirectMessage(false);
        loadRooms();
        enterRoom(data.room.name);
      })
      .catch((error) =>
        toast.error(error.message || "Couldn't start a direct message."),
      );
  };

  const deleteRoom = (room) => {
    if (
      !window.confirm(
        `Delete “${room.name}”? This permanently removes every message in it.`,
      )
    ) {
      return;
    }

    fetch(`${API_URL}/api/rooms/${encodeURIComponent(room.name)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => ({
        ok: response.ok,
        data: await response.json(),
      }))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || "Couldn't delete that room.");

        if (currentRoom === room.name) leaveRoom();
        loadRooms();
        toast.success(`Deleted ${room.name}.`);
      })
      .catch((error) =>
        toast.error(error.message || "Couldn't delete that room."),
      );
  };

  const editMessage = (messageId, text) =>
    socket.emit("editMessage", { messageId, text });

  const deleteMessage = (messageId) =>
    socket.emit("deleteMessage", { messageId });

  const activeRoom = rooms.find((room) => room.name === currentRoom);
  const activeRoomIsDirect = isDirectRoom(activeRoom);
  const activeRoomIsPrivate = Boolean(activeRoom?.isPrivate);

  const sidebarProps = {
    rooms,
    currentRoom,
    joinRoom,
    createPublicRoom: () => {
      setCreatePrivate(false);
      setShowCreate(true);
      setDrawerOpen(false);
    },
    createPrivateRoom: () => {
      setCreatePrivate(true);
      setShowCreate(true);
      setDrawerOpen(false);
    },
    joinPrivateRoom: () => {
      setShowJoinPrivate(true);
      setDrawerOpen(false);
    },
    startDirectMessage: () => {
      setShowDirectMessage(true);
      setDrawerOpen(false);
    },
    deleteRoom,
  };

  return (
    <div className="h-app flex min-h-0 overflow-hidden bg-fog-50 text-ink-900 dark:bg-ink-900 dark:text-fog-100">
      {/* Desktop sidebar */}
      <div className="hidden min-h-0 w-72 shrink-0 border-r border-fog-200 dark:border-ink-700 md:block lg:w-80">
        <Sidebar {...sidebarProps} />
      </div>

      {/* Mobile sidebar drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Rooms"
        >
          <button
            type="button"
            aria-label="Close rooms menu"
            className="absolute inset-0 h-full w-full animate-fade bg-ink-950/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="absolute inset-y-0 left-0 w-[88%] max-w-[360px] animate-slideIn shadow-2xl">
            <Sidebar
              {...sidebarProps}
              mobile
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="z-20 flex min-h-[72px] shrink-0 items-center gap-3 border-b border-fog-200 bg-white/85 p-4 backdrop-blur dark:border-ink-700 dark:bg-ink-800/85">
          {/* Mobile sidebar button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open rooms"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-fog-100 dark:hover:bg-ink-700 md:hidden"
          >
            <FiMenu size={21} />
          </button>

          {/* Active room title */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            {currentRoom ? (
              <>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fog-100 text-iris-600 dark:bg-ink-700 dark:text-iris-300">
                  {activeRoomIsDirect ? (
                    <FiMessageCircle size={18} />
                  ) : activeRoomIsPrivate ? (
                    <FiLock size={18} />
                  ) : (
                    <FiHash size={18} />
                  )}
                </span>

                <div className="min-w-0">
                  <h1 className="truncate font-display text-base font-bold tracking-tight sm:text-lg">
                    {activeRoom?.displayName || currentRoom}
                  </h1>

                  <p className="hidden text-[11px] text-ink-400 dark:text-fog-500 sm:block">
                    {activeRoomIsDirect
                      ? "Direct message"
                      : activeRoomIsPrivate
                        ? "Private room"
                        : "Public room"}
                  </p>
                </div>
              </>
            ) : (
              <div>
              </div>
            )}
          </div>

          {/* Leave room */}
          {currentRoom && (
            <button
              type="button"
              onClick={leaveRoom}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-2.5 text-sm font-semibold text-ink-500 transition hover:bg-red-500/10 hover:text-red-500 dark:text-fog-300 sm:px-4"
            >
              <FiLogOut size={16} />
              <span className="hidden sm:inline">Leave room</span>
            </button>
          )}

          {/* Theme toggle: fixed square with icon centered both ways */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              isDarkTheme ? "Switch to light theme" : "Switch to dark theme"
            }
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fog-100 p-0 text-ink-700 transition hover:bg-fog-200 dark:bg-ink-700 dark:text-fog-200 dark:hover:bg-ink-600"
          >
            {isDarkTheme ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Account menu */}
          <div
            className="relative flex h-10 shrink-0 items-center justify-center"
            ref={accountRef}
          >
            <button
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              aria-expanded={accountOpen}
              aria-label="Account menu"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-2.5 leading-none transition hover:bg-fog-100 dark:hover:bg-ink-700 sm:px-3"
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-iris-600 p-0 text-xs font-bold leading-none text-white">
                {(displayName || "U").charAt(0).toUpperCase()}
              </span>

              <span className="hidden max-w-28 truncate text-sm font-semibold sm:block">
                {displayName}
              </span>

              <FiChevronDown
                size={15}
                className={`shrink-0 text-ink-400 transition-transform ${
                  accountOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-fog-200 bg-white p-1.5 shadow-xl dark:border-ink-700 dark:bg-ink-800">
                <div className="border-b border-fog-100 px-3 py-2.5 dark:border-ink-700">
                  <p className="truncate text-sm font-semibold">
                    {displayName}
                  </p>

                  {username && (
                    <p className="truncate text-xs text-ink-400 dark:text-fog-500">
                      @{username}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(true);
                    setAccountOpen(false);
                    setDrawerOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-fog-100 dark:hover:bg-ink-700"
                >
                  <FiUser size={16} />
                  My profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-500/10"
                >
                  <FiLogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {showProfile ? (
            <ProfilePage
              user={user}
              token={token}
              onSave={onProfileChange}
              onBack={() => setShowProfile(false)}
            />
          ) : currentRoom ? (
            <>
              <Messages
                messages={messages}
                user={username}
                userId={user?.id}
                currentRoom={currentRoom}
                loading={loadingMessages}
                onEditMessage={editMessage}
                onDeleteMessage={deleteMessage}
              />
              <InputBox currentRoom={currentRoom} onLeave={leaveRoom} />
            </>
          ) : (
            <div className="aurora grid min-h-0 flex-1 place-items-center overflow-y-auto px-6 text-center">
              <div className="max-w-md animate-pop py-10">
                <img
                  src={logo}
                  alt=""
                  width={72}
                  height={72}
                  className="mx-auto mb-6 animate-drift rounded-3xl"
                />

                <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                  Hey {displayName}, let&apos;s whisper!
                </h2>

                <p className="mt-3 text-ink-600/80 dark:text-fog-300/80 italic">
                  Join a room or create your own to start chatting.
                </p>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="mt-7 rounded-xl bg-iris-600 px-6 py-3 font-semibold text-white shadow-lg shadow-iris-600/25 transition hover:bg-iris-500 active:scale-[.98] md:hidden"
                >
                  Browse rooms
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      {showCreate && (
        <CreatePrivateRoomModal
          createPrivateRoom={createPrivateRoom}
          defaultPrivate={createPrivate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {showJoinPrivate && (
        <JoinPrivateRoomModal
          onJoin={joinPrivateRoomRequest}
          onClose={() => setShowJoinPrivate(false)}
        />
      )}

      {showDirectMessage && (
        <DirectMessageModal
          onStart={startDirectMessage}
          onClose={() => setShowDirectMessage(false)}
        />
      )}
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
