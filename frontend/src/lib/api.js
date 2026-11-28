import { API_URL } from "./config";

// Every failed request becomes an ApiError whose `message` is safe to show the user as-is.
export class ApiError extends Error {
  constructor(message, { status = 0, code = "unknown" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status; // HTTP status, or 0 when we never got a response
    this.code = code; // "network" | "offline" | "timeout" | "http"
  }
}

// Render's free tier can take a while to wake up, so be generous.
const TIMEOUT_MS = 30000;

const messageForStatus = (status) => {
  if (status === 400) return "That request wasn't valid. Please check it and try again.";
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "We couldn't find that.";
  if (status === 409) return "That conflicts with something that already exists.";
  if (status === 413) return "That is too large to send.";
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (status >= 500) return "Something went wrong on our side. Please try again in a moment.";
  return "Something went wrong. Please try again.";
};

/**
 * Small fetch wrapper used by the whole app.
 *  - sends/parses JSON
 *  - prefers the server's own error message, falls back to a friendly one
 *  - handles offline, network failure and timeout
 *  - on 401 for a signed-in request, tells the app the session expired
 */
export async function apiFetch(path, { method = "GET", token, body, timeout = TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    let response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        method,
        signal: controller.signal,
        headers: {
          ...(body !== undefined && { "Content-Type": "application/json" }),
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      if (error.name === "AbortError") {
        throw new ApiError("The server is taking too long to respond. It may be waking up — please try again in a few seconds.", { code: "timeout" });
      }
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new ApiError("You're offline. Check your internet connection and try again.", { code: "offline" });
      }
      throw new ApiError("Can't reach the server. Please check your connection and try again.", { code: "network" });
    }

    let data = null;
    try {
      data = await response.json();
    } catch {
      /* empty or non-JSON body */
    }

    if (!response.ok) {
      if (response.status === 401 && token) window.dispatchEvent(new Event("whisper:unauthorized"));
      throw new ApiError(data?.error || messageForStatus(response.status), { status: response.status, code: "http" });
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}
