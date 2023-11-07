// const db = require("../db");
const { db } = require('../model/db');
const SQL = require('../model/sqlhandler')
const validator = require("validator");


exports.createLeaddealActivity = async (req, res) => {
    try {
        // Validate user authorization here if needed
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const {
            assigned_to,
            activity_name,
            activity_description,
            activity_for,
            source_id,
            scheduled_date,
            scheduled_time,
        } = req.body;

        if (!activity_name || !assigned_to  || !activity_for || !source_id || !scheduled_date || !scheduled_time) {
            return res.json({
                status: 0,
                message: 'activity_name,assigned_to, activity_for, source_id, scheduled_date, and scheduled_time are required fields',
            });
        }

        if (req.body.id || req.body.creation_date || req.body.update_date) {
            return res.json({
                status: 0,
                message: "id, creation_date, and update_date cannot be added",
            });
        }
        SQL.insert('leaddeal_activity', req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: 'activity added successfully',
                    data: results
                })
            }
        });

    } catch (error) {
        return res.json({
            status: 0,
            message: "Something went wrong", error
        });
    }
};

exports.updateLeaddealActivity = async (req, res) => {
    try {

        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { activityId } = req.params;
        const update_data = req.body;

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id, creation_date, and update_date cannot be edited",
            });
        }

        SQL.get('leaddeal_activity', ``, `id=${activityId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error,
                });
            }
            if (results.length == 0) {
                return res.json({
                    status: 0,
                    message: "please provide valid activity_id",
                });
            }

            SQL.update('leaddeal_activity', update_data, `id=${activityId}`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        error: error
                    })
                }
                if (results.affectedRows > 0) {
                    return res.json({
                        status: 1,
                        message: 'note details updated successfully',
                        data: results
                    })
                }
            })
        })

    } catch (error) {
        return res.json({
            status: 0,
            message: "Something went wrong",
            error,
        });
    }
};

exports.getLeaddealActivity = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { activity_for, source_id } = req.params;
        if (!activity_for || !source_id) {
            return res.json({
                status: 0,
                message: "activity_for, source_id are required fields",
            });
        }

        const query = `select leaddeal_activity.*,user.first_name AS assigned_user_fname ,user.last_name AS assigned_user_lname from leaddeal_activity
        LEFT JOIN user ON leaddeal_activity.assigned_to = user.id
        where activity_for = '${activity_for}' AND source_id=${source_id}`
        db.query(query, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            return res.json({
                status: 1,
                message: 'activity details',
                data: results
            })

        })
        // SQL.get('leaddeal_activity', ``, `activity_for = '${activity_for}' AND source_id=${source_id}`, (error, results) => {
        //     if (error) {
        //         return res.json({
        //             status: 0,
        //             error: error
        //         })
        //     }
        //     return res.json({
        //         status: 1,
        //         message: 'activity details',
        //         data: results
        //     })

        // })

    } catch (error) {
        return res.json({
            status: 0,
            message: "Something went wrong",
            error,
        });
    }
};

exports.deleteLeaddealActivityFromTrash = async (req, res) => {
    try {

        const loggedInUser = req.decoded

        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { activityId } = req.params;

        if (!activityId) {
            return res.json({
                status: 0,
                message: "Please provide activityIds",
            });
        }

        SQL.delete('leaddeal_activity', `id = ${activityId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: 'activity deleted successfully',
                    data: results
                })
            }
        })

    } catch (error) {
        return res.json({
            status: 0,
            message: "Something went wrong",
            error,
        });
    }
};
