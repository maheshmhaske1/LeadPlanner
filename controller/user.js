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
        let { first_name, last_name, email, password, phone, address1, address2, address3, city, state, country, postcode } = req.body

        if (!first_name || !last_name || !email || !password || !phone) {
            return res.json({
                status: false,
                message: "first_name, last_name, email, password, phone there fields are required"
            })
        }
        if (!validators.isEmail(email)) {
            return res.json({
                status: false,
                message: `${email} this is not an valid email`
            })
        }

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: false,
                message: "id ,creation_date ,update_date cannot be add",
            });

        req.body.password = await bcrypt.hash(password, 10);
        console.log(password)
        SQL.insert('user', req.body, (error, result) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            return res.json({
                status: true,
                message: 'user registered successfully',
                data: result
            })
        })
    }
    catch (error) {
        return res.json({
            status: false,
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
      u.address2,
      u.address3,
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
      u.id, u.first_name, u.last_name, u.email, u.password, u.phone, u.address1, u.address2, u.address3, u.city, u.state, u.country, u.postcode, u.creation_date, u.update_date;
  `;
  const values = [username, username];

  db.query(query, values, (error, results) => {
    if (error) {
      return res.json({
        status: false,
        message: 'Something went wrong --1',
        error: error
      });
    } else {
      if (results.length === 0) {
        return res.json({
          status: false,
          message: 'Account does not exist'
        });
      } else {
        const storedPassword = results[0].password;
        bcrypt.compare(password, storedPassword, async (err, passwordMatch) => {
          if (passwordMatch) {
            const token = await auth.generate_token_user(results[0].id, results[0].email);
            console.log(token);
            results[0].token = token;
            req.session.user = results[0];
            delete results[0].password;
            req.session.sessionID=req.sessionID
            return res.json({
              status: true,
              message: 'Logged in',
              data: { userId: req.sessionID  },
              session: req.session // Use req.session.cookie.data to access the session ID
            });
          } else {
            return res.json({
              status: false,
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
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.log('Error destroying session:', err);
                return res.json({
                    status: false,
                    message: "error while Logging you out"
                })
            }
        });
    }
    return res.json({
        status: true,
        message: "Logged out successfully"
    })
}

exports.sendOtp = async (req, res) => {
    const { email } = req.body;

    await validator.checkMandatoryFields(res, { email })

    if (email)
        if (!validate.isEmail(email)) {
            return res.json({
                success: false,
                message: "Please enter a valid email"
            });
        }

    db.query('select email from user where email=?', [email], (error, response) => {
        if (error) {
            return res.json({
                success: false,
                message: "something went wrong"
            });
        }
        if (response.length == 0) {
            return res.json({
                status: false,
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
                success: false,
                message: "Something went wrong while deleting the OTP",
                error: error
            });
        }

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error inserting OTP:', err);
                return res.json({
                    success: false,
                    message: "Something went wrong while sending the OTP",
                    error: err
                });
            }

            return res.json({
                success: true,
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
                success: false,
                message: "please enter valid emil"
            })
        }

    const sql = 'SELECT otp, validUntill FROM otps WHERE email = ?';
    const values = [email];

    db.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error verifying OTP:', error);
            return res.json({
                success: false,
                message: "Error verifying OTP",
            });
        } else {
            if (results.length > 0) {
                const storedOTP = results[0].otp;
                const validUntill = results[0].validUntill;

                if (storedOTP === otp && validUntill > Date.now()) {
                    return res.json({
                        success: true,
                        message: "OTP is valid",
                    });
                }
                else if (storedOTP === otp && validUntill < Date.now()) {
                    return res.json({
                        success: false,
                        message: "OTP Expired",
                    });
                }
                else if (storedOTP != otp) {
                    return res.json({
                        success: false,
                        message: "OTP not Matched",
                    });
                }
            } else {
                console.log('OTP not found');
                return res.json({
                    success: false,
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
                success: false,
                message: "Please enter a valid email",
            });
        }


    const sql = 'SELECT otp, validUntill FROM otps WHERE email = ?';
    const values = [email];

    db.query(sql, values, async (error, results) => {
        if (error) {
            console.error('Error verifying OTP:', error);
            return res.json({
                success: false,
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
                        success: false,
                        message: "Password updated",
                    });
                }
                else if (storedOTP === otp && validUntill < Date.now()) {
                    return res.json({
                        success: false,
                        message: "OTP Expired",
                    });
                }
                else if (storedOTP != otp) {
                    return res.json({
                        success: false,
                        message: "OTP not Matched",
                    });
                }
            }
        }
    });
}
