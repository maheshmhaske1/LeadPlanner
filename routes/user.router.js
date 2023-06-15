var express = require("express");
var router = express.Router();
var userController = require("../controller/user.controller");

router.post("/create-account", userController.createAccount);
router.post("/login", userController.login);

module.exports = router;
