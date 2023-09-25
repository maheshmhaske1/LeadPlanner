var express = require("express");
var router = express.Router();

const auth = require('../model/auth')
const session = require('../model/session')
const auth_user = auth.authenticate_user
const blogController = require("../controller/blog");
const { verifyToken } = require('../model/auth')



// ============================== blog api ============================== //
router.post("/add", verifyToken, blogController.addBlog);
router.get("/get", verifyToken, blogController.getBlogs);
router.get("/get/:blogId", verifyToken, blogController.getBlog);
router.put("/edit/:blogId", verifyToken, blogController.editBlog);
router.post("/addImg", verifyToken, blogController.addBlogImage);
router.delete("/deleteImg/:blogImage", verifyToken, blogController.deleteBlogImage);
router.get("/tag/getall", verifyToken, blogController.getAllBlogTags);
router.post("/tag/add", verifyToken, blogController.addBlogTag);

// ============================== section api ============================== //
router.put("/section/update/:sectionId", verifyToken, blogController.editSection);
router.post("/section/add/:blogId", verifyToken, blogController.addSection);
router.get("/section/getbyblog/:blogId", verifyToken, blogController.getSectionByBlog);

module.exports = router;
