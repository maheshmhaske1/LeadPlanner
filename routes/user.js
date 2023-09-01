var express = require("express");
var router = express.Router();
var userController = require("../controller/user");
const session = require('../model/session')
const { verifyToken } = require('../model/auth')

router.post("/createaccount", userController.createAccount);
router.put("/update", verifyToken, userController.updateUserInfo);
router.post("/login", userController.login);
router.post("/send-otp", userController.sendOtp);
router.get("/getuserinfo", verifyToken, userController.getUserInfo);
router.post("/verify-otp", userController.verifyOTP);
router.post("/forgot-password", userController.forgotPassword);
router.post("/logout", userController.logOut);
router.post("/addteammember", verifyToken, userController.addTeamMember);
router.get("/getteammember", verifyToken, userController.getTeamMembers);
router.put("/updateteammember/:member_id", verifyToken, userController.updateTeamMembers);
router.get("/getallteammemberfromtrash", verifyToken, userController.getAllTeamMemberFromTrash);
router.post("/trashteammember", verifyToken, userController.moveMemberToTrash);
router.post("/restorememberfromtrash/:teamMemberId", verifyToken, userController.restoreTeamMemberFromTrash);
router.post("/restoreallmemberfromtrash", verifyToken, userController.restoreAllTeamMemberFromTrash);
router.delete("/deletememberfromtrash/:teamMemberId", verifyToken, userController.deleteTeamMemberFromTrash);
router.delete("/deleteallmemberfromtrash", verifyToken, userController.deleteAllTeamMemberFromTrash);
router.get('/getcountries', verifyToken, userController.getCountryMasterData)
router.post("/ticket/raise", verifyToken, userController.addTicket);
router.get("/ticket/getAll/:status", verifyToken, userController.getAllTickets);
router.get("/ticket/getmytickets", verifyToken, userController.getTickets);
router.put("/ticket/update/:ticketId", verifyToken, userController.updateTickets);
router.get('/getallroles', verifyToken, userController.getAllRoles)
router.get('/getrolesByUser/:userId', verifyToken, userController.getUserRolesByUser)
router.post('/help/searchquestion', verifyToken, userController.searchHelpQuestions)
router.get('/help/getbyid/:helpQuestionId', verifyToken, userController.getHelpQuestionsById)
router.put('/help/update/:helpQuestionId', verifyToken, userController.updateHeplQuetions)


module.exports = router;
