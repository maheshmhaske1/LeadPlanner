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

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: false,
                message: "id ,creation_date ,update_date cannot be add",
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

        if (update_data.id || update_data.creation_date || update_data.update_date) {
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

exports.generatePaysipPdf1 = async (req, res) => {
    const { payslipId } = req.params

    await SQL.get('payroll', '', `id=${payslipId}`, async (error, results) => {
        if (error) {
            return res.json({
                status: false,
                error: error
            })
        }
        const payroll = results[0]
        await SQL.get('employee', '', `id=${payroll.employee_id}`, (error, result) => {
            if (error) {
                return res.json({
                    status: false
                })
            }
            const employee = result[0]
            const name = employee.first_name + ' ' + employee.last_name
            const department = employee.department
            const emp_no = employee.emp_no
            const country = employee.country
            const working_days = payroll.working_days
            const hire_date = employee.hire_date.toISOString().slice(0, 10)
            const salary_date = payroll.month + '/' + payroll.year
            const salary = Number(payroll.salary).toLocaleString()


            const pdf = require("html-pdf");
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Document</title>

              </head>
              <body>
                <table border="1" width="650" align="center" style="border-collapse: collapse;text-align: center;"  cellpadding="2" cellspacing="10">
                  <tr>
                    <th colspan="1">
                        <img src="https://www.ezuka.com/assets/logo-ezuka.png" alt=""
                        style="width: 160px;">
                    </th>
                    <th colspan="4">
                        Ezuka Services Ltd <br>
                        Bourne Business Park, 4 Dashwood Lang Rd, Addlestone
                        KT15 2HJ, United Kingdom
                    </th>        
                  </tr>

                  <tr>
                    <th>Employee Name</th>
                    <td>${name} </td>
                    <th style="border: none;"></th>
                    <th>Date Of Joining</th>
                    <td>${hire_date}</td>
                  </tr>
                  </tr>

                  <tr>
                    <th>Employee Code</th>
                    <td>${emp_no}</td>
                    <th style="border: none;"></th>
                    <th>Place of Posting</th>
                    <td>${country}</td>
                  </tr>
                  </tr>
                  <tr>
                    <th>Department</th>
                    <td>${department}</td>
                    <th style="border: none;"></th>
                    <th>Working Days</th>
                    <td>${working_days}</td>
                  </tr>
                  </tr>
                  <tr>
                    <th>Month</th>
                    <td>${salary_date}</td>
                    <th style="border: none;"></th>
                    <th>Bank / Account
                        Number
                        </th>
                    <td>SBI
                        041010100080951</td>
                  </tr>
                  </tr>
                  <tr>
                    <th>Position</th>
                    <td>${department}</td>
                    <th style="border: none;"></th>
                    <th>Sort Code</th>
                    <td>202464</td>
                  </tr>

                  <tr>
                    <td colspan="5" style="height: 20px;"></td>
                  </tr>

                  <tr>
                    <th colspan="3">Earnings (Rs)</th>
                    <th colspan="3">Deductions (Rs)</th>
                  </tr>

                  <tr>
                    <th>Particulars</th>
                    <th>Actual Amount</th>
                    <th>Payable Amt</th>
                    <th>Particulars</th>
                    <th>Amount</th>
                  </tr>

                  <tr>
                    <th><b>Basic Salary</b> </th>
                    <td>${salary}</td>
                    <td>${salary}</td>
                    <th>Tax</th>
                    <td>0</td>
                  </tr>

                  <tr>
                    <td colspan="3"></td>
                    <th>NI Contribution</th>
                    <td>0</td>
                  </tr>

                  <tr>
                    <th>Incentives</th>
                    <td></td>
                    <td></td>
                    <td colspan="2" ></td>
                  </tr>
                  <tr>
                    <th>Arrears</th>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                  </tr>

                  <tr>
                    <th>Total</th>
                    <td>${salary}</td>
                    <td>${salary}</td>
                    <th>Total Deductions</th>
                    <td>0</td>
                  </tr>

                  <tr>
                    <td colspan="3"></td>
                    <th>Net Salary </th>
                    <td>${salary}</td>
                  </tr>

                  <tr>
                    <td colspan="5"><b>For Ezuka Services Ltd</b>  <br>
                       <i>This is computer generated statement hence signature is not required.</i> </td>
                  </tr>
                </table>
              </body>
            </html>

          `;

            const options = { format: "Letter" };
            const payslipName = `paySlip_${name}_${salary_date}.pdf`
            pdf.create(htmlContent, options).toStream((err, stream) => {
                if (err) {
                    return res.json({
                        status: false,
                        message: "An error occurred while generating the PDF",
                        error: error
                    })
                }
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", `attachment; filename="${payslipName}"`);
                stream.pipe(res);
            });
        })
    })
}

exports.generatePaysipPdf = async (req, res) => {
    try {
        const puppeteer = require('puppeteer');
        const htmlContent = '<html><body><h1>PDF Content</h1></body></html>';
    
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
    
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf();
    
        await browser.close();
    
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="download.pdf"',
        });
        res.send(pdfBuffer);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred');
      }
}