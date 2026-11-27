import { useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import socket from "../socket";

function InputBox({ currentRoom, onLeave }) {
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

  const send = () => {
    const text = message.trim();

    if (!text || sending) return;

    if (text === "/leave") {
      setMessage("");
      selectionRef.current = { start: 0, end: 0 };

      if (ref.current) ref.current.style.height = "auto";

      onLeave?.();
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

  return (
    <div className="safe-b px-3 pb-3 pt-2 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-3xl">
        <div
          className="
            relative flex items-end gap-2
            rounded-[24px] border border-fog-200
            bg-white p-2 pl-4
            shadow-[0_8px_30px_rgba(15,23,42,0.06)]
            transition-all duration-200
            hover:border-fog-300
            focus-within:border-iris-500
            focus-within:ring-4 focus-within:ring-iris-500/10
            dark:border-ink-600 dark:bg-ink-950
            dark:hover:border-ink-500
          "
        >
          {/* Message Textarea */}
          <div className="min-w-0 flex-1 py-1">
            <textarea
              ref={ref}
              rows={1}
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
              placeholder="Write something..."
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
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={send}
            disabled={!hasText || sending}
            aria-label="Send message"
            title="Send message"
            className="
              grid h-11 w-11 shrink-0 place-items-center
              rounded-full bg-gradient-to-br
              from-iris-500 to-iris-700
              text-white shadow-md shadow-iris-600/25
              transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-lg
              active:scale-90
              disabled:cursor-not-allowed
              disabled:bg-none disabled:bg-fog-200
              disabled:text-ink-400 disabled:shadow-none
              dark:disabled:bg-ink-700 dark:disabled:text-fog-500
            "
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputBox;
