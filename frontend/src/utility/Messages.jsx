import { useEffect, useRef, useState } from "react";
import { FiArrowDown, FiHash, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import Avatar from "./Avatar";
import { colorFor, formatTime, dayLabel } from "../lib/config";

const hasOther = (list, senderId) =>
  (list || []).some((id) => String(id) !== String(senderId));

function Ticks({ msg }) {
  const read = hasOther(msg.readBy, msg.userId);
  const delivered = read || hasOther(msg.deliveredTo, msg.userId);
  const label = read ? "Read" : delivered ? "Delivered" : "Sent";
  const color = read ? "text-cyan-300" : "text-white/80";

  return (
    <span
      className="inline-flex shrink-0 items-center"
      aria-label={label}
      title={label}
    >
      <FiCheck size={15} strokeWidth={3} className={color} />
      {delivered && (
        <FiCheck size={15} strokeWidth={3} className={`-ml-2.5 ${color}`} />
      )}
    </span>
  );
}

function Messages({
  messages = [],
  user,
  userId,
  peerId,
  currentRoom,
  loading,
  onEditMessage,
  onDeleteMessage,
  profiles = {},
  onOpenProfile,
}) {
  const boxRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState("");

  const scrollToEnd = (smooth = true) => {
    const el = boxRef.current;

    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  const onScroll = () => {
    const el = boxRef.current;
    if (!el) return;

    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 120);
  };

  useEffect(() => {
    setSelected(null);
    setDraft("");
  }, [currentRoom]);

  useEffect(() => {
    scrollToEnd(false);
  }, [currentRoom, loading]);

  useEffect(() => {
    const last = messages[messages.length - 1];

    if (atBottom || last?.user === user) {
      scrollToEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  let prevDay = null;

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#f4f4f4] dark:bg-[#0b0e1b]">
      {/* Messages scroll area */}
      <div
        ref={boxRef}
        onScroll={onScroll}
        className="scroll-thin min-h-0 w-full flex-1 overflow-y-auto px-3 py-5 sm:px-6 sm:py-7"
      >
        {/* Centered message container */}
        <div className="mx-auto w-full max-w-3xl">
          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-6 py-4" aria-busy="true">
              {[65, 42, 75, 50].map((w, i) => (
                <div
                  key={i}
                  className={`flex w-full ${i % 2 ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="h-14 animate-pulse rounded-2xl bg-fog-200 dark:bg-[#2a3252]"
                    style={{ width: `${w}%`, maxWidth: 340 }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && messages.length === 0 && (
            <div className="flex min-h-[55vh] w-full flex-col items-center justify-center px-4 text-center animate-fade">
              <div className="mb-5 grid h-20 w-20 place-items-center rounded-3xl border border-iris-500/10 bg-iris-500/10 text-iris-500 shadow-sm">
                <FiHash size={32} />
              </div>

              <h3 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
                Welcome to #{currentRoom}
              </h3>

              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-600/75 dark:text-fog-300/80">
                This is your space. Start a conversation and make it yours.
              </p>

              <div className="mt-5 rounded-full border border-fog-200 bg-white px-4 py-2 text-xs font-medium text-ink-600/75 shadow-sm dark:border-ink-700 dark:bg-[#1a2038] dark:text-fog-300/80">
                Say hello 👋
              </div>
            </div>
          )}

          {/* Message list */}
          {!loading &&
            messages.map((msg, i) => {
              const mine =
                (msg.userId && String(msg.userId) === String(userId)) ||
                msg.user === user;

              const prev = messages[i - 1];
              const currentDay = dayLabel(msg.timestamp);
              const showDay = currentDay !== prevDay;

              prevDay = currentDay;

              const profile = profiles[String(msg.userId)];
              const senderName = profile?.displayName || msg.user;
              const canOpenProfile = Boolean(msg.userId && onOpenProfile);
              const openProfile = () => canOpenProfile && onOpenProfile(msg.userId);

              const grouped =
                !showDay &&
                prev &&
                prev.user === msg.user &&
                msg.timestamp - prev.timestamp < 5 * 60 * 1000;

              return (
                <div
                  key={msg._id || `${msg.timestamp}-${i}`}
                  className="w-full"
                >
                  {/* Date separator */}
                  {showDay && (
                    <div className="my-7 flex w-full items-center gap-3 sm:gap-4">
                      <span className="h-px flex-1 bg-fog-200 dark:bg-[#3a4468]" />

                      <span className="shrink-0 rounded-full border border-fog-200 bg-white px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ink-600/75 shadow-sm dark:border-[#3a4468] dark:bg-[#1a2038] dark:text-fog-300/80">
                        {currentDay}
                      </span>

                      <span className="h-px flex-1 bg-fog-200 dark:bg-[#3a4468]" />
                    </div>
                  )}

                  {/* Message row */}
                  <div
                    className={`group flex w-full items-end gap-2 sm:gap-3 ${
                      mine ? "justify-end" : "justify-start"
                    } ${grouped ? "mt-1" : "mt-5"}`}
                  >
                    {/* Incoming avatar */}
                    {!mine && (
                      <div className="w-8 shrink-0">
                        {!grouped && (
                          <button
                            type="button"
                            onClick={openProfile}
                            disabled={!canOpenProfile}
                            aria-label={`View ${senderName}'s profile`}
                            className="rounded-full transition enabled:hover:scale-105 enabled:hover:ring-2 enabled:hover:ring-iris-500 enabled:active:scale-95 disabled:cursor-default"
                          >
                            <Avatar name={profile?.username || msg.user} avatar={profile?.avatar} size={32} />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Message content */}
                    <div
                      className={`flex min-w-0 max-w-[calc(100%-40px)] flex-col sm:max-w-[75%] ${
                        mine ? "items-end" : "items-start"
                      }`}
                    >
                      
                      {/* Deleted message */}
                      {msg.deleted ? (
                        <div
                          className={`flex max-w-full items-center gap-2 rounded-2xl border border-dashed px-3.5 py-2.5 text-sm ${
                            mine
                              ? "rounded-br-md border-white/40 bg-[#3e49a6] text-white/90"
                              : "rounded-bl-md border-fog-300 bg-fog-100/80 text-ink-600/75 dark:border-[#47527a] dark:bg-[#1f2742] dark:text-fog-300/80"
                          }`}
                        >
                          <FiTrash2 size={14} className="shrink-0 opacity-70" />

                          <span className="italic">
                            This message was deleted
                          </span>

                          <span
                            className={`ml-1 inline-flex translate-y-[1px] whitespace-nowrap text-[11px] leading-none ${
                              mine
                                ? "text-white/80"
                                : "text-ink-600/75 dark:text-fog-300/80"
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      ) : (
                        <>
                          {/* Normal message bubble */}
                          <button
                            type="button"
                            onClick={() => {
                              if (mine) {
                                setSelected(msg);
                                setDraft(msg.text);
                              }
                            }}
                            title={
                              mine ? "Click to edit" : formatTime(msg.timestamp)
                            }
                            className={`animate-pop relative max-w-full whitespace-pre-wrap break-words px-3.5 py-2.5 text-left text-[15px] leading-[1.5] transition-all duration-200 sm:text-[15px] ${
                              mine
                                ? "rounded-2xl rounded-br-md bg-[#3e49a6] text-white shadow-md shadow-[#3e49a6]/25"
                                : "rounded-2xl rounded-bl-md border border-fog-200/80 bg-white text-ink-900 shadow-sm hover:shadow-md dark:border-[#3a4468] dark:bg-[#1a2038] dark:text-fog-100"
                            } ${
                              mine
                                ? "cursor-pointer active:scale-[0.99]"
                                : "cursor-default"
                            }`}
                          >
                            <span>{msg.text}</span>

                            <span
                              className={`ml-2 inline-flex translate-y-[2px] items-center gap-1 whitespace-nowrap text-[11px] leading-none ${
                                mine
                                  ? "text-white/85"
                                  : "text-ink-600/75 dark:text-fog-300/80"
                              }`}
                            >
                              {msg.edited && "edited · "}
                              {formatTime(msg.timestamp)}
                              {mine && <Ticks msg={msg} />}
                            </span>
                          </button>

                          {/* Edit hint */}
                          {mine && (
                            <span className="mt-1 mr-1 text-[10px] text-ink-600/0 transition-colors group-hover:text-ink-600/75 dark:group-hover:text-fog-300/80">
                              Click message to edit
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Jump to latest */}
      {!atBottom && (
        <button
          type="button"
          onClick={() => scrollToEnd()}
          aria-label="Jump to latest message"
          className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 animate-pop items-center gap-2 rounded-full border border-fog-200 bg-white px-5 py-2.5 text-xs font-bold text-ink-700 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-[#3a4468] dark:bg-[#1a2038] dark:text-white"
        >
          <FiArrowDown size={15} />
          New messages
        </button>
      )}

      {/* Edit message modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Message options"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <div className="w-full max-w-md animate-pop rounded-3xl border border-fog-200 bg-white p-5 shadow-2xl dark:border-[#3a4468] dark:bg-[#1a2038] sm:p-6">
            {/* Modal header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-ink-900 dark:text-white">
                  Edit message
                </h3>

                <p className="mt-1 text-xs text-ink-600/75 dark:text-fog-300/80">
                  Make changes to your message
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-xl text-ink-600/75 transition hover:bg-fog-100 dark:text-fog-300 dark:hover:bg-[#3a4468]"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Text editor */}
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write your message..."
              className="min-h-28 w-full resize-none rounded-2xl border border-fog-200 bg-[#f8f9fd] p-4 text-sm leading-relaxed text-ink-900 outline-none transition placeholder:text-ink-600/55 focus:border-iris-500 focus:ring-4 focus:ring-iris-500/10 dark:border-[#3a4468] dark:bg-[#0b0e1b] dark:text-white"
            />

            {/* Modal actions */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onDeleteMessage(selected._id);
                  setSelected(null);
                }}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
              >
                <FiTrash2 size={16} />
                Delete
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-600 transition hover:bg-fog-100 dark:text-fog-300 dark:hover:bg-[#3a4468]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!draft.trim() || draft.trim() === selected.text}
                  onClick={() => {
                    onEditMessage(selected._id, draft);
                    setSelected(null);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-iris-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-iris-600/20 transition hover:bg-iris-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiCheck size={16} />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;