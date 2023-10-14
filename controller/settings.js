// const db = require("../db");
const { db } = require('../model/db')
const SQL = require('../model/sqlhandler')

// exports.addPasswordTerm = async (req, res) => {
//     try {
//         const loggedInUser = req.decoded
//         if (!loggedInUser) {
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
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }
        const { org_id } = req.params
        let update_data = req.body


        update_data.data.map(async (update_data) => {
            if (update_data.creation_date || update_data.update_date) {
                return res.json({
                    status: 0,
                    message: "creation_date ,update_date cannot be edit"
                })
            }
            if (!update_data.hasOwnProperty("active") || !update_data.hasOwnProperty("value")) {
                return res.json({
                    status: 0,
                    message: "at least one field required from active and value"
                });
            }
            let id = update_data.id
            delete update_data.id
            console.log(update_data)
            await SQL.update('password_settings', update_data, `id=${id} AND org_id=${org_id}`, (error, result) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: "---->", error, result
                    })
                }
            })
        })
        return res.json({
            status: 1,
            message: 'password settings changed successfully.'
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

        const { org_id } = req.body
        if (!org_id) {
            return res.json({
                status: 0,
                message: "org_id is required"

            })
        }

        SQL.get('password_settings', ``, `org_id=${org_id}`, (error, result) => {
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
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { name, colour_code, org_id } = req.body
        if (!colour_code || !name || !org_id) {
            return res.json({
                status: 0,
                message: "name, colour_code, org_id are required fields",
            })
        }

        SQL.insert(`label`, { name, colour_code, org_id }, (error, result) => {
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
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const update_data = req.body.data
        if (!update_data) {
            return res.json({
                status: 0,
                message: "please provide data"
            })
        }

        update_data.map((update_data, i) => {
            if (update_data.creation_date || update_data.update_date) {
                return res.json({
                    status: 0,
                    message: "creation_date ,update_date cannot be edit"
                })
            }
            if (!update_data.id) {
                return res.json({
                    status: 0,
                    message: `id at ${i} object is missing`
                })
            }
            let labelId = update_data.id
            delete update_data.id

            SQL.update('label', update_data, `id=${labelId}`, (error, result) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
            })
        })
        return res.json({
            status: 1,
            message: 'label updated'
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
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { labelIds } = req.body

        if (!labelIds) {
            return res.json({
                status: 0,
                message: "Please provide labelid",
            })
        }

        const query1 = `SELECT * FROM \`lead\` where label_id IN (${labelIds})`;
        const query2 = `SELECT * FROM \`deal\` where label_id IN (${labelIds})`;

        const executeQueries = () => {
            return Promise.all([
                executeQuery(query1),
                executeQuery(query2),
            ]);
        };

        const executeQuery = (query) => {
            return new Promise((resolve, reject) => {
                db.query(query, (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
        };

        executeQueries()
            .then(async ([result1, result2]) => {
                if (result1.length > 0 || result2.length > 0) {
                    return res.json({
                        status: 0,
                        message: `Can't delete label. Label assigned to ${result1.length} leads and ${result2.length} deals`
                    })
                }
                else {
                    await SQL.update('label', { is_deleted: 1 }, `id IN (${labelIds})`, (error, result) => {
                        if (error) {
                            return res.json({
                                status: 0,
                                message: error
                            })
                        }
                        SQL.update('lead', { label_id: -1 }, `label_id IN (${labelIds})`, (error, result) => { })
                        return res.json({
                            status: 1,
                            message: "Label deleted",
                            data: result
                        })
                    })
                }
            })
            .catch((error) => {
                return res.json({
                    status: 0,
                    message: "Something went wrong"
                })
            });
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "Something went wrong",
            message: error
        })
    }
}


exports.getAllLabels = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        console.log(loggedInUser)
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { org_id } = req.body
        if (!org_id) {
            return res.json({
                status: 0,
                message: "org_id is required"
            })
        }

        SQL.get('label', ``, `is_deleted=0 AND org_id = ${org_id}`, (error, result) => {
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

exports.getAllLabelsForEntity = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        console.log(loggedInUser)
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { entity } = req.params
        const { org_id } = req.body
        if (!org_id) {
            return res.json({
                status: 0,
                message: "org_id is required"
            })
        }

        SQL.get('label', ``, `entity LIKE '%${entity}%' AND is_deleted=0 AND org_id=${org_id}`, (error, result) => {
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

exports.updateAudit = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        console.log(loggedInUser)
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }


        const { id } = req.params
        const { is_enabled } = req.body

        if (is_enabled === undefined || is_enabled === null) {
            return res.json({
                status: 0,
                message: "is_enabled is a required field",
            });
        }

        SQL.update('company_settings', { is_enabled: is_enabled }, `id=${id}`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: "audit edited",
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

exports.getAllAudits = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        console.log(loggedInUser)
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        SQL.get('company_settings', ``, ``, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: "company settings",
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

exports.getAllRequiredDocForDeal = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { source_type } = req.params

    SQL.get('document_master', ``, `source_type='${source_type}' AND is_required=1`, (error, results) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        return res.json({
            status: 1,
            message: "All documents",
            data: results
        })
    })
}

exports.addDocumentInDocMaster = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { source_type, document_name, is_required } = req.body

    if (!document_name || !is_required || !source_type) {
        return res.json({
            status: 0,
            message: "document_name, is_required, source_type  are required fields"
        })
    }

    SQL.insert('document_master', req.body, (error, results) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        return res.json({
            status: 1,
            message: "Document Added",
            data: results
        })
    })
}

exports.updateMasterDoc = async (req, res) => {
    try {
        const loggedInUser = req.decoded;
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            });
        }

        const update_data = req.body;
        if (update_data.docId.length === 0) {
            return res.json({
                status: 0,
                message: "please provide docId",
            });
        }
        const docId = update_data.docId;
        delete update_data.docId;

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id, creation_date, update_date cannot be edited",
            });
        }

        SQL.update('document_master', update_data, `id IN (${docId})`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: "something went wrong", error,
                });
            }
            return res.json({
                status: 1,
                message: 'Deals details updated successfully',
                data: results,
            });
        });
    }
    catch (error) {
        console.error("Catch block error:", error);
        return res.json({
            status: 0,
            message: "Something went wrong",
        });
    }
}

exports.getLogs = async (req, res) => {
    try {
        const loggedInUser = req.decoded;
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            });
        }

        const { logName } = req.params;

        if (!logName) {
            return res.json({
                status: 0,
                message: "logName is required field",
            });
        }

        const query = `SELECT xx_log.*,user.first_name as created_userfname,user.last_name as created_userlname 
        FROM xx_log 
        LEFT JOIN user ON user.id = xx_log.attr2
        WHERE attr1="${logName}" ORDER BY id DESC`
        db.query(query, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: "All logs",
                data: result
            })
        })
        // SQL.get('xx_log', ``, `attr1="${logName}"`, (error, result) => {
        //     if (error) {
        //         return res.json({
        //             status: 0,
        //             message: error
        //         })
        //     }
        //     return res.json({
        //         status: 1,
        //         message: "All logs",
        //         data: result
        //     })
        // })
    }
    catch (error) {
        console.error("Catch block error:", error);
        return res.json({
            status: 0,
            message: "Something went wrong",
        });
    }
}