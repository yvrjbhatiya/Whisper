import { useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import socket from "../socket";

function InputBox({ currentRoom, onLeave }) {
  const [message, setMessage] = useState("");
  const ref = useRef(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  const send = () => {
    const text = message.trim();
    if (!text) return;
    if (text === "/leave") {
      setMessage("");
      onLeave();
      return;
    }
    socket.emit("sendMessage", { message: { text, room: currentRoom } });
    setMessage("");
    requestAnimationFrame(() => {
      resize();
      ref.current?.focus();
    });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const hasText = message.trim().length > 0;

  return (
    <div className="px-3 pb-3 pt-2 sm:px-6 sm:pb-5 safe-b">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-fog-200 bg-white p-1.5 pl-4 shadow-lg shadow-ink-900/5 transition focus-within:border-iris-500 focus-within:ring-4 focus-within:ring-iris-500/15 dark:border-ink-600 dark:bg-ink-800">
        <textarea
          ref={ref}
          rows={1}
          value={message}
          onChange={(e) => { setMessage(e.target.value); resize(); }}
          onKeyDown={onKeyDown}
          placeholder={`Message #${currentRoom}`}
          aria-label="Message"
          className="max-h-36 flex-1 resize-none self-center bg-transparent py-2.5 text-base outline-none placeholder:text-ink-600/40 dark:placeholder:text-fog-300/40"
        />
        <button
          onClick={send}
          disabled={!hasText}
          aria-label="Send message"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-iris-600 text-white shadow-md shadow-iris-600/30 transition hover:bg-iris-500 active:scale-95 disabled:bg-fog-200 disabled:text-ink-600/40 disabled:shadow-none dark:disabled:bg-ink-700 dark:disabled:text-fog-300/40"
        >
          <FiSend size={18} />
        </button>
      </div>
    </div>
  );
}

export default InputBox;
