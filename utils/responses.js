// Shared HTTP response helpers used across route handlers.

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

// Sends a 500 response when a database error occurred.
// Returns true if an error was handled so callers can stop processing.
function handleDbError(res, err) {
  if (err) {
    sendError(res, 500, err.message);
    return true;
  }
  return false;
}

function sendNotFound(res, id) {
  return sendError(res, 404, `Task ${id} not found`);
}

module.exports = {
  sendError,
  handleDbError,
  sendNotFound,
};
