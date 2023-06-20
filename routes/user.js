var express = require("express");
var router = express.Router();
var userController = require("../controller/user");
const session = require('../middleware/session')

router.post("/create-account", userController.createAccount);
router.post("/login", userController.login);
router.post("/send-otp", userController.sendOtp);
router.post("/verify-otp", userController.verifyOTP);
router.post("/forgot-password", userController.forgotPassword);
router.post("/logout", session.checkSession, userController.logOut);

module.exports = router;
