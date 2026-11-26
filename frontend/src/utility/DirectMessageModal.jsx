import { useState } from "react";
import Modal, { fieldClass, primaryBtn, ghostBtn } from "./Modal";

function DirectMessageModal({ onStart, onClose }) {
  const [username, setUsername] = useState("");
  return <Modal title="New direct message" subtitle="Enter the other person's username. Only the two of you can see this conversation." onClose={onClose}>
    <form onSubmit={(e) => { e.preventDefault(); onStart(username); }} className="space-y-3">
      <input autoFocus value={username} onChange={(e) => setUsername(e.target.value)} maxLength={24} placeholder="Their username" aria-label="Their username" className={fieldClass} />
      <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className={ghostBtn}>Cancel</button><button disabled={!username.trim()} type="submit" className={primaryBtn}>Start chat</button></div>
    </form>
  </Modal>;
}
export default DirectMessageModal;
