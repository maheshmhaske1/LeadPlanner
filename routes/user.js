var express = require("express");
var router = express.Router();
var userController = require("../controller/user");
const session = require('../model/session')
const { verifyToken } = require('../model/auth')

router.post("/createaccount", userController.createAccount);
router.post("/createlog", verifyToken, userController.createLogs);
router.put("/update", verifyToken, userController.updateUserInfo);
router.post("/login", userController.login);
router.get("/getorg/:orgId", verifyToken, userController.getOrgInfoById);
router.post("/send-otp", userController.sendOtp);
router.get("/getuserinfo", verifyToken, userController.getUserInfo);
router.post("/getuserinfobyid", verifyToken, userController.getUserInfoById);
router.post("/verify-otp", userController.verifyOTP);
router.post("/forgot-password", userController.forgotPassword);
router.post("/logout", userController.logOut);
router.post("/addteammember", verifyToken, userController.addTeamMember);
router.post("/getteammember/:user", verifyToken, userController.getTeamMembers);
router.put("/updateteammember/:member_id", verifyToken, userController.updateTeamMembers);
router.get("/getallteammemberfromtrash", verifyToken, userController.getAllTeamMemberFromTrash);
router.post("/trashteammember", verifyToken, userController.moveMemberToTrash);
router.post("/restorememberfromtrash/:teamMemberId", verifyToken, userController.restoreTeamMemberFromTrash);
router.post("/restoreallmemberfromtrash", verifyToken, userController.restoreAllTeamMemberFromTrash);
router.delete("/deletememberfromtrash/:teamMemberId", verifyToken, userController.deleteTeamMemberFromTrash);
router.delete("/deleteallmemberfromtrash", verifyToken, userController.deleteAllTeamMemberFromTrash);
router.get('/getcountries', verifyToken, userController.getCountryMasterData)
router.post("/ticket/raise", verifyToken, userController.addTicket);
router.post("/ticket/getAll/:status", verifyToken, userController.getAllTickets);
router.get("/ticket/getmytickets/:org_id", verifyToken, userController.getTickets);
router.put("/ticket/update/:ticketId", verifyToken, userController.updateTickets);
router.get('/getallroles', verifyToken, userController.getAllRoles)
router.get('/getrolesByUser/:userId', verifyToken, userController.getUserRolesByUser)
router.post('/help/searchquestion', verifyToken, userController.searchHelpQuestions)
router.get('/help/getbyid/:helpQuestionId', verifyToken, userController.getHelpQuestionsById)
router.put('/help/update/:helpQuestionId', verifyToken, userController.updateHeplQuetions)
router.post('/help/addquation', verifyToken, userController.AddHelpQuestions)
router.get('/geteligibilitycriteria', verifyToken, userController.getAllEligibilityFilters)
router.post('/getleaddealbymember', verifyToken, userController.getLeadOrDealByUser)


module.exports = router;
