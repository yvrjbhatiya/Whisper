// Express 4 doesn't catch errors thrown in async handlers – without this a failed
// database call would leave the request hanging. This forwards them to errorMiddleware.
module.exports = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
