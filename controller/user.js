const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validators = require('validator')
const { db } = require("../model/db");
const validator = require("../model/validators");
const validate = require('validator')
const Email = require('../model/mail')
const SQL = require('../model/sqlhandler')
const dotenv = require("dotenv").config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const { JWT_TOKEN } = process.env;

exports.createAccount = async (req, res) => {
    try {

        let { first_name, last_name, email, password, phone, role } = req.body

        if (!first_name || !last_name || !email || !password || !phone) {
            return res.json({
                status: 0,
                message: "first_name, last_name, email, password, phone this fields are required"
            })
        }
        if (!validators.isEmail(email)) {
            return res.json({
                status: 0,
                message: `${email} this is not an valid email`
            })
        }

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be add",
            });

        const user_role = role
        delete req.body.role
        req.body.password = await bcrypt.hash(password, 10);
        SQL.insert('user', req.body, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            const userId = result.insertId;
            SQL.insert('roles_users', { user_id: userId, role_id: role }, async (error, result) => {
                if (error) {
                    return res.json({
                        status: 0,
                        error: error
                    })
                }

                function sendWelcomeEmail() {
                    const welcomeTemplatePath = path.join(__dirname, '../public/templates/welcome.html');
                    let html = fs.readFileSync(welcomeTemplatePath, 'utf8');
                    html = html.replace('{{first_name}}', req.body.first_name);


                    let data = {
                        "sender": {
                            "name": "Mahesh Mhaske",
                            "email": "maheshmhaske241198@gmail.com"
                        },
                        "to": [
                            {
                                "email": `${email}`,
                                "name": `${first_name} ${last_name}`
                            }
                        ],
                        "subject": "Hello world",
                        "htmlContent": `${html}`
                    };

                    let config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: 'https://api.brevo.com/v3/smtp/email',
                        headers: {
                            'accept': 'application/json',
                            'api-key': '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', // Replace with your actual API key
                            'content-type': 'application/json'
                        },
                        data: JSON.stringify(data)
                    };


                    axios.request(config)
                        .then((response) => {
                            console.log(JSON.stringify(response.data));
                        })
                        .catch((error) => {
                            // return error
                            console.log(error);
                        });
                }

                await sendWelcomeEmail()
                return res.json({
                    status: 1,
                    message: 'user registered successfully',
                    data: result
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

};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    await validator.checkMandatoryFields(req, { username, password });

    const query = `
    SELECT
      u.*,
      GROUP_CONCAT(p.name) AS permissions
    FROM
      user AS u
      LEFT JOIN roles_users AS ru ON u.id = ru.user_id
      LEFT JOIN roles AS r ON ru.role_id = r.id
      LEFT JOIN permission_roles AS pr ON r.id = pr.role_id
      LEFT JOIN permissions AS p ON pr.permission_id = p.id
    WHERE
      u.email = ? OR u.phone = ?
    GROUP BY
      u.id, u.first_name, u.last_name, u.email, u.password, u.phone, u.address1,u.city, u.state, u.country, u.postcode, u.creation_date, u.update_date;`
    const values = [username, username];



    db.query(query, values, (error, results) => {
        const userDetails = results
        console.log("results =====>", results)

        if (error) {
            return res.json({
                status: 0,
                message: 'Something went wrong --1',
                error: error
            });

        } else {
            if (results.length === 0) {
                return res.json({
                    status: 0,
                    message: 'Account does not exist'
                });
            }

            if (results[0].is_deactivated == 1) {
                return res.json({
                    status: 0,
                    message: 'Account not active.'
                });
            }
            else {
                const storedPassword = results[0].password;
                bcrypt.compare(password, storedPassword, async (err, passwordMatch) => {
                    if (passwordMatch) {
                        let query = `SELECT roles_users.*, roles.* FROM roles_users
                        LEFT JOIN roles ON roles_users.role_id = roles.id
                        WHERE roles_users.user_id = ${results[0].id} LIMIT 0, 25;
                    `

                        // SQL.get('roles_users', '', `user_id = ${results[0].id}`, async (error, results) => {
                        db.query(query, async (error, results) => {
                            // console.log(results)
                            let role = ``
                            results.length == 0 ? role = `` : role = results[0].role_id
                            const token = await jwt.sign({ id: userDetails[0].id, role: role, role_name: results[0].display_name }, JWT_TOKEN, { expiresIn: '10d' });
                            userDetails.role = role
                            let is_twoFactorEnabled = 0
                            const role_name = results[0].display_name
                            SQL.get('company_settings', ``, `setting_name="two_factor_auth" AND is_enabled=1`, (error, result) => {
                                if (result.length > 0) {
                                    is_twoFactorEnabled = 1
                                }
                                return res.json({
                                    status: 1,
                                    message: 'Logged in',
                                    role: role,
                                    role_name: role_name,
                                    is_twoFactorEnabled: is_twoFactorEnabled,
                                    landingurl: role_name == "blogger" ? `/lp/admin` : '/lp/home',
                                    user: userDetails,
                                    token: token
                                });
                            })
                        })

                    } else {
                        return res.json({
                            status: 0,
                            message: 'Incorrect password',
                            error: error
                        });
                    }
                });
            }
        }
    });
};

exports.getUserInfo = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { userId } = req.body

    SQL.get('user', ``, `id = ${userId} `, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }

        delete result[0].password
        return res.json({
            status: 1,
            message: "user details",
            data: result
        })
    })
}

exports.getOrgInfoById = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { orgId } = req.params

    const query = `select  * from organization where org_id = ${orgId}`

    db.query(query, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }

        delete result[0].password
        return res.json({
            status: 1,
            message: "Organization details",
            data: result
        })
    })
}

exports.updateUserInfo = async (req, res) => {
    const { first_name, last_name, phone, address1, company, employee, city, state, postcode } = req.body
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    SQL.update(`user`,
        req.body,
        `id = ${loggedInUser.id} `,
        (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: 'something went wrong',
                    error: error
                })
            }
            if (result.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: 'user details updated successfully',
                    data: result
                })
            }
        })
}

exports.getLeadOrDealByUser = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { member_id } = req.body

    if (!member_id) {
        return res.json({
            status: 0,
            message: "member_id is required field",
        })
    }

    let lead = []
    let deal = []
    SQL.get(`lead`, ``, `owner=${member_id}`, (error, results) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (results.length > 0) {
            lead = results
        }
        SQL.get(`deal`, ``, `owner=${member_id}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0) {
                deal = results
                result()
            }
            else {
                result()
            }
        })

        function result() {
            if (deal.length > 0 || lead.length > 0) {
                return res.json({
                    status: 0,
                    message: "lead or deal already available for this member",
                    leads: lead,
                    deals: deal
                })
            } else {
                return res.json({
                    status: 0,
                    message: "not lead or deal associated with this member"
                })
            }
        }

    })
}

exports.logOut = async (req, res) => {
    req.session.destroy(function (err) {
        if (!err) {
            return res.json({
                status: 1,
                message: "Logged out successfully"
            })
        }
    })
}

exports.sendOtp = async (req, res) => {
    const { email } = req.body;

    await validator.checkMandatoryFields(res, { email })

    if (email)
        if (!validate.isEmail(email)) {
            return res.json({
                status: 0,
                message: "Please enter a valid email"
            });
        }

    db.query('select email from user where email=?', [email], (error, response) => {
        if (error) {
            return res.json({
                status: 0,
                message: "something went wrong"
            });
        }
        // if (response.length == 0) {
        //     return res.json({
        //         status: 0,
        //         message: `this email ${ email } is not registered`
        //     })
        // }
    })

    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log(otp)
    // const isEmailSent = await Email.sendMail(email, 'Otp Verification', `Your OTP is: ${otp} `);
    await sendOtpVerificationEmail()
    function sendOtpVerificationEmail() {
        const welcomeTemplatePath = path.join(__dirname, '../public/templates/forgotPassword.html');
        let html = fs.readFileSync(welcomeTemplatePath, 'utf8');
        html = html.replace('{{otp}}', otp);
        html = html.replace('{{email}}', email);

        let data = {
            "sender": {
                "name": "Mahesh Mhaske",
                "email": "maheshmhaske241198@gmail.com"
            },
            "to": [
                {
                    "email": `${email}`,
                    "name": `LeadPlaner user`
                }
            ],
            "subject": "Password Reset",
            "htmlContent": `${html}`
        };

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.brevo.com/v3/smtp/email',
            headers: {
                'accept': 'application/json',
                'api-key': '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', // Replace with your actual API key
                'content-type': 'application/json'
            },
            data: JSON.stringify(data)
        };


        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                // return error
                console.log(error);
            });
    }
    const sql = `INSERT INTO otps(email, otp, validUntill) VALUES(?, ?, ?)`;
    const values = [email, otp, Date.now() + 36000000];

    db.query(`DELETE FROM otps WHERE email = ? `, [email], (error, response) => {
        if (error) {
            console.error('Error deleting OTP:', error);
            return res.json({
                status: 0,
                message: "Something went wrong while deleting the OTP",
                error: error
            });
        }

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error inserting OTP:', err);
                return res.json({
                    status: 0,
                    message: "Something went wrong while sending the OTP",
                    error: err
                });
            }

            return res.json({
                status: 1,
                message: `OTP sent to ${email} `
            });
        });
    });
};

exports.verifyOTP = (req, res) => {
    const { email, otp } = req.body;

    validator.checkMandatoryFields(res, { email, otp })

    if (email)
        if (!validate.isEmail(email)) {
            return res.json({
                status: 0,
                message: "please enter valid emil"
            })
        }

    const sql = 'SELECT otp, validUntill FROM otps WHERE email = ?';
    const values = [email];

    db.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error verifying OTP:', error);
            return res.json({
                status: 0,
                message: "Error verifying OTP",
            });
        } else {
            if (results.length > 0) {
                const storedOTP = results[0].otp;
                const validUntill = results[0].validUntill;

                if (storedOTP === otp && validUntill > Date.now()) {
                    return res.json({
                        status: 1,
                        message: "OTP is valid",
                    });
                }
                else if (storedOTP === otp && validUntill < Date.now()) {
                    return res.json({
                        status: 0,
                        message: "OTP Expired",
                    });
                }
                else if (storedOTP != otp) {
                    return res.json({
                        status: 0,
                        message: "OTP not Matched",
                    });
                }
            } else {
                console.log('OTP not found');
                return res.json({
                    status: 0,
                    message: "OTP not found",
                });
            }
        }
    });
};

exports.forgotPassword = async (req, res) => {
    const { email, otp, password } = req.body;

    await validator.checkMandatoryFields(res, { email, otp, password })
    if (email)
        if (!validate.isEmail(email)) {
            return res.json({
                status: 0,
                message: "Please enter a valid email",
            });
        }


    const sql = 'SELECT otp, validUntill FROM otps WHERE email = ?';
    const values = [email];

    db.query(sql, values, async (error, results) => {
        if (error) {
            console.error('Error verifying OTP:', error);
            return res.json({
                status: 0,
                message: "Error verifying OTP",
            });
        } else {
            if (results.length > 0) {
                const storedOTP = results[0].otp;
                const validUntill = results[0].validUntill;
                console.log("password ==>", password)

                if (storedOTP === otp && validUntill > Date.now()) {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    console.log(hashedPassword)
                    db.query('update user SET password=? where email=?', [hashedPassword, email])
                    return res.json({
                        status: 1,
                        message: "Password updated",
                    });
                }
                else if (storedOTP === otp && validUntill < Date.now()) {
                    return res.json({
                        status: 0,
                        message: "OTP Expired",
                    });
                }
                else if (storedOTP != otp) {
                    return res.json({
                        status: 0,
                        message: "OTP not Matched",
                    });
                }
            }
        }
    });
}

exports.addTeamMember = async (req, res) => {
    const { first_name, last_name, phone, password, email, org_id } = req.body

    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    console.log(loggedInUser)
    if (!first_name || !last_name || !phone || !password || !email || !org_id) {
        return res.json({
            status: 0,
            message: 'first_name,last_name,phone,password,org_id and email are required fields'
        })
    }

    // SQL.get('password_settings', ``, ``, (error, result) => {

    //     const termValues = result.reduce((result, row) => {
    //         result[row.term] = row.active;
    //         return result;
    //     }, {});

    //     const values = result.reduce((result, row) => {
    //         result[row.term] = row.value;
    //         return result;
    //     }, {});


    //     console.log(termValues)
    //     console.log(values)

    //     let error_message = ``
    //     if (termValues.password_length == 1 && password.length < values.length) {
    //         error_message += `password should be ${values.length} or greater`
    //     }
    //     if (termValues.lowercase == 1) {
    //         const containsLowercase = (str, minCount) => {
    //             const lowercaseCount = (str.match(/[a-z]/g) || []).length;
    //             return lowercaseCount >= minCount;
    //         };
    //         if (!containsLowercase(password, values.lowercase)) {
    //             error_message += `, password should contain at least ${values.lowercase} lowercase letters`;
    //         }
    //     }

    //     if (termValues.uppercase == 1) {
    //         const containsUppercase = (str, minCount) => {
    //             const uppercaseCount = (str.match(/[A-Z]/g) || []).length;
    //             return uppercaseCount >= minCount;
    //         };
    //         if (!containsUppercase(password, values.uppercase)) {
    //             error_message += `, password should contain at least ${values.uppercase} uppercase letters`;
    //         }
    //     }
    //     if (termValues.uppercase == 1) {
    //         const containsSpecialCharacter = (str) => /\W/.test(str);
    //         if (!containsSpecialCharacter(password))
    //             error_message += `, password should contain atleast one special letter`
    //     }
    //     if (termValues.number_symbol == 1) {
    //         const containsSpecialCharacter = (str, minCount) => {
    //             const specialCharCount = (str.match(/[!@#$%^&*]/g) || []).length;
    //             return specialCharCount >= minCount;
    //         };

    //         if (!containsSpecialCharacter(password, values.number_symbol)) {
    //             error_message += `, password should contain at least ${values.number_symbol} special characters`;
    //         }
    //     }
    //     if (error_message != ``) {
    //         return res.json({
    //             status: 0,
    //             message: error_message
    //         })
    //     }
    // })

    req.body.source_id = loggedInUser.id
    const encryptedPassword = await bcrypt.hash(password, 10);


    await SQL.get('user', ``, `id = ${loggedInUser.id} `, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: 'something went wrong',
                error: error
            })
        }
        if (result.length == 0) {
            return res.json({
                status: 0,
                message: 'please provide valid source id'
            })
        }

        SQL.insert('user', { first_name, last_name, email, password: encryptedPassword, phone, manager_id: loggedInUser.id, org_id }, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: 'something went wrong',
                    error: error
                })
            }

            return res.json({
                status: 1,
                message: 'team member added',
                data: result
            })
        })

    })
}

exports.getTeamMembers = async (req, res) => {

    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const { user } = req.params
    const { orgId } = req.body

    if (!orgId) {
        return res.json({
            status: 0,
            message: "orgId is required field",
        })
    }

    let condition =
        user == "all" ? `is_deleted = 0 AND org_id=${orgId}` :
            user == "active" ? `is_deleted = 0 AND org_id=${orgId} AND is_deactivated=0` :
                user == "deactive" ? `is_deleted = 0 AND org_id=${orgId} AND is_deactivated=1` :
                    `is_deleted = 0`

    await SQL.get('user', ``, condition, async (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: 'something went wrong',
                error: error
            })
        }
        return res.json({
            status: 0,
            message: 'team member details',
            data: result
        })
    })

    // })
}

exports.updateTeamMembers = async (req, res) => {
    const { member_id } = req.params
    let update_data = req.body

    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    if (!member_id) {
        return res.json({
            status: 0,
            message: 'member_id is required fields'
        })
    }

    if (update_data.id || update_data.creation_date || update_data.update_date) {
        return res.json({
            status: 0,
            message: "id ,creation_date ,update_date cannot be edit"
        })
    }

    await SQL.get('user', ``, `id = ${member_id}`, async (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: 'something went wrong',
                error: error
            })
        }
        if (result.length == 0) {
            return res.json({
                status: 0,
                message: 'please provide valid member_id'
            })
        }

        let roles = []
        if (update_data.roles) roles = update_data.roles
        if (update_data.password) update_data.password = await bcrypt.hash(update_data.password, 10);
        delete update_data.roles
        await SQL.update('user', update_data, `id = ${member_id} `, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: 'something went wrong',
                    error: error
                })
            }
            roles.map(roles => {
                SQL.insert('roles_users', roles, (error, result) => { console.log(error) })
            })
            if (result.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: 'member details updated successfully',
                    data: result
                })
            }
        })

    })
}

exports.moveMemberToTrash = async (req, res) => {

    const { member_id } = req.body
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.get('user', ``, `id = ${member_id} AND manager_id = ${owner} `, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (result.length == 0) {
            return res.json({
                status: 0,
                message: 'Not permitted or Invalid User'
            })
        }
        SQL.update(`user`, { is_deleted: 1 }, `id = ${member_id} `, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: "member moved to trash",
                data: results
            })
        });
    })
}

exports.getAllTeamMemberFromTrash = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id
    SQL.get(`user`, ``, `manager_id = ${owner} AND is_deleted = 1`, (error, results) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        return res.json({
            status: 1,
            message: "team members from trash",
            data: results
        })
    });
}

exports.getUserRolesByUser = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { userId } = req.params

    let query = `
    SELECT u.id AS user_id, r.* FROM user u JOIN roles_users ru ON u.id = ru.user_id JOIN roles r ON ru.role_id = r.id where u.id=${userId};`
    db.query(query, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        else {
            return res.json({
                status: 1,
                message: `user roles`,
                data: result
            })
        }
    })
}

exports.restoreTeamMemberFromTrash = async (req, res) => {
    const { teamMemberId } = req.params
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.get('user', ``, `id = ${teamMemberId} AND manager_id = ${owner} AND is_deleted = 1`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (result.length == 0) {
            return res.json({
                status: 0,
                message: 'Not permitted or member not in trash'
            })
        }
        SQL.update(`user`, { is_deleted: 0 }, `id = ${teamMemberId} `, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: "team member restored",
                data: results
            })
        });
    })
}

exports.restoreAllTeamMemberFromTrash = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.get('user', ``, `manager_id = ${owner} AND is_deleted = 1`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (result.length == 0) {
            return res.json({
                status: 0,
                message: 'No team member mark as deleted'
            })
        }
        SQL.update(`user`, { is_deleted: 0 }, `manager_id = ${owner} AND is_deleted = 1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: "team members restored",
                data: results
            })
        });
    })
}

exports.deleteTeamMemberFromTrash = async (req, res) => {

    const { teamMemberId } = req.params
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.get('user', ``, `id = ${teamMemberId} AND manager_id = ${owner} AND is_deleted = 1`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (result.length == 0) {
            return res.json({
                status: 0,
                message: 'no member marked as delete'
            })
        }
        SQL.delete(`user`, `id = ${teamMemberId} AND manager_id = ${owner} AND is_deleted = 1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: "team member deleted permanently",
                data: results
            })
        });
    })
}

exports.deleteAllTeamMemberFromTrash = async (req, res) => {

    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.get('user', ``, `manager_id = ${owner} AND is_deleted = 1`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (result.length == 0) {
            return res.json({
                status: 0,
                message: 'No member marked as delete'
            })
        }

        SQL.delete(`user`, `manager_id = ${owner} AND is_deleted = 1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: "team members deleted permanently",
                data: results
            })
        });
    })
}

exports.getCountryMasterData = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    SQL.get('country', ``, ``, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: `something went wrong`, error
            })
        }
        return res.json({
            status: 1,
            message: `country list`,
            data: result
        })
    })
}

exports.addTicket = async (req, res) => {

    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const user_id = loggedInUser.id
    let { mobile, title, description, email, category, priority } = req.body;
    req.body.user_id = user_id

    if (!mobile || !title || !description || !email || !category) {
        return res.json({
            status: 0,
            message: ` mobile, title, description, email, category are required values`
        })
    }

    SQL.insert('tickets', req.body, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: `something went wrong`, error
            })
        }
        return res.json({
            status: 1,
            message: `ticked raised`,
            data: result
        })
    })
}

exports.updateTickets = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { ticketId } = req.params
    const { priority, assigned_to, status, mobile, title, description, email, category } = req.body
    if (!priority || !assigned_to) {
        return res.json({
            status: 0,
            message: "priority, assigned_to are required fields",
        })
    }

    SQL.update('tickets', { priority, assigned_to, status, mobile, title, description, email, category }, `id=${ticketId}`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: `something went wrong`, error
            })
        }
        return res.json({
            status: 1,
            message: "ticket updated",
            data: result
        })
    })
}

exports.getTickets = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const userId = loggedInUser.id

    SQL.get('tickets', ``, `user_id = ${userId}`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: `something went wrong`, error
            })
        }
        return res.json({
            status: 1,
            message: "tickets",
            data: result
        })
    })
}

exports.getAllTickets = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    let { status } = req.params
    let condition = status == 'all' ? `` : `status='${status}'`

    SQL.get('tickets', ``, condition, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: `something went wrong`, error
            })
        }
        return res.json({
            status: 1,
            message: "tickets",
            data: result
        })
    })
}

exports.getAllRoles = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    SQL.get('roles', ``, ``, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: `something went wrong`, error
            })
        }
        return res.json({
            status: 1,
            message: "roles",
            data: result
        })
    })
}

exports.searchHelpQuestions = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    let { condition, help_title } = req.body

    if (!condition && !help_title) {
        return res.json({
            status: 0,
            message: "please provide at least one value from condition or help_title"
        })
    }

    if (condition == `all`) {
        condition = ``
    } else {
        condition = `title LIKE '%${help_title}%'`
    }
    console.log(condition)

    SQL.get('xx_help', ``, condition, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: `something went wrong`, error
            })
        }
        return res.json({
            status: 1,
            message: "All help questions",
            data: result
        })
    })
}

exports.getHelpQuestionsById = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { helpQuestionId } = req.params

    SQL.get('xx_help', ``, `id=${helpQuestionId}`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: `something went wrong`, error
            })
        }
        return res.json({
            status: 1,
            message: "help question",
            data: result
        })
    })
}

exports.updateHeplQuetions = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { helpQuestionId } = req.params
    const update_data = req.body

    SQL.get('xx_help', ``, `id=${helpQuestionId}`, (error, result) => {
        if (result.length == 0) {
            return res.json({
                status: 0,
                message: "invalid helpQuestionId",
            })
        }
        SQL.update('xx_help', update_data, `id=${helpQuestionId}`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: `something went wrong`, error
                })
            }
            return res.json({
                status: 1,
                message: 'help details updated',
                data: result
            })
        })
    })
}

exports.getAllEligibilityFilters = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    await SQL.get('banks_eligibility', ``, ``, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: `something went wrong`, error
            })
        }
        return res.json({
            status: 1,
            message: "All eligibility criteria",
            data: result
        })
    })
}

exports.AddHelpQuestions = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { site, slug, title, details, category } = req.body;

    if (!site || !slug || !title || !details || !category) {
        return res.json({
            status: 0,
            message: "site, slug, title, details, category are required values",
        });
    }

    SQL.insert('xx_help', req.body, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: `something went wrong`, error
            })
        }
        return res.json({
            status: 1,
            message: "help question Added",
            data: result
        })
    })
}

exports.createLogs = async (req, res) => {
    const loggedInUser = req.decoded
    console.log(loggedInUser)
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    let { attr1, attr4 } = req.body

    if (!attr1 || !attr4) {
        return res.json({
            status: 0,
            message: "attr1,attr4 are required fields"
        })
    }

    req.body.attr2 = loggedInUser.id
    req.body.attr5 = "D"

    await SQL.insert('xx_log', req.body, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: `something went wrong`, error
            })
        }
        return res.json({
            status: 1,
            message: "log added",
            data: result
        })
    })
}