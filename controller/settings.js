// const db = require("../db");
const SQL = require('../model/sqlhandler')

// exports.addPasswordTerm = async (req, res) => {
//     try {
//         const loggedInUser = req.decoded
//         if (!loggedInUser || loggedInUser.role != 1) {
//             return res.json({
//                 status: 0,
//                 message: "Not Authorized",
//             })
//         }

//         const { term, active, description } = req.body
//         if (!term || !active || !description) {
//             return res.json({
//                 status: 0,
//                 message: "term, active, description are required fields",
//             })
//         }

//         SQL.get('password_settings', ``, ``, (error, result) => {
//             if (error) {
//                 return res.json({
//                     status: 0,
//                     error: error
//                 })
//             }
//             if (results.affectedRows < 0) {
//                 return res.json({
//                     status: 1,
//                     message: 'password terms are already added'
//                 })
//             }

//             SQL.insert(`password_settings`, { term, active, description }, (error, result) => {
//                 if (error) {
//                     return res.json({
//                         status: 0,
//                         error: error
//                     })
//                 }
//                 return res.json({
//                     status: 1,
//                     message: `password setting is added.`,
//                     data: result
//                 })
//             })
//         })
//     }
//     catch (error) {
//         return res.json({
//             status: 0,
//             message: "something went wrong",
//             message: error
//         })
//     }
// }

exports.updatePasswordSetting = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser || loggedInUser.role != 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }
        const { passSettingId } = req.params
        const { active } = req.body


        if (active === undefined || active === null) {
            return res.json({
                status: 0,
                message: "active is required value",
            });
        }


        SQL.update('password_settings', { active }, `id=${passSettingId}`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (result.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: 'password settings changed successfully.',
                    data: result
                })
            }
        })
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            message: error
        })
    }
}

exports.getPasswordSetting = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }
        console.log(loggedInUser)
        let condition = loggedInUser.role == 1 ? `` : `active=1`;
        SQL.get('password_settings', ``, condition, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: 'password settings',
                data: result
            })
        })
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            message: error
        })
    }
}
