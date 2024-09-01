const express = require("express");
const orderController = require("../controllers/orderController");
const validateRequest = require("../middleware/validation");
const authenticateUser = require("../middleware/auth");

const router = express.Router();

router.post('/create', (req, res, next) => {
    // Add user ID from the authenticated request
    req.body.userId = req.user.userId;
    orderController.createOrder(req, res, next);
  });
router.get("/:orderId", authenticateUser, OrderController.getOrder);

module.exports = router;
