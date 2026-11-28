import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { apiFetch } from "../lib/api";
import { getAvatar } from "../lib/avatars";
import Avatar from "./Avatar";

// What other people see when they click a user: avatar, name, username, bio.
// (The server never sends email on this route.)
function ProfileModal({ userId, token, cached, onClose }) {
  const [profile, setProfile] = useState(cached || null);
  const [error, setError] = useState("");

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError("");
    apiFetch(`/api/users/profile/${encodeURIComponent(userId)}`, { token })
      .then((data) => !cancelled && setProfile(data.profile))
      .catch((e) => !cancelled && setError(e.message || "Couldn't load this profile."));
    return () => {
      cancelled = true;
    };
  }, [userId, token, attempt]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const picked = getAvatar(profile?.avatar);
  const name = profile?.displayName || profile?.username || "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 backdrop-blur-sm animate-fade sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="User profile"
    >
      <div className="relative w-full max-w-sm animate-pop overflow-hidden rounded-t-3xl border border-fog-300 bg-white shadow-2xl dark:border-ink-600 dark:bg-ink-950 sm:rounded-3xl">
        <div
          className="h-28"
          style={{ background: `linear-gradient(135deg, ${picked?.bg || "#7487ff"}, #3e49a6)` }}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/35 text-white transition hover:bg-black/55"
        >
          <FiX size={18} />
        </button>

        <div className="px-6 pb-7 text-center">
          {profile ? (
            <>
              <Avatar
                name={profile.username}
                avatar={profile.avatar}
                size={96}
                className="-mt-12 ring-4 ring-white dark:ring-ink-950"
              />
              <h2 className="mt-3 break-words font-display text-2xl font-extrabold text-ink-900 dark:text-white">{name}</h2>
              <p className="text-sm font-semibold text-iris-600 dark:text-iris-300">@{profile.username}</p>

              <div className="mt-5 rounded-2xl bg-fog-100 px-4 py-3 text-left dark:bg-ink-900">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-600/75 dark:text-fog-300/75">Bio</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-900 dark:text-fog-100">
                  {profile.bio || <span className="italic text-ink-600/70 dark:text-fog-300/70">No bio yet.</span>}
                </p>
              </div>
            </>
          ) : (
            <div className="py-10 text-sm text-ink-600/80 dark:text-fog-300/80">
              {error ? (
                <>
                  <p role="alert" className="font-semibold text-red-600 dark:text-red-400">{error}</p>
                  <button
                    type="button"
                    onClick={() => setAttempt((n) => n + 1)}
                    className="mt-4 rounded-xl bg-iris-600 px-4 py-2 font-semibold text-white transition hover:bg-iris-500"
                  >
                    Try again
                  </button>
                </>
              ) : (
                "Loading profile…"
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;