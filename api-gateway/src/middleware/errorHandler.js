// src/middleware/errorHandler.js
const logger = require('../utils/logger');

module.exports = function errorHandler(err, req, res, next) {
  logger.error('Error:', err);

  if (err.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    res.status(err.response.status).json(err.response.data);
  } else if (err.request) {
    // The request was made but no response was received
    res.status(503).json({ error: 'Service unavailable' });
  } else {
    // Something happened in setting up the request that triggered an Error
    res.status(500).json({ error: 'Internal server error' });
  }
};