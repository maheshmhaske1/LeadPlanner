const db = require("../db");
const fs = require("fs");
const { uploadBlogImg } = require("../middleware/upload");
const { checkMandatoryFields } = require("../middleware/validators");
const { error } = require("console");

exports.addBlog = async (req, res) => {
  const { title, url, description, route, image, tag, date, sections } =
    req.body;

  const query = `
    INSERT INTO xx_blog 
    SET 
      tag = ?, 
      route = ?, 
      title = ?, 
      url = ?, 
      description = ?, 
      image = ?, 
      date = ?
  `;
  const values = [tag, route, title, url, description, image, date];

  await db.query(query, values, async (error, response) => {
    if (error) {
      return res.json({
        status: false,
        message: "something went wrong",
        error: error,
      });
    }

    let blogid = response.insertId
    let addSectionQuery = "";
    sections.forEach((section) => {
      addSectionQuery += `INSERT INTO xx_blog_details (blogid, heading, section, image, sort) VALUES (${response.insertId}, '${section.heading}', '${section.section}', '${section.image}', ${section.sort}); `;
    });
    await db.query(addSectionQuery, (error, response) => {
      if (error) {
        return res.json({
          status: false,
          message: "something went wrong",
          error: error,
        });
      }
      else {
        return res.json({
          status: true,
          message: "Blog added successfully",
          data: { id: blogid }
        });
      }
    });

    // try {
    //   return res.json({
    //     status: true,
    //     message: "Blog added successfully",
    //   });
    // } catch (error) {
    //   return res.json({
    //     status: false,
    //     message: "Something went wrong",
    //     error: error,
    //   });
    // }
  });
};



exports.getBlogs = async (req, res) => {
  const query = `
SELECT 
  * 
FROM 
  xx_blog 
  JOIN xx_blog_details ON xx_blog.id = xx_blog_details.blogid
  `;

  await db.query(query, (error, response) => {
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

exports.removeBlog = async (req, res) => {
  const { blogId } = req.params;
  await checkMandatoryFields(blogId);

  const query = `
  DELETE FROM xx_blog WHERE id = ?;
  DELETE FROM xx_blog_details WHERE blogid =?;
`;
  const values = [blogId, blogId];

  await db.query(query, values, (error, response) => {
    console.log(response);
    if (error) {
      return res.json({
        status: false,
        message: "something went wrong",
        error,
      });
    } else if (response[0].affectedRows > 0) {
      return res.json({
        status: true,
        message: "Blog removed successfully",
      });
    } else if (response[0].affectedRows == 0) {
      return res.json({
        status: true,
        message: "please provide valid blogId",
      });
    }
  });
};

exports.getBlog = async (req, res) => {
  const { blogId } = req.params;
  await checkMandatoryFields({ blogId });

  const query = `
  SELECT * FROM xx_blog
  JOIN xx_blog_details 
  ON xx_blog.id = xx_blog_details.blogid where xx_blog.id =?;
  `;
  await db.query(query, [blogId], (error, response) => {
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

exports.getAllBlogTags = async (req, res) => {
  const query = `SELECT * FROM xx_blog_tag`;

  await db.query(query, (error, response) => {
    if (error) {
      return res.json({
        status: false,
        message: "something went wrong",
        error: error,
      });
    } else {
      return res.json({
        status: true,
        message: "blog tags",
        data: response,
      });
    }
  });
};

exports.addBlogTag = async (req, res) => {
  const { site, tag, url, title } = req.body;
  await checkMandatoryFields(res, { site, tag, url, title });

  const query = `INSERT INTO xx_blog_tag SET site=?,tag=?, url=?,title=?`;
  const values = [site, tag, url, title];

  await db.query(query, values, (error, response) => {
    if (error) {
      return res.json({
        status: false,
        message: "something went wrong",
        error: error,
      });
    } else if (response.affectedRows > 0) {
      return res.json({
        status: false,
        message: "tag added",
      });
    }
  });
};

exports.addBlogImage = async (req, res) => {
  uploadBlogImg(req, res, function (error) {
    if (error) {
      return res.json({
        status: false,
        message: "something went wrong",
        error: error,
      });
    }
    const imageName = req.file.filename;
    return res.json({
      status: true,
      message: "something went wrong",
      data: imageName,
    });
  });
};

exports.deleteBlogImage = async (req, res) => {
  const { blogImage } = req.params;
  const imagePath = `./public/blog/${blogImage}`;

  fs.unlink(imagePath, (error) => {
    if (error) {
      return res.json({
        status: false,
        message: "something went wrong",
        error: error,
      });
    }
    return res.json({
      status: true,
      message: "image removed successfully",
    });
  });
};

// ============ SECTION APIS ============ //
exports.removeBlogSection = async (req, res) => {
  const { sectionId } = req.params;

  if (!sectionId) {
    return res.json({
      status: false,
      message: "please provide section id",
    });
  }

  const query = `DELETE FROM xx_blog_details WHERE id=?`;
  const values = [sectionId];
  await db.query(query, values, (error, response) => {
    if (error) {
      return res.json({
        status: false,
        message: "something went wrong",
      });
    } else if (response.affectedRows > 0) {
      return res.json({
        status: true,
        message: "section removed successfully",
      });
    } else if (response.affectedRows == 0) {
      return res.json({
        status: true,
        message: "please provide valid sectionId",
      });
    }
  });
};

exports.editSection = async (req, res) => {
  const { sectionId } = req.params;
  let { heading, sort, image, section, date, site } = req.body;

  const query = `UPDATE xx_blog_details SET heading=? ,sort=? ,image=? ,section=? ,date=? ,site=?  WHERE id=${sectionId}`;
  const values = [
    heading,
    sort,
    image,
    section,
    date,
    (site = site == undefined ? (site = "") : site),
    sectionId,
  ];

  const completeQuery = query.replace(/\?/g, (m) => {
    const value = values.shift();
    return typeof value === "string" ? `'${value}'` : value;
  });

  db.query(completeQuery, async (error, response) => {
    if (error) {
      return res.json({
        status: false,
        message: "something went wrong",
        error,
      });
    }

    if (response.affectedRows > 0) {
      return res.json({
        status: true,
        message: "record updated successfully",
      });
    } else if (response.affectedRows == 0) {
      return res.json({
        status: false,
        message: "invalid section id",
      });
    }
  });
};

exports.getSectionByBlog = async (req, res) => {
  const { blogId } = req.params;
  await checkMandatoryFields({ blogId });

  const query = `SELECT * FROM xx_blog_details where blogid=?`;
  await db.query(query, [blogId], (error, response) => {
    if (error) {
      return res.json({
        status: false,
        message: "something went wrong",
        error: error,
      });
    } else {
      return res.json({
        status: true,
        message: "blog section details",
        data: response,
      });
    }
  });
};

exports.getSection = async (req, res) => {
  const { sectionId } = req.params;
  await checkMandatoryFields({ sectionId });

  const query = `SELECT * FROM xx_blog_details join xx_blog on xx_blog.id = xx_blog_details.blogid where xx_blog_details.id=?`;
  await db.query(query, [sectionId], (error, response) => {
    if (error) {
      return res.json({
        status: false,
        message: "something went wrong",
        error: error,
      });
    } else {
      return res.json({
        status: true,
        message: "section details",
        data: response,
      });
    }
  });
};
