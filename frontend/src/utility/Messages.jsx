import { useEffect, useRef, useState } from "react";
import { FiArrowDown, FiHash } from "react-icons/fi";
import Avatar from "./Avatar";
import { colorFor, formatTime, dayLabel } from "../lib/config";

function Messages({ messages, user, currentRoom, loading }) {
  const boxRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);

  const scrollToEnd = (smooth = true) => {
    const el = boxRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  const onScroll = () => {
    const el = boxRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 120);
  };

  // jump instantly when entering a room
  useEffect(() => { scrollToEnd(false); }, [currentRoom, loading]);

  // follow new messages only when already near the bottom or when I sent it
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (atBottom || last?.user === user) scrollToEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  let prevDay = null;

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={boxRef} onScroll={onScroll} className="scroll-thin h-full overflow-y-auto px-3 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          {loading && (
            <div className="space-y-4 py-6" aria-busy="true">
              {[60, 40, 75].map((w, i) => (
                <div key={i} className={`flex ${i % 2 ? "justify-end" : ""}`}>
                  <div className="h-12 animate-pulse rounded-2xl bg-fog-200 dark:bg-ink-700" style={{ width: `${w}%`, maxWidth: 340 }} />
                </div>
              ))}
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="grid place-items-center py-20 text-center animate-fade">
              <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-iris-500/10 text-iris-500">
                <FiHash size={28} />
              </span>
              <h3 className="font-display text-2xl font-bold">This is the start of #{currentRoom}</h3>
              <p className="mt-1 text-ink-600/70 dark:text-fog-300/70">Send the first message to get things going.</p>
            </div>
          )}

          {messages.map((msg, i) => {
            const mine = msg.user === user;
            const prev = messages[i - 1];
            const showDay = dayLabel(msg.timestamp) !== prevDay;
            prevDay = dayLabel(msg.timestamp);
            const grouped =
              !showDay && prev && prev.user === msg.user && msg.timestamp - prev.timestamp < 5 * 60 * 1000;

            return (
              <div key={msg._id || `${msg.timestamp}-${i}`}>
                {showDay && (
                  <div className="my-5 flex items-center gap-3 text-xs font-medium text-ink-600/60 dark:text-fog-300/50">
                    <span className="h-px flex-1 bg-fog-200 dark:bg-ink-700" />
                    {dayLabel(msg.timestamp)}
                    <span className="h-px flex-1 bg-fog-200 dark:bg-ink-700" />
                  </div>
                )}
                <div className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""} ${grouped ? "mt-1" : "mt-4"}`}>
                  <div className="w-8 shrink-0">{!mine && !grouped && <Avatar name={msg.user} size={32} />}</div>
                  <div className={`flex max-w-[82%] flex-col sm:max-w-[70%] ${mine ? "items-end" : "items-start"}`}>
                    {!mine && !grouped && (
                      <span className="mb-1 ml-1 text-xs font-semibold" style={{ color: colorFor(msg.user) }}>
                        {msg.user}
                      </span>
                    )}
                    <div
                      title={formatTime(msg.timestamp)}
                      className={`animate-pop whitespace-pre-wrap break-words px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ${
                        mine
                          ? "rounded-2xl rounded-br-md bg-iris-600 text-white"
                          : "rounded-2xl rounded-bl-md bg-white text-ink-900 dark:bg-ink-700 dark:text-fog-100"
                      }`}
                    >
                      {msg.text}
                      <span className={`ml-3 inline-block translate-y-[3px] text-[11px] ${mine ? "text-white/70" : "text-ink-600/50 dark:text-fog-300/50"}`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!atBottom && (
        <button
          onClick={() => scrollToEnd()}
          aria-label="Jump to latest message"
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 animate-pop items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-lg ring-1 ring-fog-200 transition hover:bg-fog-50 dark:bg-ink-700 dark:ring-ink-600 dark:hover:bg-ink-600"
        >
          <FiArrowDown size={16} /> Latest
        </button>
      )}
    </div>
  );
}

export default Messages;
