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
    if (loggedInUser.role_name !== "blogger" && loggedInUser.role_name !== "admin") {
      return res.json({
        status: 0,
        message: "you need to login ad blogger or admin",
      })
    }

    let { title, url, description, route, image, site, tag, date, sections, org_id } = req.body;

    if (!title || !url || !description || !tag || !date || !sections || !org_id) {
      return res.json({
        status: 0,
        message: " title, url, description, image, tag, date, sections, org_id are required fields"
      })
    }

    if (req.body.id || req.body.creation_date || req.body.update_date)
      return res.json({
        status: 0,
        message: "id ,creation_date ,update_date cannot be add",
      });

    const data = sections
    delete req.body.sections

    SQL.get('user', ``, `id=${loggedInUser.id}`, (error, result) => {
      if (error) {
        return res.json({
          status: 0,
          message: error
        })
      }

      if (result.length == 0) {
        return res.json({
          status: 0,
          message: "user not present"
        })
      }

      const userEmail = result[0].email
      req.body.created_by = userEmail
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
                      "${!data[i].site ? "" : data[i].site}",
                      ${blogId},
                      "${!data[i].heading ? "" : data[i].heading}",
                      "${!data[i].section ? "" : data[i].section}",
                      "${!data[i].image ? "" : data[i].image}",
                      "${!data[i].alt ? "" : data[i].alt}",
                       ${!data[i].sort ? "" : data[i].sort});`;
            if (data.length === i + 1) {
              addBlogSections()
            }
          }

          async function addBlogSections() {
            // console.log(query)
            await dbB.query(query, (error, result) => {
              if (error) {
                return res.json({
                  status: 0,
                  message: error
                })
              }
            })
          }

          let updatedUrl = `${url}-bid-${blogId}`
          SQL.update('xx_blog', { url: updatedUrl }, `id=${blogId}`, (error, result) => {
            if (error) {
              return res.json({
                status: 0,
                message: error
              })
            }
            return res.json({
              status: 1,
              message: 'blog added',
              data: { blogId: blogId }
            })
          })
        }
      });
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

exports.getBlogs = async (req, res) => {
  try {

    const loggedInUser = req.decoded
    if (!loggedInUser) {
      return res.json({
        status: 0,
        message: "Not Authorized",
      })
    }

    if (loggedInUser.role_name !== "blogger" && loggedInUser.role_name !== "admin") {
      return res.json({
        status: 0,
        message: "you need to login ad blogger or admin",
      })
    }

    const { siteName, org_id } = req.body

    if (!siteName || !org_id) {
      return res.json({
        status: 0,
        message: "site name and org_id are required field"
      })
    }

    let query = `
    SELECT b.*,COUNT(d.blogid) AS section_count
    FROM xx_blog AS b
    LEFT JOIN xx_blog_details AS d
    ON b.id = d.blogid
    WHERE b.site="${siteName}" AND b.org_id=${org_id}
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

    if (loggedInUser.role_name !== "blogger" && loggedInUser.role_name !== "admin") {
      return res.json({
        status: 0,
        message: "you need to login ad blogger or admin",
      })
    }

    const { blogId } = req.params;
    const { title, url, description, site, route, image, tag, date, sections, meta_description, keywords,sport } = req.body;

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

    let new_section = [];
    SQL.update("xx_blog", { title, url, description, route, site, image, tag, date, meta_description, keywords,sport }, `id=${blogId}`, async (error, response) => {
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

    if (loggedInUser.role_name !== "blogger" && loggedInUser.role_name !== "admin") {
      return res.json({
        status: 0,
        message: "you need to login ad blogger or admin",
      })
    }

    const { blogId } = req.params;

    SQL.get('xx_blog', '', `id=${blogId}`, (error, results) => {
      if (error) {
        return res.json({
          status: 0,
          error: error
        })
      }

      dbB.query(`SELECT COUNT(*) AS MatchCount FROM xx_log WHERE attr2 =${blogId}`, (error, result) => {
        return res.json({
          status: 1,
          message: "blog details",
          data: results,
          views: result[0].MatchCount
        })
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

exports.getTagCategory = async (req, res) => {
  try {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
      return res.json({
        status: 0,
        message: "Not Authorized",
      })
    }

    if (loggedInUser.role_name !== "blogger" && loggedInUser.role_name !== "admin") {
      return res.json({
        status: 0,
        message: "you need to login ad blogger or admin",
      })
    }

    const { org_id } = req.params

    const query = `SELECT DISTINCT category FROM xx_blog_tag WHERE category IS NOT NULL AND org_id = ${org_id}`

    dbB.query(query, (error, result) => {
      if (error) {
        return res.json({
          status: 0,
          error: error
        })
      }
      return res.json({
        status: 1,
        message: "tag Categories",
        data: result
      })
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


exports.getAllBlogTags = async (req, res) => {
  try {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
      return res.json({
        status: 0,
        message: "Not Authorized",
      })
    }

    if (loggedInUser.role_name !== "blogger" && loggedInUser.role_name !== "admin") {
      return res.json({
        status: 0,
        message: "you need to login ad blogger or admin",
      })
    }

    let { sport, condition, org_id } = req.body

    if (!org_id) {
      return res.json({
        status: 0,
        message: "org_id is required",
      })
    }

    let queryCondition = `org_id=${org_id}`

    if (condition === "sport") {
      if (!sport) {
        return res.json({
          status: 0,
          message: "sport is required field"
        })
      }
      queryCondition = `sport="${sport}" AND org_id=${org_id}`
    }


    SQL.get('xx_blog_tag', '', queryCondition, (error, results) => {
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

exports.getTagsByIds = async (req, res) => {
  const { ids } = req.body
  const query = `select * from xx_blog_tag where id in (${ids})`

  db.query(query, (error, result) => {
    if (error) {
      return res.json({
        status: 0,
        error: error
      })
    }
    return res.json({
      status: 1,
      message: "tags",
      data: result
    })
  })
}

exports.getBlogTagsBySite = async (req, res) => {
  try {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
      return res.json({
        status: 0,
        message: "Not Authorized",
      })
    }

    const { siteName, org_id } = req.params

    if (!siteName, !org_id) {
      return res.json({
        status: 0,
        message: "siteName,org_id are required field",
      })
    }

    if (loggedInUser.role_name !== "blogger" && loggedInUser.role_name !== "admin") {
      return res.json({
        status: 0,
        message: "you need to login ad blogger or admin",
      })
    }

    SQL.get('xx_blog_tag', '', `site="${siteName}" AND org_id=${org_id}`, (error, results) => {
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

    if (loggedInUser.role_name !== "blogger" && loggedInUser.role_name !== "admin") {
      return res.json({
        status: 0,
        message: "you need to login ad blogger or admin",
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
    if (loggedInUser.role_name !== "blogger" && loggedInUser.role_name !== "admin") {
      return res.json({
        status: 0,
        message: "you need to login ad blogger or admin",
      })
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

    if (loggedInUser.role_name !== "blogger" && loggedInUser.role_name !== "admin") {
      return res.json({
        status: 0,
        message: "you need to login ad blogger or admin",
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

exports.addSection = async (req, res) => {
  try {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
      return res.json({
        status: 0,
        message: "Not Authorized",
      })
    }

    if (loggedInUser.role_name !== "blogger" && loggedInUser.role_name !== "admin") {
      return res.json({
        status: 0,
        message: "you need to login ad blogger or admin",
      })
    }
    const { blogId } = req.params;
    let { heading, sort, image, section, date } = req.body

    if (!heading || !sort || !section) {
      return res.json({
        status: 0,
        message: "heading,sort and section are required fields",
      })
    }


    SQL.get('xx_blog', ``, `id=${blogId}`, (error, results) => {
      if (error) {
        return res.json({
          status: 0,
          message: error
        })
      }
      if (results.length === 0) {
        return res.json({
          status: 1,
          message: 'invalid blogId'
        })
      }
      req.body.blogId = blogId
      SQL.insert('xx_blog_details', req.body, (error, result) => {
        if (error) {
          return res.json({
            status: 0,
            message: error
          })
        }
        return res.json({
          status: 1,
          message: "section Added successfully.",
          data: result
        })
      })
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
    if (loggedInUser.role_name !== "blogger" && loggedInUser.role_name !== "admin") {
      return res.json({
        status: 0,
        message: "you need to login ad blogger or admin",
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


