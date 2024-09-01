const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/validate', authController.validateToken);
router.post('/generate', authController.generateToken); // Only for example

module.exports = router;