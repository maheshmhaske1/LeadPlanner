const SQL = require('../model/sqlhandler')
const validator = require("validator");

exports.createDeal = async (req, res) => {
    try {
        const {
            lead_id, account_name, value, currency, status, owner,
            probability, closure_date, attr1, attr2, attr3
        } = req.body;


        if (!lead_id || !account_name || !value || !currency || !closure_date) {
            return res.json({
                status: 0,
                message: 'lead_id, account_name, value, currency ,closure_date these are required values'
            })
        }

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be add",
            });

        SQL.get('lead', '', `id=${lead_id}`, (error, result) => {
            if (result.length == 0) {
                return res.json({
                    status: 0,
                    message: "please enter valid lead_id"
                })
            }
            SQL.insert('deal', req.body, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        error: error
                    })
                }
                if (results.affectedRows > 0) {
                    return res.json({
                        status: 1,
                        message: 'deal added successfully',
                        data: results
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

exports.updateDeal = async (req, res) => {
    try {
        const { dealId } = req.params
        const update_data = req.body


        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be edit"
            })
        }

        SQL.update('deal', update_data, `id=${dealId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: 'deal details updated successfully'
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
}

exports.get = async (req, res) => {
    try {
        const dealId = req.params.dealId;
        SQL.get(`deal`, ``, `id=${dealId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            return res.json({
                status: 1,
                message: "deal details",
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
}

exports.getAll = async (req, res) => {
    try {
        let Open = []; let New = []; let Unread = []; let InProgress = [];

        SQL.get(`deal`, ``, `status="Open"`, async (error, results) => {
            Open = results;
            await SQL.get('deal', '', 'status="New"', async (error, result) => {
                New = result;
                await SQL.get('deal', '', 'status="Unread"', async (error, result) => {
                    Unread = result;
                    await SQL.get('deal', '', 'status="In Progress"', (error, result) => {
                        InProgress = result;
                        if (error)
                            return res.json({
                                status: 1,
                                error: error
                            });

                        return res.json({
                            status: 1,
                            message: "Deal details",
                            data: {
                                New,
                                Open,
                                Unread,
                                InProgress,
                            }
                        })
                    })
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
}