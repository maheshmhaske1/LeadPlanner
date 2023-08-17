const { db } = require('../model/db');
const SQL = require('../model/sqlhandler')
const validator = require("validator");

exports.createDeal = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const {
            lead_id, deal_name, email, mobile, currency, status,
            organization, probability, closure_date, priority, contact, value, pipeline_id
        } = req.body;


        if (!deal_name || !email || !mobile || !probability || !value || !closure_date) {
            return res.json({
                status: 0,
                message: 'deal_name, email, value, mobile , probability ,closure_date these are required values'
            })
        }

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be add",
            });

        req.body.owner = loggedInUser.id
        SQL.insert('deal', req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.affectedRows > 0) {
                SQL.get('company_settings', ``, `setting_name='audit_deal' AND is_enabled=1`, (error, results) => {
                    if (error) {
                        return res.json({
                            status: 0,
                            message: error
                        })
                    }
                    if (results.length > 0)
                        SQL.insert('xx_log', { attr1: `deal:create`, attr2: loggedInUser.id, attr4: `deal created with ${JSON.stringify(req.body)} parameter`, attr5: 'D' }, (error, results) => { })

                })
                return res.json({
                    status: 1,
                    message: 'deal created successfully',
                    data: results
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


exports.updateDeal = async (req, res) => {
    try {
        const loggedInUser = req.decoded;
        if (!loggedInUser || loggedInUser.role !== 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            });
        }

        const owner = loggedInUser.id;
        const update_data = req.body;
        if (update_data.dealIds.length === 0) {
            return res.json({
                status: 0,
                message: "please provide leadIds",
            });
        }
        const dealIds = update_data.dealIds;
        delete update_data.leadIds;

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id, creation_date, update_date cannot be edited",
            });
        }

        SQL.update('deal', update_data, `id IN (${dealIds}) AND owner = ${owner}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: "something went wrong", error,
                });
            }
            SQL.get('company_settings', ``, `setting_name='audit_deal' AND is_enabled=1`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0)
                    SQL.insert('xx_log', { attr1: `deal:update`, attr2: loggedInUser.id, attr3: `updated ${dealIds} with ${JSON.stringify(update_data)}`, attr5: 'D' }, (error, results) => { console.log(error) })
            })
            return res.json({
                status: 1,
                message: 'Deals details updated successfully',
                data: results,
            });
        });
    }
    catch (error) {
        console.error("Catch block error:", error);
        return res.json({
            status: 0,
            message: "Something went wrong",
            error: error.message,
        });
    }
};


exports.get = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const owner = loggedInUser.id
        const dealId = req.params.leadId;

        SQL.get('deal', ``, `id=${dealId} AND owner=${owner} AND is_deleted=0`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (result.length == 0 || result[0].owner !== owner) {
                return res.json({
                    status: 0,
                    message: 'Not permitted or Invalid Lead'
                })
            }
            const query = `SELECT l.*,lb.name as label_name,lb.colour_code as label_coloure, u.first_name AS ownerf_name, u.last_name AS ownerl_name, u.email AS owner_email, u.phone AS owner_phone FROM \`lead\` l
            INNER JOIN user u ON l.owner = u.id
            INNER JOIN label lb ON l.label_id = lb.id
            WHERE l.owner = ${owner} AND l.id = ${dealId} AND l.is_deleted = 0`;

            db.query(query, (error, result) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                SQL.get('company_settings', ``, `setting_name='audit_deal' AND is_enabled=1`, (error, results) => {
                    if (error) {
                        return res.json({
                            status: 0,
                            message: error
                        })
                    }
                    if (results.length > 0)
                        SQL.insert('xx_log', { attr1: `deal:get`, attr2: loggedInUser.id, attr3: `get deals`, attr5: 'D' }, (error, results) => { console.log(error) })
                })
                return res.json({
                    status: 1,
                    message: "lead details",
                    data: result
                })
            });
        })
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            message: error
        })
    }
}

exports.getDealByOwner = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser || loggedInUser.role !== 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const userId = req.params.userId;

        const query = `SELECT l.*,lb.name as label_name,lb.colour_code as label_coloure, u.first_name AS ownerf_name, u.last_name AS ownerl_name, u.email AS owner_email, u.phone AS owner_phone FROM \`lead\` l
            INNER JOIN user u ON l.owner = u.id
            INNER JOIN label lb ON l.label_id = lb.id
            WHERE l.owner = ${userId} AND l.is_deleted = 0`;

        db.query(query, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            SQL.get('company_settings', ``, `setting_name='audit_deal' AND is_enabled=1`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0)
                    SQL.insert('xx_log', { attr1: `deal:get`, attr2: loggedInUser.id, attr3: `get leads`, attr5: 'D' }, (error, results) => { console.log(error) })
            })
            return res.json({
                status: 1,
                message: "lead details",
                data: result
            })
        })


    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            message: error
        })
    }
}

exports.getAll = async (req, res) => {
    try {
        const loggedInUser = req.decoded;
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            });
        }
        const owner = loggedInUser.id;

        const getLeadData = async (status) => {
            const query = `SELECT user.*,deal.* from deal
            JOIN user ON user.id = deal.owner
            WHERE deal.owner = ${owner} AND deal.is_deleted = 0 AND status='${status}'`;
            console.log(query)
            return new Promise((resolve, reject) => {
                db.query(query, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
        };

        const [Open, Unread, InProgress, New] = await Promise.all([
            getLeadData("Open"),
            getLeadData("Unread"),
            getLeadData("In Progress"),
            getLeadData("New"),
        ]);

        return res.json({
            status: 1,
            message: "Lead details",
            data: {
                New,
                Open,
                Unread,
                InProgress,
            },
        });
    } catch (error) {
        return res.json({
            status: 0,
            message: "Something went wrong",
            error: error.message,
        });
    }
};