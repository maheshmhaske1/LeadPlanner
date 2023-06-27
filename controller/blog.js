const db = require("../model/db");
const fs = require("fs");
const { uploadBlogImg } = require("../model/upload");
const { checkMandatoryFields } = require("../model/validators");
const SQL = require('../model/sqlhandler')

exports.addBlog = async (req, res) => {
  try {
    const { title, url, description, route, image, site, tag, date, sections } = req.body;

    if (!title || !url || !description || !tag || !date) {
      return res.json({
        status: false,
        message: " title, url, description, image, tag, date are required fields"
      })
    }

    SQL.insert('xx_blog', { title, url, site, description, route, image, tag, date }, (error, results) => {
      if (error) {
        return res.json({
          status: false,
          error: error
        })
      }

      if (results.affectedRows > 0) {
        const blogId = results.insertId
        sections.forEach(async (section) => {
          section["blogid"] = results.insertId
          await SQL.insert('xx_blog_details', section, (error, results) => {
            if (error) {
              return res.json({
                status: false,
                error: error
              })
            }
          })
        })
        return res.json({
          status: true,
          message: 'blog added',
          data: { blogId: blogId }
        })
      }
    });
  }
  catch (error) {
    return res.json({
      status: false,
      message: "something went wrong",
      error: error
    })
  }
};

exports.getBlogs = async (req, res) => {
  try {
    SQL.get(`xx_blog`, ``, ``, (error, results) => {
      if (error) {
        return res.json({
          status: false,
          error: error
        })
      }
      return res.json({
        status: true,
        message: "blog details",
        data: results
      })
    });
  }
  catch (error) {
    return res.json({
      status: false,
      message: "something went wrong",
      error: error
    })
  }
};

exports.editBlog = async (req, res) => {
  try {
    const { blogId } = req.params
    console.log(blogId)

    const { title, url, description, route, image, tag, date, sections } = req.body

    console.log(sections)
    let new_section = []
    SQL.update("xx_blog", { title, url, description, route, image, tag, date }, `id=${blogId}`, (error, response) => {
      if (error) {
        return res.json({
          status: false,
          message: 'something went wrong -1', error
        })
      }
      else {
        if (sections)
          sections.map(async (section) => {
            if (section.id)
              await SQL.update('xx_blog_details', section, `id=${section.id}`, (error, response) => {
                if (error) {
                  return res.json({
                    status: false,
                    message: 'something went wrong -2'.error
                  })
                }
              })
            if (!section.id) {
              section["blogId"] = parseInt(blogId)
              console.log("section no id", section)
              await SQL.insert('xx_blog_details', section, (error, results) => {
                if (error) {
                  return res.json({
                    status: false,
                    error: error
                  })
                }
              })
            }
          })
        return res.json({
          status: true,
          message: "blog details updated successfully"
        })
      }
    })
  }
  catch (error) {
    return res.json({
      status: false,
      message: "something went wrong",
      error: error
    })
  }
};

exports.getBlog = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    SQL.get('xx_blog', '', `id=${blogId}`, (error, results) => {
      if (error) {
        return res.json({
          status: false,
          error: error
        })
      }
      return res.json({
        status: true,
        message: "blog details",
        data: results
      })
    });
  }
  catch (error) {
    return res.json({
      status: false,
      message: "something went wrong",
      error: error
    })
  }
};

exports.getAllBlogTags = async (req, res) => {
  try {
    SQL.get('xx_blog_tag', '', ``, (error, results) => {
      if (error) {
        return res.json({
          status: false,
          error: error
        })
      }
      return res.json({
        status: true,
        message: "blog tags details",
        data: results
      })
    });
  }
  catch (error) {
    return res.json({
      status: false,
      message: "something went wrong",
      error: error
    })
  }
};

exports.addBlogTag = async (req, res) => {
  try {

    const { site, tag, url, title } = req.body;
    await checkMandatoryFields(res, { site, tag, url, title });

    SQL.insert('xx_blog_tag', req.body, (error, results) => {
      if (error) {
        return res.json({
          status: false,
          error: error
        })
      }
      if (results.affectedRows > 0) {
        return res.json({
          status: true,
          message: 'tags added successfully'
        })
      }
    });
  }
  catch (error) {
    return res.json({
      status: false,
      message: "something went wrong",
      error: error
    })
  }
};

// ============ BLOG IMAGES ============ //

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
      message: "image added successfully",
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

exports.editSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const update_data = req.body

    if (update_data.id) {
      return res.json({
        status: false,
        message: "id cannot be edit"
      })
    }

    SQL.update('xx_blog_details', update_data, `id=${sectionId}`, (error, results) => {
      if (error) {
        return res.json({
          status: false,
          error: error
        })
      }
      if (results.affectedRows > 0) {
        return res.json({
          status: true,
          message: 'section details updated successfully'
        })
      }
    })
  }
  catch (error) {
    return res.json({
      status: false,
      message: "something went wrong",
      error: error
    })
  }
};

exports.getSectionByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    await checkMandatoryFields({ blogId });
    SQL.get('xx_blog_details', '', `blogid=${blogId}`, (error, results) => {
      if (error) {
        return res.json({
          status: false,
          error: error
        })
      }
      return res.json({
        status: true,
        message: "blog sections details",
        data: results
      })
    });
  }
  catch (error) {
    return res.json({
      status: false,
      message: "something went wrong",
      error: error
    })
  }
};

