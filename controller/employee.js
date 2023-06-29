// const db = require("../db");
const SQL = require("../model/sqlhandler");
const fs = require("fs");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { uploadEmployeeDoc } = require("../model/upload");

exports.createEmployee = async (req, res) => {
    try {
        let {
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
            password,
        } = req.body;

        if (
            !first_name ||
            !last_name ||
            !dob ||
            !gender ||
            !hire_date ||
            !emp_no ||
            !department ||
            !salary ||
            !personal_email ||
            !password ||
            !aadhaar_no
        ) {
            return res.json({
                status: false,
                message:
                    "first_name, last_name, dob, gender, hire_date, emp_no, department,salary, personal_email, password, aadhaar_no these are required values",
            });
        }

        if (!validator.isEmail(personal_email))
            return res.json({
                status: false,
                message: `${personal_email} is not valid email`,
            });

        req.body.password = await bcrypt.hash(password, 10);
        console.log(password);

        SQL.insert("employee", req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error,
                });
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: true,
                    message: "employee added successfully",
                    results,
                });
            }
        });
    } catch (error) {
        return res.json({
            status: false,
            message: "something went wrong",
            error: error,
        });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const update_data = req.body;

        if (!employeeId) {
            return req.json({
                status: false,
                message: "please enter employeeId",
            });
        }

        if (
            update_data.id ||
            update_data.creation_date ||
            update_data.update_date
        ) {
            return res.json({
                status: false,
                message: "id ,creation_date ,update_date cannot be edit",
            });
        }

        SQL.update(
            "employee",
            update_data,
            `id=${employeeId}`,
            (error, results) => {
                if (error) {
                    return res.json({
                        status: false,
                        error: error,
                    });
                }
                if (results.affectedRows > 0) {
                    return res.json({
                        status: true,
                        message: "employee details updated successfully",
                    });
                }
            }
        );
    } catch (error) {
        return res.json({
            status: false,
            message: "something went wrong",
            error: error,
        });
    }
};

exports.getEmployee = async (req, res) => {
    try {
        const employeeId = req.params.employeeId;
        SQL.get("employee", "", `id=${employeeId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error,
                });
            }
            return res.json({
                status: true,
                message: "employee details",
                data: results,
            });
        });
    } catch (error) {
        return res.json({
            status: false,
            message: "something went wrong",
            error: error,
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        SQL.get("employee", "", "", (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error,
                });
            }
            return res.json({
                status: true,
                message: "employee details",
                data: results,
            });
        });
    } catch (error) {
        return res.json({
            status: false,
            message: "something went wrong",
            error: error,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.json({
                status: false,
                message: "username and password are required fields",
            });
        }

        SQL.get(
            "employee",
            "",
            `personal_email="${username}" OR mobile="${username}"`,
            async (error, results) => {
                if (error) {
                    return res.json({
                        status: false,
                        error: error,
                    });
                }
                if (results.length === 0) {
                    return res.json({
                        status: false,
                        message: "employee not registered",
                    });
                }
                const isPasswordMatch = await bcrypt.compare(password, results[0].password)
                if (isPasswordMatch) {
                    req.session.user = results[0]
                    return res.json({
                        status: true,
                        message: "logged in",
                        data: { employee: results[0].id },
                        session: req.session
                    });
                } else {
                    return res.json({
                        status: false,
                        message: "incorrect password"
                    });
                }
            }
        );
    } catch (error) {
        return res.json({
            status: false,
            message: "something went wrong",
            error: error,
        });
    }
};

exports.uploadDoc = async (req, res) => {
    uploadEmployeeDoc(req, res, function (error) {
        if (error) {
            return res.json({
                status: false,
                message: "something went wrong",
                error: error,
            });
        }
        const imageName = req.file.filename;
        return res.json({
            status: true,
            message: "image added successfully",
            data: imageName,
        });
    });
};

exports.removeDoc = async (req, res) => {
    const { docName } = req.params;
    const imagePath = `./public/employeeDoc/${docName}`;

    fs.unlink(imagePath, (error) => {
        if (error) {
            return res.json({
                status: false,
                message: "something went wrong",
                error: error,
            });
        }
        return res.json({
            status: true,
            message: "image removed successfully",
        });
    });
};

exports.getPayslips = async (req, res) => {
    try {
        const { employeeId } = req.params
        if (!employeeId) {
            return res.json({
                status: false,
                message: "please provide employeeId"
            })
        }

        SQL.get("payroll", "", `employee_id=${employeeId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error,
                });
            }
            return res.json({
                status: true,
                message: "employee payslips details",
                data: results,
            });
        });
    } catch (error) {
        return res.json({
            status: false,
            message: "something went wrong",
            error: error,
        });
    }
}

exports.getPayslip = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.json({
                status: false,
                message: "please provide payslip id"
            })
        }

        SQL.get("payroll", "", `id=${id}`, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error,
                });
            }
            let salary = (results[0].salary / 12) / 30
            results[0].salary = salary * results[0].working_days
            return res.json({
                status: true,
                message: "employee payslip details",
                data: results,
            });
        });
    } catch (error) {
        return res.json({
            status: false,
            message: "something went wrong",
            error: error,
        });
    }
}
