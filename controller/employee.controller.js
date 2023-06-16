const { response } = require("express");
const db = require("../db");
const validator = require("../middleware/validators");

exports.createEmployee = async (req, res) => {

    const {
        first_name,
        last_name,
        dob,
        gender,
        hire_date,
        emp_no,
        department,
        salary,
        personal_email,
        mobile,
        address1,
        address2,
        city,
        state,
        country,
        postcode,
        social1,
        social2,
        tax_id,
        aadhaar_no,
        position,
        attr1,
        attr2,
    } = req.body;

    await validator.checkMandatoryFields(res, {
        first_name,
        last_name,
        dob,
        gender,
        hire_date,
        emp_no,
        department,
        salary,
        personal_email,
        mobile
    })

    validator.validateEmail(res, personal_email)

    const query = `
    INSERT INTO employee
        (first_name,
         last_name,
         dob,
         gender,
         hire_date,
         emp_no,
         department,
         salary,
         personal_email,
         mobile,
         address1,
         address2,
         city,
         state,
         country,
         postcode,
         social1,
         social2,
         tax_id,
         aadhaar_no,
         position,
         attr1,
         attr2)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
    const values = [
        first_name, last_name, dob, gender, hire_date, emp_no, department,
        salary, personal_email, mobile, address1, address2, city, state,
        country, postcode, social1, social2, tax_id, aadhaar_no, position,
        attr1, attr2
    ];

    await db.query(query, values, (error, response) => {
        console.log(response)
        if (error) {
            return res.json({
                status: false,
                message: 'something went wrong',
                error: error
            })
        }

        else if (response.affectedRows > 0) {
            return res.json({
                status: true,
                message: 'employee created',
                data: { id: response.insertId }
            })
        }
    })
};

exports.updateEmployee = async (req, res) => {
    const { employeeId } = req.params
    const update_data = req.body

    await validator.checkMandatoryFields(res, {
        employeeId
    })

    if (update_data.id) {
        return res.json({
            status: false,
            message: "id cannot be edit"
        })
    }

    const query = `update employee SET ? WHERE id=?`
    const values = [update_data, employeeId]

    await db.query(query, values, (error, response) => {
        if (error) {
            return res.json({
                status: false,
                message: "something went wrong"
            })
        }
        else if (response.affectedRows > 0) {
            return res.json({
                status: true,
                message: "record updated successfully"
            })
        }
    })
}


exports.getEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params
        validator.checkMandatoryFields(employeeId)

        const query = `SELECT * FROM employee where id=?`
        const values = [employeeId]

        db.query(query, values, (error, response) => {
            if (error) {
                return res.json({
                    status: false,
                    message: "something went wrong", error
                })
            }
            else {
                return res.json({
                    status: true,
                    message: "employee details",
                    data: response
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
