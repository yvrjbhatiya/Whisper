import { useState } from "react";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { toast } from "react-toastify";
import { API_URL } from "../lib/config";

function ProfilePage({ user, token, onSave, onBack }) {
  const [username, setUsername] = useState(user.username);
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch(`${API_URL}/api/users/me`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ username }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      onSave(data.user);
      toast.success("Profile updated.");
      onBack();
    } catch (error) { toast.error(error.message || "Couldn't update profile."); }
    finally { setBusy(false); }
  };
  return <div className="flex flex-1 flex-col overflow-y-auto p-5 sm:p-8"><button onClick={onBack} className="mb-8 flex w-fit items-center gap-2 text-sm font-semibold text-iris-600 dark:text-iris-400"><FiArrowLeft /> Back to Whisper</button><div className="mx-auto w-full max-w-lg"><h1 className="font-display text-3xl font-extrabold">Profile</h1><p className="mt-2 text-ink-600/70 dark:text-fog-300/70">Your email stays private and cannot be changed here.</p><form onSubmit={save} className="mt-7 rounded-2xl border border-fog-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-950"><label className="mb-2 block text-sm font-semibold">Username</label><input autoFocus maxLength={24} value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-fog-300 bg-fog-50 px-4 py-3 outline-none focus:ring-2 focus:ring-iris-500/40 dark:border-ink-600 dark:bg-ink-900" /><p className="mt-2 text-xs text-ink-600/60 dark:text-fog-300/60">3–24 letters, numbers, or underscores. It must be unique.</p><div className="mt-5"><p className="text-sm font-semibold">Email</p><p className="mt-1 rounded-xl bg-fog-100 px-4 py-3 text-sm text-ink-600 dark:bg-ink-900 dark:text-fog-300">{user.email}</p></div><button disabled={busy || username.trim() === user.username} className="mt-6 flex items-center gap-2 rounded-xl bg-iris-600 px-4 py-3 font-semibold text-white disabled:opacity-50"><FiSave /> {busy ? "Saving…" : "Save username"}</button></form></div></div>;
}
export default ProfilePage;
