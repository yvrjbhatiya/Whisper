import { useState } from "react";
import { toast } from "react-toastify";
import Modal, { fieldClass, primaryBtn, ghostBtn } from "./Modal";

function CreatePrivateRoomModal({ createPrivateRoom, onClose }) {
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      toast.error("Enter a room name.");
      return;
    }
    createPrivateRoom(roomName.trim(), isPrivate);
  };

  return (
    <Modal title="New room" subtitle={isPrivate ? "Only you can view and send messages in this room." : "Anyone signed in can view and send messages here."} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input autoFocus maxLength={30} value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room name" aria-label="Room name" className={fieldClass} />
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} /> Private — only me</label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
          <button type="submit" className={primaryBtn}>Create room</button>
        </div>
      </form>
    </Modal>
  );
}

export default CreatePrivateRoomModal;
