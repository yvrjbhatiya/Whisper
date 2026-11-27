import { useState, useEffect, useRef, useCallback } from "react";
import Chat from "./components/Chat";
import LoginForm from "./components/LoginForm";
import LoadingScreen from "./components/LoadingScreen";

const IDLE_LOGOUT_MS = 15 * 60 * 1000;

function initialTheme() {
  return localStorage.getItem("whisperTheme") === "dark";
}

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(initialTheme);
  const [session, setSession] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("whisperSession"));
      return saved?.token && saved?.user?.username ? saved : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const idleTimer = useRef(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("whisperSession");
    setSession(null);
    clearTimeout(idleTimer.current);
  }, []);

  const resetIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(handleLogout, IDLE_LOGOUT_MS);
  }, [handleLogout]);

  const handleLogin = (data) => {
    localStorage.setItem("whisperSession", JSON.stringify(data));
    setSession(data);
  };

  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkTheme);

    localStorage.setItem("whisperTheme", isDarkTheme ? "dark" : "light");

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isDarkTheme ? "#0f1016" : "#f7f8fc");
  }, [isDarkTheme]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Idle logout: any real interaction (incl. typing and touch) keeps you signed in.
  useEffect(() => {
    if (!session) return;
    const events = ["mousemove", "keydown", "click", "touchstart"];
    events.forEach((e) =>
      window.addEventListener(e, resetIdle, { passive: true }),
    );
    resetIdle();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdle));
      clearTimeout(idleTimer.current);
    };
  }, [session, resetIdle]);

  if (isLoading) return <LoadingScreen />;

  const isSignedIn = Boolean(session?.token && session?.user?.username);

  return isSignedIn ? (
    <Chat
      user={session.user}
      token={session.token}
      onProfileChange={(user) => {
        const next = { ...session, user };
        localStorage.setItem("whisperSession", JSON.stringify(next));
        setSession(next);
      }}
      isDarkTheme={isDarkTheme}
      toggleTheme={toggleTheme}
      onLogout={handleLogout}
    />
  ) : (
    <LoginForm
      onLogin={handleLogin}
      isDarkTheme={isDarkTheme}
      toggleTheme={toggleTheme}
    />
  );
}

export default App;
