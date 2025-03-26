const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/identification');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.patch('/send-reset-password-code' , authController.sendForgotPasswordCode);
router.patch('/verify-reset-password-code', authController.verifyResetPasswordCode);

module.exports = router;