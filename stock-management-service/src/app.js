const express = require("express");
const stockRoutes = require("./routes/stockRoutes");
const logger = require("./utils/logger");

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());

app.use("/api/stock", stockRoutes);

app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    logger.info(`Stock Management Service listening at http://localhost:${port}`);
  });
}

module.exports = app;
