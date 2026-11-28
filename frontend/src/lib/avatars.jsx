// 12 built-in avatars, drawn as inline SVG (no image files to host).
// The ids must match backend/config/avatars.js.
const INK = "#1b1f3b";

export const AVATARS = [
  {
    id: "fox",
    label: "Fox",
    bg: "#ffb36b",
    art: (
      <>
        <polygon points="12,10 27,26 11,32" fill="#e8590c" />
        <polygon points="52,10 53,32 37,26" fill="#e8590c" />
        <path d="M10 34 Q10 22 32 22 Q54 22 54 34 Q54 54 32 58 Q10 54 10 34Z" fill="#f58a2d" />
        <path d="M15 40 Q32 34 49 40 Q45 57 32 59 Q19 57 15 40Z" fill="#fff" />
        <circle cx="23" cy="37" r="2.8" fill={INK} />
        <circle cx="41" cy="37" r="2.8" fill={INK} />
        <ellipse cx="32" cy="47" rx="3.4" ry="2.4" fill={INK} />
      </>
    ),
  },
  {
    id: "cat",
    label: "Cat",
    bg: "#8fd3ff",
    art: (
      <>
        <polygon points="12,12 26,25 11,33" fill="#5a6385" />
        <polygon points="52,12 53,33 38,25" fill="#5a6385" />
        <polygon points="15,18 23,25 15,29" fill="#ff9db8" />
        <polygon points="49,18 49,29 41,25" fill="#ff9db8" />
        <ellipse cx="32" cy="39" rx="21" ry="18" fill="#6f7aa0" />
        <ellipse cx="23" cy="36" rx="4.5" ry="5" fill="#fff" />
        <ellipse cx="41" cy="36" rx="4.5" ry="5" fill="#fff" />
        <ellipse cx="23" cy="36.5" rx="2" ry="4" fill={INK} />
        <ellipse cx="41" cy="36.5" rx="2" ry="4" fill={INK} />
        <polygon points="29,45 35,45 32,49" fill="#ff8aa8" />
        <path d="M32 49 Q28 53 24 51 M32 49 Q36 53 40 51" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M5 42 L16 44 M5 49 L16 48 M59 42 L48 44 M59 49 L48 48" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "panda",
    label: "Panda",
    bg: "#a8ecc0",
    art: (
      <>
        <circle cx="15" cy="18" r="8" fill={INK} />
        <circle cx="49" cy="18" r="8" fill={INK} />
        <circle cx="32" cy="37" r="22" fill="#fff" />
        <ellipse cx="22.5" cy="35" rx="6" ry="7.5" fill={INK} transform="rotate(20 22.5 35)" />
        <ellipse cx="41.5" cy="35" rx="6" ry="7.5" fill={INK} transform="rotate(-20 41.5 35)" />
        <circle cx="23" cy="34.5" r="2.2" fill="#fff" />
        <circle cx="41" cy="34.5" r="2.2" fill="#fff" />
        <ellipse cx="32" cy="45" rx="4" ry="3" fill={INK} />
        <path d="M27 50 Q32 54 37 50" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "bear",
    label: "Bear",
    bg: "#ffd77a",
    art: (
      <>
        <circle cx="15" cy="19" r="8" fill="#8a5a3b" />
        <circle cx="49" cy="19" r="8" fill="#8a5a3b" />
        <circle cx="15" cy="19" r="4" fill="#d9a77c" />
        <circle cx="49" cy="19" r="4" fill="#d9a77c" />
        <circle cx="32" cy="37" r="22" fill="#a56a45" />
        <ellipse cx="32" cy="45" rx="11" ry="8.5" fill="#e6c29b" />
        <circle cx="23" cy="34" r="2.8" fill={INK} />
        <circle cx="41" cy="34" r="2.8" fill={INK} />
        <ellipse cx="32" cy="42" rx="4" ry="3" fill={INK} />
        <path d="M32 45 L32 48 M27.5 49 Q32 52 36.5 49" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "owl",
    label: "Owl",
    bg: "#c7b6ff",
    art: (
      <>
        <polygon points="13,10 27,20 12,28" fill="#5b3fc0" />
        <polygon points="51,10 52,28 37,20" fill="#5b3fc0" />
        <ellipse cx="32" cy="38" rx="22" ry="21" fill="#6b4fd1" />
        <ellipse cx="32" cy="48" rx="12" ry="9" fill="#a996f2" />
        <circle cx="22" cy="33" r="9" fill="#fff" />
        <circle cx="42" cy="33" r="9" fill="#fff" />
        <circle cx="23.5" cy="34" r="4.2" fill={INK} />
        <circle cx="40.5" cy="34" r="4.2" fill={INK} />
        <circle cx="25" cy="32.5" r="1.4" fill="#fff" />
        <circle cx="42" cy="32.5" r="1.4" fill="#fff" />
        <polygon points="28,40 36,40 32,47" fill="#ffa52b" />
      </>
    ),
  },
  {
    id: "robot",
    label: "Robot",
    bg: "#8fe8df",
    art: (
      <>
        <line x1="32" y1="8" x2="32" y2="17" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="8" r="3.5" fill="#ff5d6c" />
        <rect x="6" y="30" width="6" height="12" rx="3" fill="#7c86b3" />
        <rect x="52" y="30" width="6" height="12" rx="3" fill="#7c86b3" />
        <rect x="11" y="17" width="42" height="38" rx="11" fill="#e4e9f8" stroke={INK} strokeWidth="2.5" />
        <rect x="17" y="27" width="12" height="10" rx="3" fill={INK} />
        <rect x="35" y="27" width="12" height="10" rx="3" fill={INK} />
        <rect x="20" y="30" width="6" height="4" rx="1.5" fill="#35e0ff" />
        <rect x="38" y="30" width="6" height="4" rx="1.5" fill="#35e0ff" />
        <path d="M22 46 H42 M27 43 V49 M32 43 V49 M37 43 V49" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "astronaut",
    label: "Astronaut",
    bg: "#2c3a99",
    art: (
      <>
        <circle cx="10" cy="12" r="1.5" fill="#fff" />
        <circle cx="54" cy="10" r="1.2" fill="#fff" />
        <circle cx="56" cy="40" r="1.4" fill="#ffe27a" />
        <circle cx="8" cy="46" r="1.2" fill="#ffe27a" />
        <circle cx="32" cy="34" r="23" fill="#f4f6ff" />
        <circle cx="32" cy="34" r="23" fill="none" stroke="#c8cfee" strokeWidth="2" />
        <rect x="14" y="22" width="36" height="25" rx="12.5" fill="#1c2250" />
        <path d="M20 27 Q27 23 34 25" stroke="#7da0ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="26" cy="37" r="2.2" fill="#fff" />
        <circle cx="38" cy="37" r="2.2" fill="#fff" />
        <path d="M28.5 42.5 Q32 45.5 35.5 42.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="32" cy="12.5" r="2.4" fill="#ff5d6c" />
      </>
    ),
  },
  {
    id: "penguin",
    label: "Penguin",
    bg: "#a9e1ff",
    art: (
      <>
        <ellipse cx="32" cy="37" rx="21" ry="23" fill="#263056" />
        <ellipse cx="32" cy="42" rx="14" ry="17" fill="#fff" />
        <circle cx="25" cy="30" r="3.4" fill="#fff" />
        <circle cx="39" cy="30" r="3.4" fill="#fff" />
        <circle cx="25.5" cy="30.5" r="1.8" fill={INK} />
        <circle cx="38.5" cy="30.5" r="1.8" fill={INK} />
        <polygon points="27,35 37,35 32,42" fill="#ff9d2e" />
        <ellipse cx="21" cy="40" rx="3" ry="2" fill="#ff9db8" opacity=".7" />
        <ellipse cx="43" cy="40" rx="3" ry="2" fill="#ff9db8" opacity=".7" />
      </>
    ),
  },
  {
    id: "alien",
    label: "Alien",
    bg: "#d3ff9c",
    art: (
      <>
        <line x1="22" y1="12" x2="19" y2="5" stroke="#2a9d47" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="42" y1="12" x2="45" y2="5" stroke="#2a9d47" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="19" cy="5" r="2.6" fill="#ff5d9e" />
        <circle cx="45" cy="5" r="2.6" fill="#ff5d9e" />
        <path d="M32 11 Q57 11 55 36 Q52 56 32 59 Q12 56 9 36 Q7 11 32 11Z" fill="#3fcf5e" />
        <ellipse cx="22" cy="34" rx="7.5" ry="10" fill={INK} transform="rotate(-18 22 34)" />
        <ellipse cx="42" cy="34" rx="7.5" ry="10" fill={INK} transform="rotate(18 42 34)" />
        <circle cx="24" cy="31" r="2" fill="#fff" />
        <circle cx="40" cy="31" r="2" fill="#fff" />
        <path d="M28 51 Q32 54 36 51" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "rabbit",
    label: "Rabbit",
    bg: "#ffbfdc",
    art: (
      <>
        <ellipse cx="22" cy="17" rx="6" ry="14" fill="#fff" />
        <ellipse cx="42" cy="17" rx="6" ry="14" fill="#fff" />
        <ellipse cx="22" cy="18" rx="2.8" ry="9.5" fill="#ff9db8" />
        <ellipse cx="42" cy="18" rx="2.8" ry="9.5" fill="#ff9db8" />
        <circle cx="32" cy="41" r="19" fill="#fff" />
        <circle cx="25" cy="39" r="2.6" fill={INK} />
        <circle cx="39" cy="39" r="2.6" fill={INK} />
        <ellipse cx="32" cy="46" rx="3" ry="2.2" fill="#ff7aa5" />
        <path d="M32 48 V51 M28 52 Q32 55 36 52" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="19" cy="46" r="3" fill="#ffc2d6" opacity=".8" />
        <circle cx="45" cy="46" r="3" fill="#ffc2d6" opacity=".8" />
      </>
    ),
  },
  {
    id: "lion",
    label: "Lion",
    bg: "#ffe07f",
    art: (
      <>
        <circle cx="32" cy="35" r="25" fill="#e5821d" />
        <circle cx="14" cy="22" r="6" fill="#c96a10" />
        <circle cx="50" cy="22" r="6" fill="#c96a10" />
        <circle cx="32" cy="37" r="17" fill="#ffc65c" />
        <ellipse cx="32" cy="45" rx="9" ry="7" fill="#ffe4ac" />
        <circle cx="25" cy="33" r="2.6" fill={INK} />
        <circle cx="39" cy="33" r="2.6" fill={INK} />
        <polygon points="28.5,40 35.5,40 32,44.5" fill="#7a3d12" />
        <path d="M32 44.5 V47 M27.5 48 Q32 51 36.5 48" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "ghost",
    label: "Ghost",
    bg: "#5b6cff",
    art: (
      <>
        <path d="M14 56 V28 Q14 8 32 8 Q50 8 50 28 V56 L43 50 L37.5 56 L32 50 L26.5 56 L21 50 Z" fill="#fff" />
        <ellipse cx="25" cy="29" rx="3.2" ry="4.4" fill={INK} />
        <ellipse cx="39" cy="29" rx="3.2" ry="4.4" fill={INK} />
        <ellipse cx="20" cy="37" rx="3.4" ry="2.2" fill="#ff9db8" opacity=".85" />
        <ellipse cx="44" cy="37" rx="3.4" ry="2.2" fill="#ff9db8" opacity=".85" />
        <ellipse cx="32" cy="38" rx="3" ry="3.6" fill={INK} />
      </>
    ),
  },
];

export const AVATAR_IDS = AVATARS.map((a) => a.id);
export const getAvatar = (id) => AVATARS.find((a) => a.id === id);
