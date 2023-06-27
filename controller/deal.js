// const db = require("../db");
const SQL = require('../model/sqlhandler')
const validator = require("validator");

exports.createLead = async (req, res) => {
    try {
        const {
            lead_id, account_name, deal_value, currency, status, owner,
            probability, closure_date, attr1, attr2, attr3
        } = req.body;


        if (!lead_id || !account_name || !deal_value || !currency || !closure_date) {
            return res.json({
                status: false,
                message: 'lead_id, account_name, deal_value, currency ,closure_date these are required values'
            })
        }

        SQL.insert('deal', req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: true,
                    message: 'deal added successfully',
                    data: results
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


exports.updateLead = async (req, res) => {
    try {
        const { dealId } = req.params
        const update_data = req.body


        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: false,
                message: "id ,creation_date ,update_date cannot be edit"
            })
        }

        SQL.update('deal', update_data, `id=${dealId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: true,
                    message: 'deal details updated successfully'
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
}

exports.get = async (req, res) => {
    try {
        const dealId = req.params.dealId;
        SQL.get(`deal`, ``, `id=${dealId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            return res.json({
                status: true,
                message: "deal details",
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
}

exports.getAll = async (req, res) => {
    try {
        SQL.get('deal', '', '', (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            return res.json({
                status: true,
                message: "deal details",
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
}