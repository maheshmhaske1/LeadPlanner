const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validators = require('validator')
const db = require("../model/db");
const validator = require("../model/validators");
const validate = require('validator')
const Email = require('../model/mail')
const auth = require('../model/auth')
const SQL = require('../model/sqlhandler')

jwtOptions = {
    expiresIn: '1h', // Token expiration time
};

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
        console.log(req.body)
        req.body.password = await bcrypt.hash(password, 10);
        SQL.insert('user', req.body, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            const userId = result.insertId;
            SQL.insert('roles_users', { user_id: userId, role_id: role }, (error, result) => {
                if (error) {
                    return res.json({
                        status: 0,
                        error: error
                    })
                }
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
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      u.password,
      u.phone,
      u.address1,
      u.city,
      u.state,
      u.country,
      u.postcode,
      u.creation_date,
      u.update_date,
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
      u.id, u.first_name, u.last_name, u.email, u.password, u.phone, u.address1,u.city, u.state, u.country, u.postcode, u.creation_date, u.update_date;
    `;
    const values = [username, username];

    db.query(query, values, (error, results) => {
        const userDetails = results
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
            } else {
                const storedPassword = results[0].password;
                console.log("userDetails[0].id => 124",userDetails[0].id)
                bcrypt.compare(password, storedPassword, async (err, passwordMatch) => {
                    if (passwordMatch) {
                        SQL.get('roles_users', '', `user_id=${results[0].id}`, async (error, results) => {
                            const role = results[0].role_id
                            const token = await auth.generate_token_user(results[0].id, results[0].email);
                            results[0].token = token;
                            console.log("userDetails[0].id => 130",userDetails[0].id)
                            req.session.userId = userDetails[0].id;
                            delete results[0].password;
                            // req.session.sessionID = req.sessionID
                            return res.json({
                                status: 1,
                                message: 'Logged in',
                                landingurl: role == 1 ? `http://core.leadplaner.com:3000/` : role == 3 ? 'http://core.leadplaner.com:3000/admin/' : '',
                                session: req.session,
                                user: userDetails
                            });
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
        if (response.length == 0) {
            return res.json({
                status: 0,
                message: `this email ${email} is not registered`
            })
        }
    })

    const otp = Math.floor(100000 + Math.random() * 900000);
    const isEmailSent = await Email.sendMail(email, 'Otp Verification', `Your OTP is: ${otp}`);
    const sql = `INSERT INTO otps (email, otp, validUntill) VALUES (?, ?, ?)`;
    const values = [email, otp, Date.now() + 600000];

    db.query(`DELETE FROM otps WHERE email = ?`, [email], (error, response) => {
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
                message: `OTP sent to ${email}`
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
    const { source_id, first_name, last_name, contact } = req.body

    if (!source_id || !first_name || !last_name || !contact) {
        return res.json({
            status: 0,
            message: 'source_id,first_name,last_name,contact are required fields'
        })
    }

    await SQL.get('user', ``, `id=${source_id}`, (error, result) => {
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

        SQL.insert('team', req.body, (error, result) => {
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
    const { source_id } = req.body

    if (!source_id) {
        return res.json({
            status: 0,
            message: 'source_id is required fields'
        })
    }

    await SQL.get('user', ``, `id=${source_id}`, async (error, result) => {
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
        await SQL.get('team', ``, `source_id=${source_id}`, (error, result) => {
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

    })
}


exports.updateTeamMembers = async (req, res) => {
    const { member_id } = req.params
    const update_data = req.body

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

    await SQL.get('team', ``, `id=${member_id}`, async (error, result) => {
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
        await SQL.update('team', update_data, `id=${member_id}`, (error, result) => {
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
                    message: 'member details updated successfully',
                    data: result
                })
            }
        })

    })
}
