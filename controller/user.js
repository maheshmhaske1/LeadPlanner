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

const { JWT_TOKEN } = process.env;

exports.createAccount = async (req, res) => {
    try {
        // const welcomeTemplatePath = path.join(__dirname, '../public/templates/welcome.html');
        // const html = fs.readFileSync(welcomeTemplatePath, 'utf8');
        // await Email.sendMail('maheshmhaske2993@gmail.com', 'Account Created Successfully.', ``, html);
        // return;

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
            SQL.insert('roles_users', { user_id: userId, role_id: role }, async (error, result) => {
                if (error) {
                    return res.json({
                        status: 0,
                        error: error
                    })
                }

                const welcomeTemplatePath = path.join(__dirname, '../public/templates/welcome.html');
                const html = fs.readFileSync(welcomeTemplatePath, 'utf8');
                await Email.sendMail(email, 'Account Created Successfully.', ``, html);

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

    //     const query = `
    //     SELECT
    //     u.id,
    //     u.first_name,
    //     u.last_name,
    //     u.email,
    //     MAX(u.password) AS password,
    //     u.phone,
    //     u.address1,
    //     u.city,
    //     u.state,
    //     u.country,
    //     u.postcode,
    //     MAX(u.creation_date) AS creation_date,
    //     MAX(u.update_date) AS update_date,
    //     r.name AS role_name,
    //     GROUP_CONCAT(p.name) AS permissions
    // FROM
    //     user AS u
    //     LEFT JOIN roles_users AS ru ON u.id = ru.user_id
    //     LEFT JOIN roles AS r ON ru.role_id = r.id
    //     LEFT JOIN permission_roles AS pr ON r.id = pr.role_id
    //     LEFT JOIN permissions AS p ON pr.permission_id = p.id
    // WHERE
    //     u.email = 'client' OR u.phone = 'client'
    // GROUP BY
    //     u.id, u.first_name, u.last_name, u.email, u.phone, u.address1, u.city, u.state, u.country, u.postcode, r.id, r.name;
    //     `;


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
      u.id, u.first_name, u.last_name, u.email, u.password, u.phone, u.address1,u.city, u.state, u.country, u.postcode, u.creation_date, u.update_date;`
    const values = [username, username];

    db.query(query, values, (error, results) => {
        const userDetails = results
        console.log(results)
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
                console.log("userDetails[0].id => 124", userDetails[0].id)
                bcrypt.compare(password, storedPassword, async (err, passwordMatch) => {
                    if (passwordMatch) {
                        SQL.get('roles_users', '', `user_id = ${results[0].id}`, async (error, results) => {
                            console.log("results[0].role_id ---->", results[0])
                            const role = results[0].role_id
                            const token = await jwt.sign({ id: userDetails[0].id, role: results[0].role_id }, JWT_TOKEN, { expiresIn: '10d' });
                            results[0].token = token;
                            delete results[0].password;
                            return res.json({
                                status: 1,
                                message: 'Logged in',
                                landingurl: role == 1 ? `/lp` : role == 2 ? '/admin' : role == 3 ? '/admin' : '',
                                user: userDetails,
                                token: token
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

exports.getUserInfo = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const userId = loggedInUser.id

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

exports.updateUserInfo = async (req, res) => {
    const { first_name, last_name, phone, address1, company, employee, city, state, postcode } = req.body
    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    SQL.update(`user`,
        { first_name: first_name, last_name: last_name, phone: phone, address1: address1, company: company, employee: employee, city: city, state: state, postcode: postcode },
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

    const otp = Math.floor(100000 + Math.random() * 900000);
    const isEmailSent = await Email.sendMail(email, 'Otp Verification', `Your OTP is: ${otp} `);
    const sql = `INSERT INTO otps(email, otp, validUntill) VALUES(?, ?, ?)`;
    const values = [email, otp, Date.now() + 600000];

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
    const { first_name, last_name, phone, password, email } = req.body

    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    console.log(loggedInUser)
    if (!first_name || !last_name || !phone || !password || !email) {
        return res.json({
            status: 0,
            message: 'first_name,last_name,phone,password and email are required fields'
        })
    }

    SQL.get('password_settings', ``, ``, (error, result) => {


        const termValues = result.reduce((result, row) => {
            result[row.term] = row.active;
            return result;
        }, {});

        const values = result.reduce((result, row) => {
            result[row.term] = row.value;
            return result;
        }, {});

        console.log(termValues)
        console.log(values)

        let error_message = ``
        if (termValues.password_length == 1 && password.length < values.length) {
            error_message += `password should be ${values.length} or greater`
        }
        if (termValues.lowercase == 1) {
            const containsLowercase = (str, minCount) => {
                const lowercaseCount = (str.match(/[a-z]/g) || []).length;
                return lowercaseCount >= minCount;
            };
            if (!containsLowercase(password, values.lowercase)) {
                error_message += `, password should contain at least ${values.lowercase} lowercase letters`;
            }
        }

        if (termValues.uppercase == 1) {
            const containsUppercase = (str, minCount) => {
                const uppercaseCount = (str.match(/[A-Z]/g) || []).length;
                return uppercaseCount >= minCount;
            };
            if (!containsUppercase(password, values.uppercase)) {
                error_message += `, password should contain at least ${values.uppercase} uppercase letters`;
            }
        }
        if (termValues.uppercase == 1) {
            const containsSpecialCharacter = (str) => /\W/.test(str);
            if (!containsSpecialCharacter(password))
                error_message += `, password should contain atleast one special letter`
        }
        if (termValues.number_symbol == 1) {
            const containsSpecialCharacter = (str, minCount) => {
                const specialCharCount = (str.match(/[!@#$%^&*]/g) || []).length;
                return specialCharCount >= minCount;
            };

            if (!containsSpecialCharacter(password, values.number_symbol)) {
                error_message += `, password should contain at least ${values.number_symbol} special characters`;
            }
        }
        if (error_message != ``) {
            return res.json({
                status: 0,
                message: error_message
            })
        }
    })

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

        SQL.insert('user', { first_name, last_name, email, password: encryptedPassword, phone, manager_id: loggedInUser.id }, (error, result) => {
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
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    await SQL.get('user', ``, `id = ${loggedInUser.id} `, async (error, result) => {
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
        await SQL.get('user', ``, `manager_id = ${loggedInUser.id} AND is_deleted = 0`, async (error, result) => {
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

    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
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

    if (update_data.id || update_data.creation_date || update_data.update_date || update_data.password) {
        return res.json({
            status: 0,
            message: "id ,creation_date ,update_date and password cannot be edit"
        })
    }

    await SQL.get('user', ``, `id = ${member_id} AND manager_id = ${loggedInUser.id} `, async (error, result) => {
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

        await SQL.update('user', update_data, `id = ${member_id} `, (error, result) => {
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

exports.moveMemberToTrash = async (req, res) => {

    const { member_id } = req.body
    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
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
    if (!loggedInUser || loggedInUser.role != 1) {
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

exports.restoreTeamMemberFromTrash = async (req, res) => {
    const { teamMemberId } = req.params
    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
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
    if (!loggedInUser || loggedInUser.role != 1) {
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
    if (!loggedInUser || loggedInUser.role != 1) {
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
    if (!loggedInUser || loggedInUser.role != 1) {
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
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { ticketId } = req.params
    const { priority, assigned_to,status } = req.body
    if (!priority || !assigned_to) {
        return res.json({
            status: 0,
            message: "priority, assigned_to are required fields",
        })
    }

    SQL.update('tickets', { priority, assigned_to,status }, `id=${ticketId}`, (error, result) => {
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
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { status } = req.params

    SQL.get('tickets', ``, `status='${status}'`, (error, result) => {
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