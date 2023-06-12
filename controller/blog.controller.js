const db = require("../db");

exports.getBlogs = async (req, res) => {
  //   const query = `SELECT * FROM xx_blog`;
  const query = `
  SELECT *
  FROM xx_blog
  LEFT JOIN xx_blog_details 
  ON xx_blog.id = xx_blog_details.blogid;
  `;
  db.query(query, (error, response) => {
    if (error) {
      return res.json({
        status: false,
        message: "something went wrong",
        error: error,
      });
    } else {
      return res.json({
        status: true,
        message: "blog details",
        data: response,
      });
    }
  });
};
