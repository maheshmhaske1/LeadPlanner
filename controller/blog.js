const db = require("../model/db");
const fs = require("fs");
const { uploadBlogImg } = require("../model/upload");
const { checkMandatoryFields } = require("../model/validators");
const SQL = require('../model/sqlhandler');
const { json } = require("express");

exports.addBlog = async (req, res) => {
  try {
    const { title, url, description, route, image, site, tag, date, sections } = req.body;

    if (!title || !url || !description || !tag || !date) {
      return res.json({
        status: 0,
        message: " title, url, description, image, tag, date are required fields"
      })
    }

    if (req.body.id || req.body.creation_date || req.body.update_date)
      return res.json({
        status: 0,
        message: "id ,creation_date ,update_date cannot be add",
      });

    SQL.insert('xx_blog', { title, url, site, description, route, image, tag, date }, (error, results) => {
      if (error) {
        return res.json({
          status: 0,
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
                status: 0,
                error: error
              })
            }
          })
        })
        return res.json({
          status: 1,
          message: 'blog added',
          data: { blogId: blogId }
        })
      }
    });
  }
  catch (error) {
    return res.json({
      status: 0,
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
          status: 0,
          error: error
        })
      }
      return res.json({
        status: 1,
        message: "blog details",
        data: results
      })
    });
  }
  catch (error) {
    return res.json({
      status: 0,
      message: "something went wrong",
      error: error
    })
  }
};

exports.editBlog = async (req, res) => {
  try {
    const { blogId } = req.params
    const { title, url, description, site, route, image, tag, date, sections } = req.body

    if (!blogId) {
      return res, json({
        status: 0,
        message: "please provide blogId"
      })
    }

    if (req.body.id || req.body.creation_date || req.body.update_date) {
      return res.json({
        status: 0,
        message: "id ,creation_date ,update_date cannot be edit",
      });
    }

    let new_section = []
    SQL.update("xx_blog", { title, url, description, route, site, image, tag, date }, `id=${blogId}`, (error, response) => {
      if (error) {
        return res.json({
          status: 0,
          message: 'something went wrong ', error
        })
      }
      else {
        if (sections)
          sections.map(async (section) => {
            if (section.id)
              await SQL.update('xx_blog_details', section, `id=${section.id}`, (error, response) => {
                if (error) {
                  return res.json({
                    status: 0,
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
                    status: 0,
                    error: error
                  })
                }
              })
            }
          })
        return res.json({
          status: 1,
          message: "blog details updated successfully"
        })
      }
    })
  }
  catch (error) {
    return res.json({
      status: 0,
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
          status: 0,
          error: error
        })
      }
      return res.json({
        status: 1,
        message: "blog details",
        data: results
      })
    });
  }
  catch (error) {
    return res.json({
      status: 0,
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
          status: 0,
          error: error
        })
      }
      return res.json({
        status: 1,
        message: "blog tags details",
        data: results
      })
    });
  }
  catch (error) {
    return res.json({
      status: 0,
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
          status: 0,
          error: error
        })
      }
      if (results.affectedRows > 0) {
        return res.json({
          status: 1,
          message: 'tags added successfully'
        })
      }
    });
  }
  catch (error) {
    return res.json({
      status: 0,
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
        status: 0,
        message: "something went wrong",
        error: error,
      });
    }
    const imageName = req.file.filename;
    return res.json({
      status: 1,
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
        status: 0,
        message: "something went wrong",
        error: error,
      });
    }
    return res.json({
      status: 1,
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
        status: 0,
        message: "id cannot be edit"
      })
    }

    SQL.update('xx_blog_details', update_data, `id=${sectionId}`, (error, results) => {
      if (error) {
        return res.json({
          status: 0,
          error: error
        })
      }
      if (results.affectedRows > 0) {
        return res.json({
          status: 1,
          message: 'section details updated successfully'
        })
      }
    })
  }
  catch (error) {
    return res.json({
      status: 0,
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
          status: 0,
          error: error
        })
      }
      return res.json({
        status: 1,
        message: "blog sections details",
        data: results
      })
    });
  }
  catch (error) {
    return res.json({
      status: 0,
      message: "something went wrong",
      error: error
    })
  }
};

