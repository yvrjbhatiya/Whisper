import { colorFor, initials } from "../lib/config";
import { getAvatar } from "../lib/avatars";

// Shows the picked avatar; falls back to coloured initials until one is chosen.
function Avatar({ name, avatar, size = 32, className = "" }) {
  const picked = getAvatar(avatar);

  if (picked) {
    return (
      <span
        aria-hidden="true"
        className={`inline-block shrink-0 select-none overflow-hidden rounded-full ${className}`}
        style={{ width: size, height: size, background: picked.bg }}
      >
        <svg viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-label={picked.label}>
          {picked.art}
        </svg>
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 select-none place-items-center rounded-full font-display font-bold text-white ${className}`}
      style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  );
}

export default Avatar;
