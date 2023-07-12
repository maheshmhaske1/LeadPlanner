var express = require("express");
var router = express.Router();
var userController = require("../controller/user");
const session = require('../model/session')

router.post("/createaccount", userController.createAccount);
router.post("/login", userController.login);
router.post("/send-otp", userController.sendOtp);
router.post("/verify-otp", userController.verifyOTP);
router.post("/forgot-password", userController.forgotPassword);
router.post("/logout", userController.logOut);
router.post("/addteammember", userController.addTeamMember);
router.get("/getteammember", userController.getTeamMembers);
router.put("/updateteammember/:member_id", userController.updateTeamMembers);

module.exports = router;
