const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config/config');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use(errorHandler);

const startServer = (port = config.PORT) => {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      logger.info(`Auth Service running on port ${port}`);
      resolve(server);
    });
  });
};

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };