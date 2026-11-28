import { useState } from "react";
import { FiArrowLeft, FiSave, FiCheck, FiMail, FiLock, FiEye, FiAlertCircle } from "react-icons/fi";
import { notify } from "../lib/notify";
import { apiFetch } from "../lib/api";
import { AVATARS, getAvatar } from "../lib/avatars";
import Avatar from "./Avatar";

const BIO_MAX = 180;
const NAME_MAX = 40;

const fieldClass =
  "w-full rounded-xl border border-fog-300 bg-white px-4 py-3 text-base text-ink-900 outline-none transition placeholder:text-ink-600/55 focus:border-iris-500 focus:ring-4 focus:ring-iris-500/20 dark:border-ink-600 dark:bg-ink-900 dark:text-white dark:placeholder:text-fog-300/50";

const fieldErrorClass =
  "w-full rounded-xl border border-red-500 bg-white px-4 py-3 text-base text-ink-900 outline-none transition placeholder:text-ink-600/55 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:bg-ink-900 dark:text-white dark:placeholder:text-fog-300/50";

function Field({ label, hint, error, children, right }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-semibold text-ink-900 dark:text-white">{label}</label>
        {right}
      </div>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
          <FiAlertCircle className="shrink-0" /> {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-ink-600/75 dark:text-fog-300/75">{hint}</p>
      )}
    </div>
  );
}

function ProfilePage({ user, token, onSave, onBack }) {
  const initial = {
    displayName: user.displayName || user.username,
    username: user.username,
    bio: user.bio || "",
    avatar: user.avatar || "",
  };
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState({}); // field -> message from the server (e.g. username taken)

  const set = (key) => (value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setServerError((previous) => (previous[key] ? { ...previous, [key]: undefined } : previous));
  };
  const changed = Object.keys(initial).some((key) => form[key].trim() !== initial[key]);
  const valid = form.displayName.trim().length > 0 && /^[a-zA-Z0-9_]{3,24}$/.test(form.username.trim());
  const picked = getAvatar(form.avatar);

  // Show what's wrong right next to the field, not only after pressing Save.
  const nameError = form.displayName.length > 0 && !form.displayName.trim() ? "Name can't be empty." : "";
  const usernameError =
    serverError.username ||
    (form.username.trim() && !/^[a-zA-Z0-9_]{3,24}$/.test(form.username.trim())
      ? "Use 3–24 letters, numbers, or underscores."
      : "");

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await apiFetch("/api/users/me", {
        method: "PATCH",
        token,
        body: {
          displayName: form.displayName.trim(),
          username: form.username.trim(),
          bio: form.bio.trim(),
          avatar: form.avatar,
        },
      });
      // An outdated backend ignores the new fields and replies without them.
      if ((data.user.avatar || "") !== form.avatar.trim() || (data.user.bio || "") !== form.bio.trim()) {
        throw new Error("The server didn't save your changes – it's still running the old backend. Redeploy the updated backend, then try again.");
      }
      onSave(data.user);
      notify.success("Profile updated.");
      onBack();
    } catch (error) {
      if (error.status === 409) setServerError({ username: error.message }); // username already taken
      notify.error(error.message || "Couldn't update profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="scroll-thin flex-1 overflow-y-auto bg-fog-50 p-4 dark:bg-ink-900 sm:p-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex w-fit items-center gap-2 text-sm font-semibold text-iris-600 hover:underline dark:text-iris-300"
      >
        <FiArrowLeft /> Back to Whisper
      </button>

      <form onSubmit={save} className="mx-auto w-full max-w-2xl space-y-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink-900 dark:text-white">Your profile</h1>
          <p className="mt-1.5 text-sm text-ink-600/80 dark:text-fog-300/80">
            Choose how you appear to everyone on Whisper.
          </p>
        </div>

        {/* Header card: big avatar + current identity */}
        <section className="overflow-hidden rounded-2xl border border-fog-300 bg-white shadow-sm dark:border-ink-600 dark:bg-ink-950">
          <div
            className="h-24 transition-colors duration-300"
            style={{ background: picked ? `linear-gradient(135deg, ${picked.bg}, #3a4de8)` : "linear-gradient(135deg,#7487ff,#3a4de8)" }}
          />
          <div className="flex items-end gap-4 px-5 pb-5">
            <Avatar
              name={form.username}
              avatar={form.avatar}
              size={88}
              className="-mt-11 ring-4 ring-white dark:ring-ink-950"
            />
            <div className="min-w-0 pb-1">
              <p className="truncate font-display text-xl font-bold text-ink-900 dark:text-white">
                {form.displayName.trim() || "Your name"}
              </p>
              <p className="truncate text-sm font-medium text-iris-600 dark:text-iris-300">@{form.username.trim() || "username"}</p>
            </div>
          </div>
        </section>

        {/* Avatar picker */}
        <section className="rounded-2xl border border-fog-300 bg-white p-5 dark:border-ink-600 dark:bg-ink-950">
          <h2 className="text-sm font-semibold text-ink-900 dark:text-white">Choose your avatar</h2>
          <p className="mt-1 text-xs text-ink-600/75 dark:text-fog-300/75">Pick one of 12 characters.</p>
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6" role="radiogroup" aria-label="Avatar">
            {AVATARS.map((item) => {
              const selected = form.avatar === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={item.label}
                  title={item.label}
                  onClick={() => set("avatar")(item.id)}
                  className={`relative mx-auto rounded-full p-1 transition active:scale-95 ${
                    selected
                      ? "bg-iris-500 shadow-lg shadow-iris-500/30"
                      : "bg-transparent hover:bg-fog-200 dark:hover:bg-ink-700"
                  }`}
                >
                  <Avatar name={item.label} avatar={item.id} size={56} className="ring-2 ring-white dark:ring-ink-950" />
                  {selected && (
                    <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-iris-600 text-white ring-2 ring-white dark:ring-ink-950">
                      <FiCheck size={12} strokeWidth={4} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Details */}
        <section className="space-y-5 rounded-2xl border border-fog-300 bg-white p-5 dark:border-ink-600 dark:bg-ink-950">
          <Field label="Name" hint="Shown next to your messages." error={nameError}>
            <input
              maxLength={NAME_MAX}
              value={form.displayName}
              onChange={(e) => set("displayName")(e.target.value)}
              placeholder="Your name"
              className={nameError ? fieldErrorClass : fieldClass}
            />
          </Field>

          <Field label="Username" hint="3–24 letters, numbers, or underscores. Must be unique. People use it to message you." error={usernameError}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-ink-600/70 dark:text-fog-300/70">@</span>
              <input
                maxLength={24}
                value={form.username}
                onChange={(e) => set("username")(e.target.value.replace(/\s/g, ""))}
                className={`${usernameError ? fieldErrorClass : fieldClass} pl-9`}
              />
            </div>
          </Field>

          <Field
            label="Bio"
            right={
              <span className={`text-xs font-medium ${form.bio.length > BIO_MAX - 20 ? "text-ember-500" : "text-ink-600/70 dark:text-fog-300/70"}`}>
                {form.bio.length}/{BIO_MAX}
              </span>
            }
          >
            <textarea
              rows={3}
              maxLength={BIO_MAX}
              value={form.bio}
              onChange={(e) => set("bio")(e.target.value)}
              placeholder="Tell people a little about yourself…"
              className={`${fieldClass} resize-none leading-relaxed`}
            />
          </Field>

          <Field label="Email" hint="Only you can see this. It can't be changed here.">
            <div className="flex items-center gap-2.5 rounded-xl border border-fog-300 bg-fog-100 px-4 py-3 text-sm text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-fog-200">
              <FiMail className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">{user.email}</span>
              <FiLock className="shrink-0 opacity-60" title="Private" />
            </div>
          </Field>
        </section>

        <p className="flex items-center gap-2 text-xs text-ink-600/80 dark:text-fog-300/80">
          <FiEye className="shrink-0" /> Other people can see your avatar, name, username and bio — never your email.
        </p>

        <div className="flex items-center gap-3 pb-6">
          <button
            disabled={busy || !changed || !valid}
            className="flex items-center gap-2 rounded-xl bg-iris-600 px-5 py-3 font-semibold text-white shadow-lg shadow-iris-600/25 transition hover:bg-iris-500 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiSave /> {busy ? "Saving…" : "Save changes"}
          </button>
          {changed && !busy && (
            <button
              type="button"
              onClick={() => setForm(initial)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-ink-700 transition hover:bg-fog-200 dark:text-fog-200 dark:hover:bg-ink-700"
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
