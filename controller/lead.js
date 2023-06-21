// const db = require("../db");
const SQL = require('../middleware/sqlQueryHandler')
const validator = require("../middleware/validators");

exports.createLead = async (req, res) => {
    try {
        const {
            company_name, registration_no, employees, gst_no, first_name,
            last_name, type, address1, address2, city, state, country, pin, phone, phone1, email, website
        } = req.body;

        // await validator.checkMandatoryFields(res, {
        //     first_name, last_name, company_name, registration_no, employees, gst_no,
        //     type, salary, address1, city
        // })

        SQL.insert('lead', req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: true,
                    message: 'lead added successfully', results
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
        const { leadId } = req.params
        const update_data = req.body

        await validator.checkMandatoryFields(res, {
            leadId
        })

        if (update_data.id) {
            return res.json({
                status: false,
                message: "id cannot be edit"
            })
        }

        SQL.update('lead', update_data, `id=${leadId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: true,
                    message: 'lead details updated successfully'
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
        const leadId = req.params.leadId;
        SQL.get(`lead`, ``, `id=${leadId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            return res.json({
                status: true,
                message: "lead details",
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
        SQL.get('lead', '', '', (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            return res.json({
                status: true,
                message: "employee details",
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