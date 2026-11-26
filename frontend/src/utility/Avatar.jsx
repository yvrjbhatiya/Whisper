import { colorFor, initials } from "../lib/config";

function Avatar({ name, size = 32 }) {
  return (
    <span
      aria-hidden="true"
      className="inline-grid shrink-0 select-none place-items-center rounded-full font-display font-bold text-white"
      style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  );
}

export default Avatar;
