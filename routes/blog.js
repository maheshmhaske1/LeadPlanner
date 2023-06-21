var express = require("express");
var router = express.Router();

const auth = require('../middleware/auth')
const session = require('../middleware/session')
const auth_user = auth.authenticate_user
const blogController = require("../controller/blog");


// ============================== blog api ============================== //
router.post("/add", blogController.addBlog);
router.get("/get", blogController.getBlogs);
router.get("/get/:blogId", blogController.getBlog);
router.put("/edit/:blogId", blogController.editBlog);
router.post("/addImg", blogController.addBlogImage);
router.delete("/deleteImg/:blogImage", blogController.deleteBlogImage);
router.get("/tag/getAll", blogController.getAllBlogTags);
router.post("/tag/add", blogController.addBlogTag);

// ============================== section api ============================== //
router.put("/section/update/:sectionId", blogController.editSection);
router.get("/section/getByBlog/:blogId", blogController.getSectionByBlog);

module.exports = router;
