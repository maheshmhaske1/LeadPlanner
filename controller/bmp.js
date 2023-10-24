const SQL = require('../model/sqlhandlermaster')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2;
const dotenv = require("dotenv").config();
const { JWT_TOKEN, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY } = process.env;

// ======== CLOUDINARY CONFIG ======== //
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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

        const token = await jwt.sign({ id: results[0].id, phone: results[0].phone, type: results[0].type, type_id: results[0].type_id }, JWT_TOKEN, { expiresIn: '10d' });
        return res.json({
            status: 1,
            message: "Logged in",
            landingurl: "/lp/bmp",
            permissions: "/lp/bmp/overview,/lp/bmp/fees,/lp/bmp/training,/lp/bmp/gallery",
            user: results[0],
            token: token
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
exports.addAcademyBatchDetails = async (req, res) => {
    try {
        const { academy_id, age_group, weekly_days, timing, fees, title } = req.body

        const missingFields = [];

        ['academy_id', 'age_group', 'weekly_days', 'timing', 'fees', 'title'].forEach(fieldName => {
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

        SQL.get('bmp_academy_details', ``, `id=${academy_id}`, (error, results) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    message: error
                });
            }
            if (results.length == 0) {
                return res.status(200).json({
                    status: 1,
                    message: 'Academy not found.'
                });
            }
            SQL.insert('bmp_academy_batches', req.body, (error, result) => {
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
        })
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

exports.getAcademyBatchByAcademy = async (req, res) => {

    const { academy_id } = req.params

    try {
        SQL.get('bmp_academy_batches', ``, `academy_id=${academy_id} AND is_deleted=0`, (error, result) => {
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

        SQL.get('bmp_academy_batches', ``, `id=${batchId}`, (error, results) => {
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

            SQL.update('bmp_academy_batches', update_data, `id=${batchId}`, (error, results) => {
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

exports.createCloudinaryFolder = async (req, res) => {

    const { folderPath } = req.body
    if (!folderPath) {
        return res.json({
            status: 0,
            message: "folderpath is required"
        })
    }
    console.log(process.env.CLOUDINARY_API_SECRET)


    cloudinary.api.create_folder(folderPath, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        } else {
            return res.json({
                status: 1,
                message: "folder created successfully",
                message: result
            })
        }
    });
}

