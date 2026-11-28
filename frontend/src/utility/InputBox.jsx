import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { FiSend, FiCheck, FiEdit2, FiX, FiSmile } from "react-icons/fi";
import socket from "../socket";
import { notify } from "../lib/notify";

// Loaded only when the emoji button is first clicked, so it doesn't slow down page load.
const EmojiPicker = lazy(() => import("emoji-picker-react"));

function InputBox({ currentRoom, onLeave, editing, onCancelEdit, onSubmitEdit }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [pickerTheme, setPickerTheme] = useState("light");
  const composerRef = useRef(null);

  const ref = useRef(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  const resize = () => {
    const el = ref.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const saveCursor = (e) => {
    selectionRef.current = {
      start: e.target.selectionStart,
      end: e.target.selectionEnd,
    };
  };

  const toggleEmoji = () => {
    // Match the app's current light/dark theme at the moment the panel opens.
    setPickerTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    setShowEmoji((open) => !open);
  };

  // Insert the chosen emoji at the cursor (or replace the selected text).
  const insertEmoji = ({ emoji }) => {
    const el = ref.current;
    const start = el ? el.selectionStart : message.length;
    const end = el ? el.selectionEnd : message.length;
    const next = message.slice(0, start) + emoji + message.slice(end);
    if (next.length > 2000) return;

    setMessage(next);
    const caret = start + emoji.length;
    selectionRef.current = { start: caret, end: caret };

    requestAnimationFrame(() => {
      const box = ref.current;
      if (!box) return;
      resize();
      // Don't pop the phone keyboard over the panel; on desktop keep typing focus.
      if (!window.matchMedia("(pointer: coarse)").matches) box.focus();
      box.setSelectionRange(caret, caret);
    });
  };

  // Close the panel on outside click or Esc.
  useEffect(() => {
    if (!showEmoji) return undefined;
    const onPointerDown = (e) => {
      if (composerRef.current && !composerRef.current.contains(e.target)) setShowEmoji(false);
    };
    const onEsc = (e) => e.key === "Escape" && setShowEmoji(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [showEmoji]);

  // Entering edit mode: put the original text in the box (like WhatsApp).
  useEffect(() => {
    if (!editing) return;
    setMessage(editing.text);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      resize();
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }, [editing]);

  const cancelEdit = () => {
    setMessage("");
    if (ref.current) ref.current.style.height = "auto";
    onCancelEdit?.();
  };

  const send = () => {
    const text = message.trim();

    if (!text || sending) return;

    if (editing) {
      if (text !== editing.text) onSubmitEdit?.(editing._id, text);
      cancelEdit();
      return;
    }

    if (text === "/leave") {
      setMessage("");
      selectionRef.current = { start: 0, end: 0 };

      if (ref.current) ref.current.style.height = "auto";

      onLeave?.();
      return;
    }

    if (!socket.connected) {
      notify.error("Can't send – you're not connected. Your message is still here, try again in a moment.", { toastId: "send-offline" });
      return;
    }

    socket.emit("sendMessage", {
      message: {
        text,
        room: currentRoom,
      },
    });

    setMessage("");
    setShowEmoji(false);
    selectionRef.current = { start: 0, end: 0 };
    setSending(true);

    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.focus();
    }

    requestAnimationFrame(() => {
      resize();
      setSending(false);
    });
  };

  const onKeyDown = (e) => {
    saveCursor(e);

    if (e.key === "Escape" && editing) {
      cancelEdit();
      return;
    }

    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing
    ) {
      e.preventDefault();
      send();
    }
  };

  const hasText = message.trim().length > 0;
  const nearLimit = message.length > 1600;

  return (
    <div className="safe-b px-3 pb-3 pt-2 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-3xl">
        {/* Edit bar: tucks in behind the composer like a tab */}
        {editing && (
          <div className="mx-3 flex animate-pop items-center gap-3 rounded-t-2xl border border-b-0 border-iris-600/25 bg-iris-600/10 px-4 pb-4 pt-2.5 backdrop-blur dark:border-iris-400/25 dark:bg-iris-400/10">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-iris-600 text-white">
              <FiEdit2 size={13} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-iris-600 dark:text-iris-300">Editing message</p>
              <p className="truncate text-[13px] text-ink-700 dark:text-fog-200">{editing.text}</p>
            </div>
            <button
              type="button"
              onClick={cancelEdit}
              aria-label="Cancel editing"
              title="Cancel (Esc)"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-600/80 transition hover:bg-iris-600/15 active:scale-90 dark:text-fog-300"
            >
              <FiX size={15} />
            </button>
          </div>
        )}

        {/* Composer */}
        <div
          ref={composerRef}
          className={`
            relative z-10 flex items-end gap-1 rounded-[26px] border bg-white p-1.5 pl-1.5
            shadow-[0_10px_34px_-12px_rgba(15,23,42,0.25)]
            transition-all duration-300
            focus-within:border-iris-500 focus-within:ring-4 focus-within:ring-iris-500/15
            focus-within:shadow-[0_14px_40px_-12px_rgba(62,73,166,0.45)]
            dark:bg-ink-950 dark:focus-within:ring-iris-500/20
            ${editing ? "border-iris-500" : "border-fog-200 hover:border-fog-300 dark:border-ink-600 dark:hover:border-ink-500"}
          `}
        >
          {/* Emoji button + panel */}
          <button
            type="button"
            onClick={toggleEmoji}
            aria-label="Add emoji"
            aria-expanded={showEmoji}
            title="Emoji"
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors duration-200 active:scale-90 ${
              showEmoji
                ? "bg-iris-600/15 text-iris-600 dark:text-iris-300"
                : "text-ink-600/70 hover:bg-fog-100 hover:text-iris-600 dark:text-fog-300/80 dark:hover:bg-ink-700 dark:hover:text-iris-300"
            }`}
          >
            <FiSmile size={21} />
          </button>

          {showEmoji && (
            <div className="absolute bottom-full left-0 z-20 mb-3 w-[min(350px,calc(100vw-1.5rem))] animate-pop overflow-hidden rounded-2xl shadow-2xl shadow-black/25">
              <Suspense
                fallback={
                  <div className="grid h-[380px] place-items-center rounded-2xl border border-fog-200 bg-white text-sm text-ink-600/70 dark:border-ink-600 dark:bg-ink-950 dark:text-fog-300/70">
                    Loading emojis…
                  </div>
                }
              >
                <EmojiPicker
                  onEmojiClick={insertEmoji}
                  theme={pickerTheme}
                  emojiStyle="native"
                  width="100%"
                  height={380}
                  lazyLoadEmojis
                  skinTonesDisabled
                  previewConfig={{ showPreview: false }}
                  searchPlaceholder="Search emoji"
                />
              </Suspense>
            </div>
          )}

          {/* Message Textarea */}
          <div className="min-w-0 flex-1 py-0.5">
            <textarea
              ref={ref}
              rows={1}
              maxLength={2000}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                saveCursor(e);
                resize();
              }}
              onSelect={saveCursor}
              onClick={saveCursor}
              onKeyUp={saveCursor}
              onKeyDown={onKeyDown}
              placeholder={editing ? "Edit your message…" : "Write something…"}
              aria-label="Write a message"
              className="
                block max-h-[140px] min-h-[40px] w-full
                resize-none overflow-y-auto bg-transparent
                py-2 text-[15px] leading-6
                text-ink-800 outline-none
                placeholder:text-ink-400
                dark:text-fog-100 dark:placeholder:text-fog-500
              "
            />
            {nearLimit && (
              <p
                className={`pb-1 text-right text-[11px] font-semibold ${
                  message.length >= 2000 ? "text-red-500" : "text-ink-600/70 dark:text-fog-300/70"
                }`}
              >
                {message.length}/2000
              </p>
            )}
          </div>

          {/* Send / Save button */}
          <button
            type="button"
            onClick={send}
            disabled={!hasText || sending}
            aria-label={editing ? "Save edited message" : "Send message"}
            title={editing ? "Save (Enter)" : "Send (Enter)"}
            className={`
              grid h-11 w-11 shrink-0 place-items-center rounded-full
              text-white transition-all duration-300
              disabled:cursor-not-allowed disabled:bg-fog-200 disabled:text-ink-400
              dark:disabled:bg-ink-700 dark:disabled:text-fog-500
              ${
                hasText
                  ? "scale-100 bg-gradient-to-br from-iris-500 to-iris-700 shadow-lg shadow-iris-600/35 hover:-translate-y-0.5 hover:shadow-xl active:scale-90"
                  : "scale-90"
              }
            `}
          >
            {editing ? <FiCheck size={20} strokeWidth={3} /> : <FiSend size={18} className="-ml-px mt-px" />}
          </button>
        </div>

        
      </div>
    </div>
  );
}

export default InputBox;