const SQL = require('../model/sqlhandlermaster')

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

    const { org_id } = req.params

    try {
        SQL.get('bmp_academy_details', ``, `org_id=${org_id}`, (error, result) => {
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
        const { academy_id, age_group, weekly_days, timing, fees } = req.body

        const missingFields = [];

        ['academy_id', 'age_group', 'weekly_days', 'timing', 'fees'].forEach(fieldName => {
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
                return res.status(500).json({
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