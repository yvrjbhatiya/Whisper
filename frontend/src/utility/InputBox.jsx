import { useEffect, useRef, useState } from "react";
import { FiSend, FiCheck, FiEdit2, FiX } from "react-icons/fi";
import socket from "../socket";
import { notify } from "../lib/notify";

function InputBox({ currentRoom, onLeave, editing, onCancelEdit, onSubmitEdit }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

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
          className={`
            relative z-10 flex items-end gap-2 rounded-[26px] border bg-white p-1.5 pl-4
            shadow-[0_10px_34px_-12px_rgba(15,23,42,0.25)]
            transition-all duration-300
            focus-within:border-iris-500 focus-within:ring-4 focus-within:ring-iris-500/15
            focus-within:shadow-[0_14px_40px_-12px_rgba(62,73,166,0.45)]
            dark:bg-ink-950 dark:focus-within:ring-iris-500/20
            ${editing ? "border-iris-500" : "border-fog-200 hover:border-fog-300 dark:border-ink-600 dark:hover:border-ink-500"}
          `}
        >
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

        {/* Keyboard hint (desktop only) */}
        <p className="mt-2 hidden text-center text-[11px] text-ink-600/55 dark:text-fog-300/50 sm:block">
          <kbd className="font-sans font-semibold">Enter</kbd> to {editing ? "save" : "send"} ·{" "}
          <kbd className="font-sans font-semibold">Shift + Enter</kbd> for a new line
          {editing && (
            <>
              {" "}· <kbd className="font-sans font-semibold">Esc</kbd> to cancel
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default InputBox;