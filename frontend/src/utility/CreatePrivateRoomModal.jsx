import { useState } from "react";
import { notify } from "../lib/notify";
import Modal, { fieldClass, primaryBtn, ghostBtn } from "./Modal";

function CreatePrivateRoomModal({ createPrivateRoom, onClose, defaultPrivate = false }) {
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(defaultPrivate);
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      notify.error("Enter a room name.");
      return;
    }
    if (isPrivate && password.length < 6) { notify.error("Use at least 6 characters for the room password."); return; }
    createPrivateRoom(roomName.trim(), isPrivate, password);
  };

  return (
    <Modal title="New room" subtitle={isPrivate ? "Invite people with the generated 8-character ID and your password." : "Anyone signed in can view and send messages here."} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input autoFocus maxLength={30} value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room name" aria-label="Room name" className={fieldClass} />
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} /> Private — invite by ID and password</label>
        {isPrivate && <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} placeholder="Private-room password" aria-label="Private-room password" className={fieldClass} />}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
          <button type="submit" className={primaryBtn}>Create room</button>
        </div>
      </form>
    </Modal>
  );
}

export default CreatePrivateRoomModal;
