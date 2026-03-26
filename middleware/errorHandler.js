// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err.stack); // Logs error for debugging

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong on the server",
  });
}

module.exports = errorHandler;

