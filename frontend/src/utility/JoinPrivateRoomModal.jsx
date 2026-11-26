
import { useState } from "react";
import Modal, { fieldClass, primaryBtn, ghostBtn } from "./Modal";

function JoinPrivateRoomModal({ onJoin, onClose }) {
  const [inviteId, setInviteId] = useState("");
  const [password, setPassword] = useState("");

  const isValid = inviteId.length === 8 && password.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;

    onJoin(inviteId, password);
  };

  return (
    <Modal
      title="Join private room"
      subtitle="Enter the room ID and password shared by the room owner."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="w-full space-y-5">
        {/* Room ID */}
        <div className="space-y-2">
          <label
            htmlFor="inviteId"
            className="block text-sm font-semibold text-ink-700 dark:text-fog-200"
          >
            Room ID
          </label>

          <input
            id="inviteId"
            autoFocus
            required
            value={inviteId}
            onChange={(e) =>
              setInviteId(
                e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
              )
            }
            maxLength={8}
            placeholder="e.g. A1B2C3D4"
            aria-label="Room ID"
            className={`${fieldClass} h-12 w-full tracking-widest uppercase`}
          />

          <p className="text-xs text-ink-400 dark:text-fog-500">
            Enter the 8-character invitation ID.
          </p>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label
            htmlFor="roomPassword"
            className="block text-sm font-semibold text-ink-700 dark:text-fog-200"
          >
            Room password
          </label>

          <input
            id="roomPassword"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter room password"
            aria-label="Room password"
            className={`${fieldClass} h-12 w-full`}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-fog-200 pt-4 dark:border-ink-700 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`${ghostBtn} w-full sm:w-auto`}
          >
            Cancel
          </button>

          <button
            disabled={!isValid}
            type="submit"
            className={`${primaryBtn} w-full p-2 sm:w-auto disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Join room
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default JoinPrivateRoomModal;
