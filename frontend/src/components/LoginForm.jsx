
import { useState } from "react";
import { FiMoon, FiSun, FiArrowRight } from "react-icons/fi";
import { toast } from "react-toastify";

import logo from "../images/logo.png";
import { API_URL } from "../lib/config";
import LoadingScreen from "./LoadingScreen";

function LoginForm({ onLogin, isDarkTheme, toggleTheme }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    identity: "",
    username: "",
    email: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);

  const change = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (busy) return;

    setBusy(true);

    try {
      // Forgot password
      if (mode === "forgot") {
        const response = await fetch(
          `${API_URL}/api/users/forgot-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: form.email.trim(),
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Unable to send recovery email.");
        }

        toast.success(
          "If that email is registered, recovery instructions are on the way."
        );

        setMode("login");
        return;
      }

      // Login or signup
      const isSignup = mode === "signup";
      const endpoint = isSignup ? "signup" : "login";

      const body = isSignup
        ? {
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
          }
        : {
            identity: form.identity.trim(),
            password: form.password,
          };

      const response = await fetch(
        `${API_URL}/api/users/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Please try again.");
      }

      if (isSignup) {
        toast.success("Account created. Please sign in.");

        setForm((prev) => ({
          ...prev,
          identity: prev.email,
          password: "",
        }));

        setMode("login");
        return;
      }

      // Successful login
      onLogin(data);
    } catch (error) {
      toast.error(
        error.message || "Couldn't reach the server. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === "signup"
      ? "Create your account."
      : mode === "forgot"
      ? "Recover your password."
      : "Welcome back.";

  // Completely replace login UI while loading
  if (busy) {
    return <LoadingScreen />;
  }

  return (
    <main className="h-app aurora relative flex items-center justify-center overflow-y-auto bg-fog-50 px-4 text-ink-900 dark:bg-ink-900 dark:text-fog-100 safe-t">

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/70 text-ink-700 shadow-sm transition hover:scale-105 dark:bg-ink-950/70 dark:text-fog-200"
      >
        {isDarkTheme ? <FiSun size={18} /> : <FiMoon size={18} />}
      </button>

      <div className="w-full max-w-md animate-pop py-10">

        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <img
            src={logo}
            alt="Whisper"
            width={44}
            height={44}
            className="rounded-xl"
          />
          <span className="font-display text-2xl font-bold">
            Whisper
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">
          {title}
        </h1>

        <p className="mt-4 text-ink-600/80 dark:text-fog-300/80">
          {mode === "signup"
            ? "Your username must be unique. You can update it later from your profile."
            : mode === "forgot"
            ? "Enter the email linked to your account."
            : "Sign in with your username or email to continue."}
        </p>

        {/* Form */}
        <form
          onSubmit={submit}
          className="mt-8 rounded-3xl border border-fog-200 bg-white/80 p-5 shadow-xl dark:border-ink-600/60 dark:bg-ink-950/70"
        >
          {mode === "signup" && (
            <>
              <label className="mb-2 block text-sm font-semibold">
                Username
              </label>

              <input
                autoFocus
                required
                value={form.username}
                onChange={change("username")}
                maxLength={24}
                placeholder="e.g. moonwalker"
                className="w-full rounded-xl border border-fog-300 bg-fog-50 px-4 py-3 outline-none transition focus:border-iris-500 focus:ring-2 focus:ring-iris-500/20 dark:border-ink-600 dark:bg-ink-900"
              />

              <p className="mt-2 text-xs text-ink-600/70 dark:text-fog-300/60">
                3–24 letters, numbers, or underscores. It must be unique.
              </p>
            </>
          )}

          {mode !== "forgot" && (
            <>
              <label className="mb-2 mt-4 block text-sm font-semibold">
                {mode === "signup" ? "Email" : "Username or email"}
              </label>

              <input
                type={mode === "signup" ? "email" : "text"}
                autoFocus={mode === "login"}
                required
                value={mode === "signup" ? form.email : form.identity}
                onChange={change(
                  mode === "signup" ? "email" : "identity"
                )}
                placeholder={
                  mode === "signup"
                    ? "you@example.com"
                    : "Enter username or email"
                }
                className="w-full rounded-xl border border-fog-300 bg-fog-50 px-4 py-3 outline-none transition focus:border-iris-500 focus:ring-2 focus:ring-iris-500/20 dark:border-ink-600 dark:bg-ink-900"
              />
            </>
          )}

          {mode === "forgot" && (
            <>
              <label className="mb-2 block text-sm font-semibold">
                Email
              </label>

              <input
                type="email"
                autoFocus
                required
                value={form.email}
                onChange={change("email")}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-fog-300 bg-fog-50 px-4 py-3 outline-none transition focus:border-iris-500 focus:ring-2 focus:ring-iris-500/20 dark:border-ink-600 dark:bg-ink-900"
              />
            </>
          )}

          {mode !== "forgot" && (
            <>
              <label className="mb-2 mt-4 block text-sm font-semibold">
                Password
              </label>

              <input
                type="password"
                required
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                value={form.password}
                onChange={change("password")}
                minLength={8}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-fog-300 bg-fog-50 px-4 py-3 outline-none transition focus:border-iris-500 focus:ring-2 focus:ring-iris-500/20 dark:border-ink-600 dark:bg-ink-900"
              />
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-iris-600 py-3 font-semibold text-white transition hover:bg-iris-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mode === "signup"
              ? "Create account"
              : mode === "forgot"
              ? "Send recovery email"
              : "Sign in"}

            <FiArrowRight size={18} />
          </button>

          {/* Navigation */}
          <div className="mt-4 flex justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={() =>
                setMode(mode === "signup" ? "login" : "signup")
              }
              className="text-iris-600 transition hover:text-iris-700 dark:text-iris-400"
            >
              {mode === "signup"
                ? "Already have an account?"
                : "Create an account"}
            </button>

            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-iris-600 transition hover:text-iris-700 dark:text-iris-400"
              >
                Forgot password?
              </button>
            )}

            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-iris-600 transition hover:text-iris-700 dark:text-iris-400"
              >
                Back to sign in
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

export default LoginForm;
