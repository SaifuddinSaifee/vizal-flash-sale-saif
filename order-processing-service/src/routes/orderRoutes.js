const express = require("express");
const orderController = require("../controllers/orderController");
const validateRequest = require("../middleware/validation");
const authenticateUser = require("../middleware/auth");

const router = express.Router();

router.post('/create', authenticateUser, validateRequest('createOrder'), orderController.createOrder);
router.get("/:orderId", authenticateUser, orderController.getOrder);

module.exports = router;