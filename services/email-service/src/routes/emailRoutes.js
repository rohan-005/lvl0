const express = require("express");
const router = express.Router();
const controller = require("../controllers/emailController");

router.post("/send-otp", controller.sendVerificationOTP);
router.post("/send-reset-otp", controller.sendPasswordResetOTP);

module.exports = router;
