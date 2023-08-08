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
        let update_data = req.body
        console.log(update_data.active)

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be edit"
            })
        }

        if (!update_data.hasOwnProperty("active") || !update_data.hasOwnProperty("value")) {
            return res.json({
                status: 0,
                message: "at least one field required from active and value"
            });
        }

        SQL.update('password_settings', update_data, `id=${passSettingId}`, (error, result) => {
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
        let condition = loggedInUser.role == 1 ? `` : ``;
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

exports.addLabel = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser || loggedInUser.role != 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { name, colour_code } = req.body
        if (!colour_code || !name) {
            return res.json({
                status: 0,
                message: "name, colour_code are required fields",
            })
        }



        SQL.insert(`label`, { name, colour_code }, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: `label is added.`,
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

exports.updateLabel = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser || loggedInUser.role != 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { labelId } = req.params
        const update_data = req.body

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be edit"
            })
        }

        SQL.update('label', update_data, `id=${labelId}`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: 'label updated',
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

exports.deleteLabel = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser || loggedInUser.role != 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { labelId } = req.params

        SQL.get('label', ``, `id=${labelId}`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            console.log(result.length)
            if (result.length == 0) {
                return res.json({
                    status: 0,
                    message: `please provide valid labelId`
                })
            }
            SQL.delete('label', `id=${labelId}`, (error, result) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                return res.json({
                    status: 1,
                    message: "label deleted",
                    data: result
                })
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

exports.getAllLabels = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        console.log(loggedInUser)
        if (!loggedInUser || loggedInUser.role != 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        SQL.get('label', ``, ``, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: "labels",
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