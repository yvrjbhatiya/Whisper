// Always answer with JSON { error } so the frontend can show it in a toast.
const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "That request couldn't be read. Please try again." });
  if (err.type === "entity.too.large") return res.status(413).json({ error: "That request is too large." });

  console.error(err.stack || err);
  const status = err.status >= 400 && err.status < 600 ? err.status : 500;
  res.status(status).json({
    error: status < 500 && err.message ? err.message : "Something went wrong on our side. Please try again in a moment.",
  });
};

module.exports = errorMiddleware;
