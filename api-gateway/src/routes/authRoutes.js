const express = require("express");
const apiService = require("../services/apiService");
const config = require("../config");
const logger = require("../utils/logger");

const router = express.Router();

router.post("/validate", async (req, res, next) => {
  try {
    const response = await apiService.post(
      `${config.authServiceUrl}/api/auth/validate`,
      req.body
    );
    res.status(200).json(response.data);
  } catch (error) {
    logger.error("Error in /auth/validate:", error);
    next(error);
  }
});

router.post("/generate", async (req, res, next) => {
  try {
    const response = await apiService.post(
      `${config.authServiceUrl}/api/auth/generate`,
      req.body
    );
    res.status(200).json(response.data);
  } catch (error) {
    logger.error("Error in /auth/generate:", error);
    next(error);
  }
});

module.exports = router;
