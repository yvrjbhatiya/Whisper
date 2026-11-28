import { memo } from "react";
import { getAvatar } from "../lib/avatars";

// Shows the picked avatar. Until one is known (still loading, or never chosen)
// it shows a neutral silhouette instead of initials.
function Avatar({ avatar, size = 32, className = "" }) {
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
      className={`inline-block shrink-0 select-none overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size, background: "#c9cfe6" }}
    >
      <svg viewBox="0 0 64 64" width="100%" height="100%">
        <circle cx="32" cy="25" r="11" fill="#fff" opacity=".9" />
        <path d="M10 64 Q10 42 32 42 Q54 42 54 64Z" fill="#fff" opacity=".9" />
      </svg>
    </span>
  );
}

// memo: skip redrawing the SVG unless the avatar or size actually changes.
export default memo(Avatar);