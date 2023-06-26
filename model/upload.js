const multer = require("multer");

exports.uploadBlogImg = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./public/blog/`);
    },
    filename: function (req, file, cb) {
      cb(null, `blog` + `${Date.now()}` + `_` + file.originalname);
    },
  }),
}).single("blog_img");


exports.uploadImg = (img) => {
  return multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, `./public/${img}/`);
      },
      filename: function (req, file, cb) {
        cb(null, `${img}` + `${Date.now()}` + `_` + file.originalname);
      },
    }),
  }).single(`${img}`);
}
