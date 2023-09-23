// const db = require("../model/db");
const { db, dbB } = require('../model/db');
const fs = require("fs");
const { uploadBlogImg } = require("../model/upload");
const { checkMandatoryFields } = require("../model/validators");
const SQL = require('../model/sqlhandler');
const { json, query } = require("express");

exports.addBlog = async (req, res) => {
  try {

    const loggedInUser = req.decoded
    if (!loggedInUser) {
      return res.json({
        status: 0,
        message: "Not Authorized",
      })
    }

    const { title, url, description, route, image, site, tag, date, sections } = req.body;

    if (!title || !url || !description || !tag || !date || !sections) {
      return res.json({
        status: 0,
        message: " title, url, description, image, tag, date, sections are required fields"
      })
    }

    if (req.body.id || req.body.creation_date || req.body.update_date)
      return res.json({
        status: 0,
        message: "id ,creation_date ,update_date cannot be add",
      });

    const data = sections
    delete req.body.sections

    SQL.insert('xx_blog', req.body, async (error, results) => {
      if (error) {
        return res.json({
          status: 0,
          message: error
        })
      }

      if (results.affectedRows > 0) {
        const blogId = results.insertId

        let query = ``
        for (let i = 0; i < data.length; i++) {
          query += `
            INSERT INTO xx_blog_details (site, blogid, heading, section, image, alt, sort)
            VALUES (
                    '${!data[i].site ? '' : data[i].site}',
                     ${blogId},
                    '${!data[i].heading ? '' : data[i].heading}',
                    '${!data[i].section ? '' : data[i].section}',
                    '${!data[i].image ? '' : data[i].image}',
                    '${!data[i].alt ? '' : data[i].alt}',
                    '${!data[i].sort ? '' : data[i].sort}');`;
        }
        await dbB.query(query, (error, result) => {
          if (error) {
            return res.json({
              status: 0,
              message: error
            })
          }
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
    console.error(error); // Log any unexpected errors for debugging

    return res.json({
      status: 0,
      message: "something went wrong",
      error: error
    })
  }
};

exports.getBlogs = async (req, res) => {
  try {

    const loggedInUser = req.decoded
    if (!loggedInUser) {
      return res.json({
        status: 0,
        message: "Not Authorized",
      })
    }

    let query = `
    SELECT b.*,COUNT(d.blogid) AS section_count
    FROM xx_blog AS b
    LEFT JOIN xx_blog_details AS d
    ON b.id = d.blogid
    GROUP BY b.id
    ORDER BY b.id DESC;`

    dbB.query(query, (error, result) => {
      if (error) {
        return res.json({
          status: 0,
          error: error
        })
      }
      return res.json({
        status: 1,
        message: "blog details",
        data: result
      })
    })
    // SQL.get(`xx_blog`, ``, ``, (error, results) => {
    //   if (error) {
    //     return res.json({
    //       status: 0,
    //       error: error
    //     })
    //   }
    //   return res.json({
    //     status: 1,
    //     message: "blog details",
    //     data: results
    //   })
    // });
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
    const loggedInUser = req.decoded
    if (!loggedInUser) {
      return res.json({
        status: 0,
        message: "Not Authorized",
      })
    }
    const { blogId } = req.params;
    const { title, url, description, site, route, image, tag, date, sections } = req.body;

    if (!blogId) {
      return res.json({
        status: 0,
        message: "please provide blogId"
      });
    }

    if (req.body.id || req.body.creation_date || req.body.update_date) {
      return res.json({
        status: 0,
        message: "id, creation_date, update_date cannot be edited",
      });
    }

    const update_sections = sections
    delete req.body.sections
    let new_section = [];
    SQL.update("xx_blog", req.body, `id=${blogId}`, async (error, response) => {
      if (error) {
        return res.json({
          status: 0,
          message: 'something went wrong',
          error: error
        });
      } else {
        if (sections) {
          for (const section of sections) {
            if (section.id) {
              await SQL.update('xx_blog_details', section, `id=${section.id}`, (error, response) => {
                if (error) {
                  console.error('something went wrong -2', error);
                }
              });
            } else {
              section["blogId"] = parseInt(blogId);
              console.log("section no id", section);
              await SQL.insert('xx_blog_details', section, (error, results) => {
                if (error) {
                  console.error('something went wrong', error);
                }
              });
            }
          }
        }
        return res.json({
          status: 1,
          message: "blog details updated successfully"
        });
      }
    });
  } catch (error) {
    return res.json({
      status: 0,
      message: "something went wrong",
      error: error
    });
  }
};

exports.getBlog = async (req, res) => {
  try {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
      return res.json({
        status: 0,
        message: "Not Authorized",
      })
    }
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
    const loggedInUser = req.decoded
    if (!loggedInUser) {
      return res.json({
        status: 0,
        message: "Not Authorized",
      })
    }
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
    const loggedInUser = req.decoded
    if (!loggedInUser) {
      return res.json({
        status: 0,
        message: "Not Authorized",
      })
    }
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
    const loggedInUser = req.decoded
    if (!loggedInUser) {
      return res.json({
        status: 0,
        message: "Not Authorized",
      })
    }
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
    const loggedInUser = req.decoded
    if (!loggedInUser) {
      return res.json({
        status: 0,
        message: "Not Authorized",
      })
    }
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

