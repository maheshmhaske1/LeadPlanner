// const db = require("../db");
const SQL = require("../model/sqlhandler");
const fs = require("fs");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { uploadEmployeeDoc } = require("../model/upload");

exports.createEmployee = async (req, res) => {
    try {
        let {
            first_name, last_name, dob, gender, hire_date, emp_no, department,
            salary, personal_email, mobile, address1, address2, city, state,
            country, postcode, social1, social2, tax_id, aadhaar_no, position, password,
        } = req.body;

        if (!first_name || !last_name || !dob || !gender || !hire_date ||
            !emp_no || !department || !salary || !personal_email || !password || !aadhaar_no) {
            return res.json({
                status: 0,
                message:
                    "first_name, last_name, dob, gender, hire_date, emp_no, department,salary, personal_email, password, aadhaar_no these are required values",
            });
        }

        if (!validator.isEmail(personal_email))
            return res.json({
                status: 0,
                message: `${personal_email} is not valid email`,
            });

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be add",
            });



        req.body.password = await bcrypt.hash(password, 10);
        console.log(password);

        SQL.insert("employee", req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error,
                });
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: "employee added successfully",
                    results,
                });
            }
        });
    } catch (error) {
        return res.json({
            status: 0,
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
                status: 0,
                message: "please enter employeeId",
            });
        }

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
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
                        status: 0,
                        error: error,
                    });
                }
                if (results.affectedRows > 0) {
                    return res.json({
                        status: 1,
                        message: "employee details updated successfully",
                    });
                }
            }
        );
    } catch (error) {
        return res.json({
            status: 0,
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
                    status: 0,
                    error: error,
                });
            }
            return res.json({
                status: 1,
                message: "employee details",
                data: results,
            });
        });
    } catch (error) {
        return res.json({
            status: 0,
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
                    status: 0,
                    error: error,
                });
            }
            return res.json({
                status: 1,
                message: "employee details",
                data: results,
            });
        });
    } catch (error) {
        return res.json({
            status: 0,
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
                status: 0,
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
                        status: 0,
                        error: error,
                    });
                }
                if (results.length === 0) {
                    return res.json({
                        status: 0,
                        message: "employee not registered",
                    });
                }
                const isPasswordMatch = await bcrypt.compare(password, results[0].password)
                if (isPasswordMatch) {
                    req.session.user = results[0]
                    return res.json({
                        status: 1,
                        message: "logged in",
                        data: { employee: results[0].id },
                        session: req.session
                    });
                } else {
                    return res.json({
                        status: 0,
                        message: "incorrect password"
                    });
                }
            }
        );
    } catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            error: error,
        });
    }
};

exports.uploadDoc = async (req, res) => {
    uploadEmployeeDoc(req, res, function (error) {
        if (error) {
            return res.json({
                status: 0,
                message: "something went wrong",
                error: error,
            });
        }
        const imageName = req.file.filename;
        return res.json({
            status: 1,
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
                status: 0,
                message: "something went wrong",
                error: error,
            });
        }
        return res.json({
            status: 1,
            message: "image removed successfully",
        });
    });
};

exports.getPayslips = async (req, res) => {
    try {

        const loggedInUser = req.decoded
        if (!loggedInUser || loggedInUser.role != 3) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }
        console.log(loggedInUser)
        SQL.get("payroll", "", `employee_id=${loggedInUser.id}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error,
                });
            }
            return res.json({
                status: 1,
                message: "employee payslips details",
                data: results,
            });
        });
    } catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            error: error,
        });
    }
}

exports.getPayslip = async (req, res) => {
    try {

        const loggedInUser = req.decoded
        if (!loggedInUser || loggedInUser.role != 3) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { payslipId } = req.params
        await SQL.get('payroll', '', `id=${payslipId}`, async (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }

            if (results.length == 0) {
                return res.json({
                    status: 0,
                    message: 'please provide valid payslipid'
                })
            }

            const payroll = results[0]
            await SQL.get('user', '', `id=${loggedInUser.id}`, (error, result) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (result.length == 0 || !result[0].employee) {
                    return res.json({
                        status: 0,
                        message: 'not valid user'
                    })
                }

                let employee_id
                if (result[0].employee) {
                    employee_id = Number(result[0].employee)
                }
                SQL.get('employee', ``, `id=${employee_id}`, (error, result) => {
                    if (error) {
                        return res.json({
                            status: 0,
                            message: error
                        })
                    }
                    return res.json({
                        status: 1,
                        message: "salary slip data",
                        data: {
                            payroll: payroll,
                            employee: result[0]
                        }
                    })
                })
            })
        })
    } catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            error: error,
        });
    }
}

