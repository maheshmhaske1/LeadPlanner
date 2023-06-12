var express = require("express");
var router = express.Router();
const blogController = require("../controller/blog.controller");

router.get("/get", blogController.getBlogs);

module.exports = router;
