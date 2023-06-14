var express = require("express");
var router = express.Router();
var userController = require("../controller/user.controller");

router.post("/create-account",userController.createAccount);

module.exports = router;
