const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err.stack);

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
}

module.exports = errorHandler;