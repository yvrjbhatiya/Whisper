import { toast } from "react-toastify";

// One place for every toast so they look and behave the same.
//  - the message doubles as the toast id, so the same error never stacks up twice
//  - errors/warnings stay longer than successes so they can actually be read
const make = (type, autoClose) => (message, options = {}) =>
  toast[type](message, { autoClose, toastId: message, ...options });

export const notify = {
  error: make("error", 6000),
  warning: make("warning", 6000),
  success: make("success", 3000),
  info: make("info", 4500),
  dismiss: (id) => toast.dismiss(id),
};
