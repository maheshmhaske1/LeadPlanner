const { dbB } = require('../model/db');
const SQL = require('../model/sqlhandlermaster')
const jwt = require('jsonwebtoken')
const axios = require('axios');
// const cloudinary = require('cloudinary').v2;
const dotenv = require("dotenv").config();
const { JWT_TOKEN, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY, MAP_API_KEY } = process.env;

// ======== CLOUDINARY CONFIG ======== //
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

// exports.login = async (req, res) => {

//     const { username, otp } = req.body;
//     if (!username || !otp) {
//         return res.json({
//             status: 0,
//             message: "username and password are required fields."
//         })
//     }

//     SQL.get('bmp_user', ['id', 'type_id', 'type', 'name', 'email', 'phone', 'parent_id'], `phone = '${username}' OR email = '${username}'`, async (error, results) => {
//         if (error) {
//             return res.json({
//                 status: 0,
//                 message: "Something went wrong",
//             })
//         }

//         if (results.length == 0) {
//             return res.json({
//                 status: 0,
//                 message: "user not found"
//             })
//         }

//         if (otp != 1111) {
//             return res.json({
//                 status: 0,
//                 message: "invalid otp"
//             })
//         }
        

//         const token = await jwt.sign({ id: results[0].id, phone: results[0].phone, type: results[0].type, type_id: results[0].type_id }, JWT_TOKEN, { expiresIn: '10d' });
//         return res.json({
//             status: 1,
//             message: "Logged in",
//             landingurl: "/lp/bmp",
//             permissions: "/lp/bmp/overview,/lp/bmp/fees,/lp/bmp/training,/lp/bmp/gallery",
//             user: results[0],
//             token: token
//         })

//     })

// };

exports.login = async (req, res) => {

    const { username, otp } = req.body;
    if (!username || !otp) {
        return res.json({
            status: 0,
            message: "username and password are required fields."
        })
    }

    SQL.get('bmp_user', ['id', 'type_id', 'type', 'name', 'email', 'phone', 'parent_id'], `phone = '${username}' OR email = '${username}'`, async (error, results) => {
        if (error) {
            return res.json({
                status: 0,
                message: "Something went wrong",
            })
        }

        if (results.length == 0) {
            return res.json({
                status: 0,
                message: "user not found"
            })
        }

        if (otp != 1111) {
            return res.json({
                status: 0,
                message: "invalid otp"
            })
        }

        let landingUrl = ``
        let permissions = ``
results[0].type_id == 2 ? landingUrl = "/lp/bmp/overview" : results[0].type_id == 0 ? landingUrl = "/lp/bmp/admin" : ""
results[0].type_id == 2 ? permissions = "/lp/bmp,/lp/bmp/fees,/lp/bmp/training,/lp/bmp/gallery,/lp/bmp/reviews,/lp/bmp/leads,/lp/bmp/support,/lp/bmp/help" : results[0].type_id == 0 ? permissions = "/lp/bmp,/lp/bmp/overview,/lp/bmp/fees,/lp/bmp/training,/lp/bmp/gallery,/lp/bmp/reviews,/lp/bmp/leads,/lp/bmp/support,/lp/bmp/help" : ""

        const token = await jwt.sign({ id: results[0].id, phone: results[0].phone, type: results[0].type, type_id: results[0].type_id }, JWT_TOKEN, { expiresIn: '10d' });
        return res.json({
            status: 1,
            message: "Logged in",
            landingurl: landingUrl,
            permissions: permissions,
            user: results[0],
            token: token
        })

    })

};

exports.getUser = async (req, res) => {

    const { userId } = req.body;
    if (!userId) {
        return res.json({
            status: 0,
            message: "userId is required fields."
        })
    }

    SQL.get('bmp_user', ``, `id = ${userId}`, async (error, results) => {
        if (error) {
            return res.json({
                status: 0,
                message: "Something went wrong",
            })
        }

        if (results.length == 0) {
            return res.json({
                status: 0,
                message: "user not found"
            })
        }

        return res.json({
            status: 1,
            message: "User Details",
            user: results[0]
        })

    })

};

// =========== Academy Apis ========== //
exports.addAcademyDetails = async (req, res) => {
    try {
        let { name, url, sport, phone, address1, address2, city, state, postcode, map, website, facebook, instagram, logo, profile_image, photos, about, brochure
        } = req.body
        req.body.org_id = 3

        const missingFields = [];

        ['name', 'url', 'sport', 'phone', 'address1', 'city', 'state', 'postcode', 'map', 'logo', 'photos', 'about', 'brochure'
        ].forEach(fieldName => {
            if (!req.body[fieldName]) {
                missingFields.push(fieldName);
            }
        });

        if (missingFields.length > 0) {
            const missingFieldsString = missingFields.join(', ');
            return res.json({
                status: 0,
                message: `Missing fields: ${missingFieldsString}`
            });
        }

        SQL.insert('bmp_academy_details', req.body, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            if (result.affectedRows > 0) {
                return res.status(200).json({
                    status: 1,
                    message: 'Academy details added successfully',
                    data: result
                });
            }
        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

exports.getAcademyByOrg = async (req, res) => {

    const { user_id } = req.params

    try {
        SQL.get('bmp_academy_details', ``, `id=${user_id}`, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            return res.status(200).json({
                status: 1,
                message: 'Academy details',
                data: result
            });

        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

exports.updateAcademy = async (req, res) => {

    try {
        const { academy_id } = req.params
        const update_data = req.body;

        if (Object.keys(update_data).length === 0) {
            return res.status(400).json({
                status: 0,
                message: "No fields to update."
            });
        }

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.status(400).json({
                status: 0,
                message: "id, creation_date, and update_date cannot be edited"
            });
        }

        SQL.get('bmp_academy_details', ``, `id=${academy_id}`, (error, results) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            if (results.length == 0) {
                return res.status(500).json({
                    status: 0,
                    message: "invalid Academy"
                });
            }

            SQL.update('bmp_academy_details', update_data, `id=${academy_id}`, (error, results) => {
                if (error) {
                    return res.status(500).json({
                        status: 0,
                        message: error
                    });
                }
                if (results.affectedRows > 0) {
                    return res.status(200).json({
                        status: 1,
                        message: 'Academy details updated successfully'
                    });
                }
            });
        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

// =========== Batches and Fees Apis ========== //
exports.addBatchDetails = async (req, res) => {
    try {
        const { age_group, weekly_days, timing, fees, title, object_id, object_type } = req.body

        const missingFields = [];

        ['age_group', 'weekly_days', 'timing', 'fees', 'title', 'object_id', 'object_type'].forEach(fieldName => {
            if (!req.body[fieldName]) {
                missingFields.push(fieldName);
            }
        });

        if (missingFields.length > 0) {
            const missingFieldsString = missingFields.join(', ');
            return res.json({
                status: 0,
                message: `Missing fields: ${missingFieldsString}`
            });
        }

        // SQL.get('bmp_academy_details', ``, `id=${academy_id}`, (error, results) => {
        //     if (error) {
        //         return res.status(500).json({
        //             status: 0,
        //             message: error
        //         });
        //     }
        //     if (results.length == 0) {
        //         return res.status(200).json({
        //             status: 1,
        //             message: 'Academy not found.'
        //         });
        //     }
        SQL.insert('bmp_batches', req.body, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            return res.json({
                status: 1,
                message: "batch added successfully."
            });
        })
        // })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message
        });
    }
}

exports.getBatch = async (req, res) => {

    const { object_id, object_type } = req.body

    try {
        SQL.get('bmp_batches', ``, `object_id=${object_id} AND object_type="${object_type}" AND is_deleted=0`, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            return res.status(200).json({
                status: 1,
                message: 'Batch details',
                data: result
            });

        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

exports.updateBatch = async (req, res) => {

    try {
        const { batchId } = req.params
        const update_data = req.body;

        if (Object.keys(update_data).length === 0) {
            return res.status(400).json({
                status: 0,
                message: "No fields to update."
            });
        }

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.status(400).json({
                status: 0,
                message: "id, creation_date, and update_date cannot be edited"
            });
        }

        SQL.get('bmp_batches', ``, `id=${batchId}`, (error, results) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            if (results.length == 0) {
                return res.status(500).json({
                    status: 0,
                    message: "invalid Batch"
                });
            }

            SQL.update('bmp_batches', update_data, `id=${batchId}`, (error, results) => {
                if (error) {
                    return res.status(500).json({
                        status: 0,
                        message: error
                    });
                }
                if (results.affectedRows > 0) {
                    return res.status(200).json({
                        status: 1,
                        message: 'Batch details updated successfully'
                    });
                }
            });
        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

// =========== award and achievement Apis ========== //
exports.createAward = async (req, res) => {
    try {
        const { tournament_name, object_id, object_type, rank, achievement } = req.body

        if (!tournament_name || !object_id || !object_type || !rank || !achievement) {
            return res.status(400).json({
                status: 0,
                message: "tournament_name,object_id,object_type,rank,achievement are required fields"
            });
        }

        SQL.insert('bmp_award_achievement', req.body, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            return res.status(200).json({
                status: 1,
                message: "achievement created successfully",
                data: result
            });
        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

exports.getAllAwards = async (req, res) => {
    try {
        const { object_type, object_id } = req.body
        if (!object_type || !object_id) {
            return res.status(400).json({
                status: 0,
                message: "object_type and object_id are required"
            })
        }
        SQL.get('bmp_award_achievement', ``, `object_id=${object_id} AND object_type="${object_type}"`, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            return res.status(200).json({
                status: 1,
                message: 'Academy achievements',
                data: result
            });
        })
    }
    catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

exports.getAwardById = async (req, res) => {
    try {
        const { id } = req.params
        SQL.get('bmp_award_achievement', ``, `id=${id}`, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            return res.status(200).json({
                status: 1,
                message: 'Academy achievement',
                data: result
            });
        })
    }
    catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

exports.updateAward = async (req, res) => {
    try {
        const { id } = req.params
        const update_data = req.body;

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.status(400).json({
                status: 0,
                message: "id, creation_date, and update_date cannot be edited"
            });
        }

        SQL.update('bmp_award_achievement', update_data, `id=${id}`, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            return res.status(200).json({
                status: 1,
                message: 'Academy achievement updated successfully'
            });
        })
    }
    catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

// =========== bmp leads Apis ========== //
exports.getAcademyLeads = async (req, res) => {

    const { academy_id, object_type } = req.params

    try {
        SQL.get('bmp_leads', ``, `object_id=${academy_id} AND object_type="${object_type}"`, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            return res.status(200).json({
                status: 1,
                message: 'Academy leads',
                data: result
            });

        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

exports.getTotalReviews = async (req, res) => {

    try {

        const { object_type, object_id } = req.body
        if (!object_type || !object_id) {
            return res.status(400).json({
                status: 0,
                message: "object_type and object_id are required"
            })
        }

        const query = `SELECT r.*,
        COALESCE(reply_count, 0) AS total_reply
        FROM bmp_reviews r
        LEFT JOIN(SELECT parent_id,COUNT(*) AS reply_count
        FROM bmp_reviews
        WHERE parent_id IS NOT NULL
        GROUP BY parent_id) 
        subq
        ON r.id = subq.parent_id
        WHERE r.parent_id IS NULL AND object_type = "${object_type}" AND object_id = ${object_id};`

        dbB.query(query, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            return res.status(200).json({
                status: 1,
                message: 'Academy reviews',
                data: result
            });
        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

exports.getReviewReply = async (req, res) => {

    try {

        const { review_id } = req.body
        if (!review_id) {
            return res.status(400).json({
                status: 0,
                message: "review_id is required"
            })
        }

        const query = `SELECT * from bmp_reviews WHERE parent_id = ${review_id};`

        dbB.query(query, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            return res.status(200).json({
                status: 1,
                message: 'Academy review reply',
                data: result
            });
        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

exports.addReviewReply = async (req, res) => {

    try {

        const { parent_id, type, object_type, object_id, name, comment, status } = req.body
        if (!parent_id || !type || !object_type || !object_id || !name || !comment || !status) {
            return res.status(400).json({
                status: 0,
                message: "parent_id, type, object_type, object_id, name, comment, status are required"
            })
        }

        SQL.insert('bmp_reviews', req.body, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            return res.status(200).json({
                status: 1,
                message: 'Academy review reply added successfully',
                data: result
            })
        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

exports.getReviewReport = async (req, res) => {

    try {

        const { object_type, object_id } = req.body
        if (!object_type || !object_id) {
            return res.status(400).json({
                status: 0,
                message: "object_type and object_id are required"
            })
        }

        const query = `SELECT
        ROUND(AVG(rating), 1) AS overall_stars,
        COUNT(*) AS total_reviews,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS total_1_stars,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS total_2_stars,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS total_3_stars,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS total_4_stars,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS total_5_stars
        FROM bmp_reviews
        WHERE rating >= 1 AND rating <= 5 AND object_type = "${object_type}" AND object_id = ${object_id};`

        dbB.query(query, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            return res.status(200).json({
                status: 1,
                message: 'Academy review report',
                data: result
            });
        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

// exports.createCloudinaryFolder = async (req, res) => {

//     const { folderPath } = req.body
//     if (!folderPath) {
//         return res.json({
//             status: 0,
//             message: "folderpath is required"
//         })
//     }
//     console.log(process.env.CLOUDINARY_API_SECRET)


//     cloudinary.api.create_folder(folderPath, (error, result) => {
//         if (error) {
//             return res.json({
//                 status: 0,
//                 message: error
//             })
//         } else {
//             return res.json({
//                 status: 1,
//                 message: "folder created successfully",
//                 message: result
//             })
//         }
//     });
// }

exports.getNearbyLocations = async (req, res) => {
    try {

        const { lat, lng, radius, type } = req.body
console.log(MAP_API_KEY)
        if (!lat || !lng || !radius || !type) {
            return res.status(400).json({
                status: 0,
                message: "lat, lng, radius, type are required fields"
            })
        }

        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${MAP_API_KEY}`;
        const response = await axios.get(apiUrl);
        return res.json({
            status: 1,
            message: "nearby search results",
            data: response.data
        })

    } catch (error) {
        return res.status(500).json({
            status: 0,
            message:  error.message
        });
    }
}

// ================= Admin Apis ================= //
exports.getAllAcademy = async(req,res)=>{
    try {
        SQL.get('bmp_academy_details', ``, ``, (error, result) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            return res.status(200).json({
                status: 1,
                message: 'Academy details',
                data: result
            });

        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    } 
}