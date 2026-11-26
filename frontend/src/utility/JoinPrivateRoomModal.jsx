import { useState } from "react";
import Modal, { fieldClass, primaryBtn, ghostBtn } from "./Modal";

function JoinPrivateRoomModal({ onJoin, onClose }) {
  const [inviteId, setInviteId] = useState("");
  const [password, setPassword] = useState("");
  return <Modal title="Join private room" subtitle="Enter the 8-character room ID and password shared by the room owner." onClose={onClose}>
    <form onSubmit={(e) => { e.preventDefault(); onJoin(inviteId, password); }} className="space-y-3">
      <input autoFocus value={inviteId} onChange={(e) => setInviteId(e.target.value.toUpperCase())} maxLength={8} placeholder="Room ID (e.g. A1B2C3D4)" aria-label="Room ID" className={fieldClass} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Room password" aria-label="Room password" className={fieldClass} />
      <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className={ghostBtn}>Cancel</button><button disabled={inviteId.length !== 8 || !password} type="submit" className={primaryBtn}>Join room</button></div>
    </form>
  </Modal>;
}
export default JoinPrivateRoomModal;
