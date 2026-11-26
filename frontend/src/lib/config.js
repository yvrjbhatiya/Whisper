export const API_URL =
  import.meta.env.VITE_API_URL || "https://whisper-593j.onrender.com";

const PALETTE = ["#6f7dff", "#ff8f5e", "#34c3a0", "#e667b5", "#e6b422", "#4cb4ff", "#a07bff"];

// Stable colour per username, so people are easy to tell apart.
export function colorFor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export const initials = (name = "") => name.trim().slice(0, 2).toUpperCase() || "?";

export function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function dayLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
}
