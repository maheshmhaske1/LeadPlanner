var express = require("express");
var router = express.Router();
const blogController = require("../controller/blog.controller");

// ============================== blog api ============================== //
router.post("/add", blogController.addBlog);
router.get("/get", blogController.getBlogs);
router.get("/get/:blogId", blogController.getBlog);
router.delete("/delete/:blogId", blogController.removeBlog);
router.post("/addImg", blogController.addBlogImage);
router.delete("/deleteImg/:blogImage", blogController.deleteBlogImage);
router.get("/tag/getAll", blogController.getAllBlogTags);
router.post("/tag/add", blogController.addBlogTag);

// ============================== section api ============================== //
router.put("/section/update/:sectionId", blogController.editSection);
router.delete("/section/delete/:sectionId", blogController.removeBlogSection);
router.get("/section/getByBlog/:blogId", blogController.getSectionByBlog);
router.get("/section/get/:sectionId", blogController.getSection);

module.exports = router;
