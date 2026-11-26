import Modal, { fieldClass, primaryBtn, ghostBtn } from "./Modal";

function PasswordModal({ roomName, password, setPassword, onJoin, onClose }) {
  return (
    <Modal title="Private room" subtitle={`Enter the password to join “${roomName}”.`} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onJoin(); }}>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Room password"
          aria-label="Room password"
          className={fieldClass}
        />
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
          <button type="submit" disabled={!password.trim()} className={primaryBtn}>Join room</button>
        </div>
      </form>
    </Modal>
  );
}

export default PasswordModal;
