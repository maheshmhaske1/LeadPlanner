// const db = require("../db");
const SQL = require('../middleware/sqlQueryHandler')
const validator = require("validator");

exports.createEmployee = async (req, res) => {
    try {
        const {
            first_name, last_name, dob, gender, hire_date, emp_no, department,
            salary, personal_email, mobile, address1, address2, city, state, country,
            postcode, social1, social2, tax_id, aadhaar_no, position, attr1, attr2,
        } = req.body;

        if (!first_name || !last_name || !dob || !gender || !hire_date || !emp_no || !department ||
            !salary || !personal_email) {
            return res.json({
                status: false,
                message: 'first_name, last_name, dob, gender, hire_date, emp_no, department,salary, personal_email these are required values'
            })
        }

        if (!validator.isEmail(personal_email))
            return res.json({
                status: false,
                message: `${personal_email} is not valid email`
            })

        SQL.insert('employee', req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: true,
                    message: 'employee added successfully', results
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

exports.updateEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params
        const update_data = req.body

        // await validator.checkMandatoryFields(res, {
        //     employeeId
        // })

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: false,
                message: "id ,creation_date ,update_date cannot be edit"
            })
        }

        SQL.update('employee', update_data, `id=${employeeId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: true,
                    message: 'employee details updated successfully'
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

exports.getEmployee = async (req, res) => {
    try {
        const employeeId = req.params.employeeId;
        SQL.get('employee', '', `id=${employeeId}`, (error, results) => {
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

exports.getAll = async (req, res) => {
    try {
        SQL.get('employee', '', '', (error, results) => {
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