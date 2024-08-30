const express = require("express");
const StockController = require("../controllers/stockController");

const router = express.Router();

router.post("/initialize", StockController.initializeStock);
router.get("/current", StockController.getCurrentStock);
router.post("/reserve", StockController.reserveStock);

module.exports = router;
