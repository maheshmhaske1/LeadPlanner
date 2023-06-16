const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validators = require('validator')
const db = require("../db");
const validator = require("../middleware/validators");

exports.createAccount = async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone, address1, address2, address3, city, state, country, postcode } = req.body
        validator.checkMandatoryFields(res, { first_name, last_name, email, password, phone, address1, city, state, country, postcode })

        if (!validators.isEmail(email)) {
            return res.json({
                status: false,
                message: `${email} this is not an valid email`
            })
        }

        const hashedPassword = bcrypt.hash(password, 10);

        const query = `
        INSERT INTO user
                (first_name,
                 last_name,
                 email,
                 password,
                 phone,
                 address1,
                 address2,
                 address3,
                 city,
                 state,
                 country,
                 postcode)
        VALUES   (?,
                 ?,
                 ?,
                 ?,
                 ?,
                 ?,
                 ?,
                 ?,
                 ?,
                 ?,
                 ?,
                 ? ) 
        `;
        const values = [first_name, last_name, email, hashedPassword, phone, address1, address2, address3, city, state, country, postcode];

        db.query(query, values, (error, response) => {
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
                    message: 'account created',
                    data: { id: response.insertId }
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

};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    await validator.checkMandatoryFields(req, { username, password })

    // const query = `SELECT * FROM user WHERE email = ? OR phone=?`;
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
        console.log("results ==>", results);
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
                bcrypt.compare(password, storedPassword, (err, passwordMatch) => {
                    if (passwordMatch) {
                        delete results[0].password
                        return res.json({
                            status: true,
                            message: 'Logged in',
                            data: results
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


