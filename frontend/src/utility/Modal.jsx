import { useEffect } from "react";

function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/60 p-0 backdrop-blur-sm animate-fade sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-md animate-pop rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-ink-800 sm:rounded-3xl">
        <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-600/70 dark:text-fog-300/70">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export const fieldClass =
  "w-full rounded-xl border border-fog-300 bg-fog-50 px-4 py-3 text-base outline-none transition placeholder:text-ink-600/40 focus:border-iris-500 focus:ring-4 focus:ring-iris-500/15 dark:border-ink-600 dark:bg-ink-900 dark:placeholder:text-fog-300/30";

export const primaryBtn =
  "rounded-xl bg-iris-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-iris-600/25 transition hover:bg-iris-500 active:scale-[.98] disabled:opacity-50";

export const ghostBtn =
  "rounded-xl px-5 py-2.5 font-semibold text-ink-700 transition hover:bg-fog-100 dark:text-fog-200 dark:hover:bg-ink-700";

export default Modal;
