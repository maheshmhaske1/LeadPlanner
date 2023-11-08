// const db = require("../db");
const SQL = require('../model/sqlhandler')
const { db } = require('../model/db')
const csv = require('csv-parser');
const validator = require("validator");
const XLSX = require('xlsx');
const fs = require('fs');
const axios = require('axios')
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.createLead = async (req, res) => {
    console.log(req.decoded)
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { org_id,lead_name, company_name, registration_no, employees, value, first_name, last_name, email, status, stage_id } = req.body;
        if (!org_id || !first_name || !last_name || !stage_id||!lead_name) {
            return res.json({
                status: 0,
                message: 'org_id, first_name, last_name,lead_name, stage_id are required values'
            })
        }

        if (email)
            if (!validator.isEmail(email))
                return res.json({
                    status: 0,
                    message: `${email} is not valid email`
                })

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be add",
            });

        req.body.owner = loggedInUser.id
        SQL.insert('lead', req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.affectedRows > 0) {
                SQL.get('company_settings', ``, `setting_name='audit_lead' AND is_enabled=1`, (error, results) => {
                    if (error) {
                        return res.json({
                            status: 0,
                            message: error
                        })
                    }
                    if (results.length > 0)
                        SQL.insert('xx_log', { attr1: `lead:create`, attr2: loggedInUser.id, attr4: `lead created with ${JSON.stringify(req.body)} parameter`, attr5: 'D' }, (error, results) => { })

                })
                return res.json({
                    status: 1,
                    message: 'lead added successfully', results
                })
            }
        });
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            message: error
        })
    }
};

exports.importLead = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    let data = req.body.data
    const owner = loggedInUser.id


    const result = data
    let query = ``
    for (let i = 0; i < result.length; i++) {
        if (!result[i].org_id || !result[i].first_name || !result[i].last_name || !result[i].company_name || !result[i].registration_no ||
            !result[i].employees || !result[i].email || !result[i].value) {
            return res.json({
                status: 0,
                message: `org_id,value, first_name, last_name, company_name, registration_no, employees, email these are required values please check row number ${i + 1}.`
            });
        }

        query += `
              INSERT INTO \`lead\` (\`owner\`,\`org_id\`,\`stage_id\`,\`source\`,\`lead_name\`, \`position\`, \`company_name\`, \`registration_no\`, \`employees\`, \`first_name\`, \`last_name\`,\`type\`, \`value\`, \`address1\`, \`address2\`, \`city\`, \`state\`, \`country\`, \`pin\`, \`phone\`, \`email\`, \`website\`)
              VALUES (
                  ${owner},
                  ${result[i].org_id},
                 '${!result[i].stage_id ? null : result[i].stage_id}',
                 '${!result[i].source ? null : result[i].source}',
                 '${!result[i].lead_name ? '' : result[i].lead_name}',
                 '${!result[i].position ? '' : result[i].position}',
                 '${result[i].company_name}',
                 '${result[i].registration_no}',
                 '${!result[i].employees ? '' : result[i].employees}',
                 '${result[i].first_name}',
                 '${result[i].last_name}',
                 '${!result[i].type ? '' : result[i].type}',
                  ${result[i].value},
                 '${!result[i].address1 ? '' : result[i].address1}',
                 '${!result[i].address2 ? '' : result[i].address2}',
                 '${!result[i].city ? '' : result[i].city}',
                 '${!result[i].state ? '' : result[i].state}',
                 '${!result[i].country ? '' : result[i].country}',
                 '${!result[i].pin ? '' : result[i].pin}', 
                 '${!result[i].phone ? '' : result[i].phone}',
                 '${result[i].email}', 
                 '${!result[i].website ? '' : result[i].website}');`
    }
    console.log(query)
    db.query(query, (err, results) => {
        if (err) {
            return res.json({
                status: 0,
                message: err
            })
        }
        console.log(results)
        if (results.length > 0) {
            SQL.get('company_settings', ``, `setting_name='audit_lead' AND is_enabled=1`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0)
                    SQL.insert('xx_log', { attr1: `lead:imported`, attr2: loggedInUser.id, attr4: `${result.length}||0`, attr5: 'D' }, (error, results) => { console.log(error) })

            })
        }
        return res.json({
            status: 1,
            message: "data imported successfully"
        })
    })
}

exports.updateLead = async (req, res) => {
    try {
        const loggedInUser = req.decoded;
        console.log(loggedInUser)
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            });
        }

        const owner = loggedInUser.id;
        const update_data = req.body;
        if (update_data.leadIds.length === 0) {
            return res.json({
                status: 0,
                message: "please provide leadIds",
            });
        }
        const leads = update_data.leadIds;
        delete update_data.leadIds;

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id, creation_date, update_date cannot be edited",
            });
        }

        SQL.update('lead', update_data, `id IN (${leads})`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: "something went wrong", error,
                });
            }
            SQL.get('company_settings', ``, `setting_name='audit_lead' AND is_enabled=1`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0)
                    SQL.insert('xx_log', { attr1: `lead:update`, attr2: loggedInUser.id, attr3: `updated ${leads} with ${JSON.stringify(update_data)}`, attr5: 'D' }, (error, results) => { console.log(error) })

                // if (update_data.owner) {
                //     let leads = ``
                //     SQL.get(`lead`, ``, `id IN (${leads})`, async (error, result) => {
                //         await result.map(result => {
                //             leads += result.lead_name + ` `
                //         })
                //         const data = {
                //             user_id: update_data.owner,
                //             description: `${leads} assigned to you by ${loggedInUser.user_name}`,
                //             title: "lead Assigned to you"
                //         }
                //         SQL.insert('xx_notifications',data,(error,result)=>{})
                //     })
                // }
            })
            return res.json({
                status: 1,
                message: 'Lead details updated successfully',
                data: results,
            });
        });
    }
    catch (error) {
        console.error("Catch block error:", error);
        return res.json({
            status: 0,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

exports.get = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const owner = loggedInUser.id
        const leadId = req.params.leadId;
        const role = loggedInUser.role
        console.log(leadId)

        const query = `SELECT l.*,lb.name as label_name,lb.colour_code as label_coloure, u.first_name AS ownerf_name, u.last_name AS ownerl_name, u.email AS owner_email, u.phone AS owner_phone FROM \`lead\` l
        LEFT JOIN user u ON l.owner = u.id
        LEFT JOIN label lb ON l.label_id = lb.id
        WHERE l.id = ${leadId} AND l.is_deleted = 0`;
        console.log(query)

        db.query(query, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            SQL.get('company_settings', ``, `setting_name='audit_lead' AND is_enabled=1`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0)
                    SQL.insert('xx_log', { attr1: `lead:get`, attr2: loggedInUser.id, attr3: `get leads`, attr5: 'D' }, (error, results) => { console.log(error) })
            })
            return res.json({
                status: 1,
                message: "lead details",
                data: result
            })
        });


    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            message: error
        })
    }
}

exports.getLeadByOwner = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const userId = req.params.userId;

        const query = `SELECT l.*, lb.name as label_name, lb.colour_code as label_coloure, u.first_name AS ownerf_name, u.last_name AS ownerl_name, u.email AS owner_email, u.phone AS owner_phone,
        stage_master.display_name AS stage_name, stage_master.stage_name AS status FROM \`lead\` l
        LEFT JOIN user u ON l.owner = u.id
        LEFT JOIN label lb ON l.label_id = lb.id
        LEFT JOIN stage_master ON l.stage_id = stage_master.id
        WHERE l.owner = ${userId} AND l.is_deleted = 0`;


        db.query(query, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            SQL.get('company_settings', ``, `setting_name='audit_lead' AND is_enabled=1`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0)
                    SQL.insert('xx_log', { attr1: `lead:get`, attr2: loggedInUser.id, attr3: `get leads`, attr5: 'D' }, (error, results) => { console.log(error) })
            })
            return res.json({
                status: 1,
                message: "lead details",
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

exports.getAll = async (req, res) => {
    try {
        const loggedInUser = req.decoded;
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            });
        }
        const leadOwner = loggedInUser.id;
        // const role = loggedInUser.role
        console.log(loggedInUser)

        const query = `SELECT l.*, lb.name as label_name, lb.colour_code as label_coloure,
                        u.first_name AS ownerf_name, u.last_name AS ownerl_name, 
                        u.email AS owner_email, u.phone AS owner_phone, 
                        stage_master.display_name AS stage_name, stage_master.stage_name AS status
                        FROM \`lead\` l
                        LEFT JOIN user u ON l.owner = u.id
                        LEFT JOIN label lb ON l.label_id = lb.id
                        LEFT JOIN stage_master ON l.stage_id = stage_master.id
                        WHERE l.owner = ${leadOwner} AND l.is_deleted = 0`;

        db.query(query, (error, result) => {
            if (error)
                return res.json({
                    status: 0,
                    message: error
                })
            return res.json({
                status: 1,
                message: "Lead details",
                data: result
            });
        })


    } catch (error) {
        return res.json({
            status: 0,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

exports.convertLeadToDeal = async (req, res) => {
    const { leadId } = req.params

    SQL.get('lead', '', `id=${leadId}`, (error, result) => {
        if (error)
            return res.json({
                status: 0,
                message: error
            })

        if (result.length == 0) {
            return res.json({
                status: 0,
                message: 'please enter valid lead id'
            })
        }
        if (result[0].status == 'Deal') {
            return res.json({
                status: 0,
                message: 'this lead already converted into deal'
            })
        }
        const lead = result[0]
        const deal = {
            lead_id: lead.id,
            status: 'New',
            value: lead.value,
            priority: lead.priority,
            owner: lead.company_name,
            account_name: lead.first_name + ` ` + lead.last_name,
        }

        SQL.insert('deal', deal, (error, result) => {
            if (error)
                return res.json({
                    status: 0,
                    message: error
                })
            const update_lead = { status: "Deal" }
            SQL.update('lead', update_lead, `id=${leadId}`, (error, result) => {
                if (error)
                    return res.json({
                        status: 0,
                        message: error
                    })
                SQL.get('company_settings', ``, `setting_name='audit_lead' AND is_enabled=1`, (error, results) => {
                    if (error) {
                        return res.json({
                            status: 0,
                            message: error
                        })
                    }
                    if (results.length > 0)
                        SQL.insert('xx_log', { attr1: `lead:converted to deal`, attr2: loggedInUser.id, attr4: `lead ${leadId} converted to deal`, attr5: 'D' }, (error, results) => { })
                })
                return res.json({
                    status: 1,
                    message: 'lead successfully converted to deal'
                })

            })
        })
    })
}

exports.moveLeadToTrash = async (req, res) => {

    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const owner = loggedInUser.id
    const { leadIds } = req.body
    if (!leadIds) {
        return res.json({
            status: 0,
            message: "please provide leadIds",
        })
    }

    SQL.update(`lead`, { is_deleted: 1 }, `id IN (${leadIds}) AND owner=${owner}`, (error, results) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        SQL.get('company_settings', ``, `setting_name='audit_lead' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `lead:moved to trash`, attr2: loggedInUser.id, attr4: `lead ${leadIds} moved to trash`, attr5: 'D' }, (error, results) => { console.log(error) })
        })
        return res.json({
            status: 1,
            message: "lead moved to trash",
            data: results
        })
    });
}

exports.getAllLeadFromTrash = async (req, res) => {

    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id
    const { org_id } = req.body

    if (!org_id) {
        return res.json({
            status: 0,
            message: "org_id is required field"
        })
    }

    SQL.get('lead', ``, `is_deleted = 1 AND (owner = ${owner} OR owner IN (SELECT id FROM user WHERE manager_id = ${owner})) AND org_id=${org_id}`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        SQL.get('company_settings', ``, `setting_name='audit_lead' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `lead:get from trash`, attr2: loggedInUser.id, attr3: `get leads from trash`, attr5: 'D' }, (error, results) => { console.log(error) })
        })
        return res.json({
            status: 1,
            message: "lead details",
            data: result
        })
    })
}

exports.restoreLeadFromTrash = async (req, res) => {

    const { leadIds } = req.body
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.update(`lead`, { is_deleted: 0 }, `id IN (${leadIds}) AND is_deleted = 1 AND (owner = ${owner} OR owner IN (SELECT id FROM user WHERE manager_id = ${owner}))`, (error, results) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        SQL.get('company_settings', ``, `setting_name='audit_lead' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `lead:restore from trash`, attr2: loggedInUser.id, attr4: `lead ${leadIds} restore from trash`, attr5: 'D' }, (error, results) => { })
        })
        return res.json({
            status: 1,
            message: "lead restored",
            data: results
        })
    });
}

exports.deleteLeadFromTrash = async (req, res) => {

    const { leadIds } = req.body
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.delete('lead', `id IN (${leadIds}) AND is_deleted = 1 AND (owner = ${owner} OR owner IN (SELECT id FROM user WHERE manager_id = ${owner}))`, (error, result) => {

        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        SQL.get('company_settings', ``, `setting_name='audit_lead' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `lead:deleted from trash`, attr2: loggedInUser.id, attr4: `lead ${leadIds} deleted from trash`, attr5: 'D' }, (error, results) => { })
        })
        return res.json({
            status: 1,
            message: "leads deleted permanently",
            data: result
        })
    })

}

exports.exportLeadsInCsv = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.get('lead', ``, `owner=${owner}`, (error, result) => {
        SQL.get('company_settings', ``, `setting_name='audit_lead' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `lead:export lead to .csv`, attr2: loggedInUser.id, attr4: `leads exported`, attr5: 'D' }, (error, results) => { })
        })
        const data = result

        function generateExcelBuffer(data) {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        }

        const excelBuffer = generateExcelBuffer(data);

        res.setHeader('Content-Disposition', 'attachment; filename=lead.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(excelBuffer);
    })
}

exports.renameLeadDealField = async (req, res) => {
    const loggedInUser = req.decoded;
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        });
    }
    console.log(req.body)

    const { oldFieldName, newFieldName, tableName, isActive } = req.body;
    if (!oldFieldName || !newFieldName || !tableName || isActive === undefined) {
        return res.json({
            status: 0,
            message: "oldFieldName, newFieldName,isActive and tableName are required fields",
        });
    }

    const query = `ALTER TABLE \`${tableName}\` RENAME COLUMN \`${oldFieldName}\` TO \`${newFieldName}\``;

    db.query(query, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: "something went wrong",
                error,
            });
        }

        let query = `update field_management set field_name='${newFieldName}',is_active=${isActive} where source='${tableName}' AND field_name='${oldFieldName}'`
        console.log(query)
        db.query(query, (error, result) => { })

        return res.json({
            status: 1,
            message: "Field is Changed",
        });
    });
};


exports.getLeadDealColumnNames = async (req, res) => {
    const loggedInUser = req.decoded;
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        });
    }

    const { tableName } = req.params;

    if (!tableName) {
        return res.json({
            status: 0,
            message: "tableName is a required field"
        });
    }

    const query = `DESCRIBE \`${tableName}\``; // Use backticks to escape the table name
    db.query(query, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: "something went wrong",
                error
            });
        }
        return res.json({
            status: 1,
            message: `Table ${tableName} info.`,
            data: result
        });
    });
};

exports.getAllEnabledFieldsFromLeadDeal = async (req, res) => {
    const loggedInUser = req.decoded;
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        });
    }

    const { tableName } = req.params
    if (!tableName) {
        return res.json({
            status: 0,
            message: "tableName is required fields"
        })
    }

    SQL.get('field_management', ``, `source='${tableName}'`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: "something went wrong", error,
            });
        }
        return res.json({
            status: 1,
            message: `all fields for ${tableName}`,
            data: result,
        });

    })
}


exports.activateDeactivateTableField = async (req, res) => {
    const loggedInUser = req.decoded;
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        });
    }

    const { tableName, fieldName, is_active } = req.params
    if (!tableName || !fieldName || !is_active) {
        return res.json({
            status: 0,
            message: "tableName,fieldName,is_active are required fields"
        })
    }

    SQL.update('field_management', { is_active }, `source='${tableName}' AND field_name='${fieldName}'`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: "something went wrong", error,
            });
        }
        return res.json({
            status: 1,
            message: `field status changed`,
            data: result,
        });

    })
}


exports.sendEmailToLeadDeal = async (req, res) => {
    const loggedInUser = req.decoded;
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        });
    }

    let { html, to, cc, subject, source, source_id } = req.body

    if (!html || !to || !cc || !subject || !source || !source_id) {
        return res.json({
            status: 0,
            message: " html, to, cc, subject,source,source_id are required fields"
        })
    }

    SQL.get(`${source}`, ``, `id=${source_id} AND is_deleted=0`, async (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (result.length == 0) {
            return res.json({
                status: 0,
                message: 'invalid source or source id'
            })
        }
        await sendEmail()
        function saveEmail() {
            SQL.insert('sentemail_history', { recipient: JSON.stringify(to), html, subject, cc: JSON.stringify(cc), source, source_id }, (error, result) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                else {
                    return res.json({
                        status: 1,
                        message: "email sent successfully."
                    })
                }
            })
        }

        function sendEmail() {

            let data = {
                "sender": {
                    "name": "Mahesh Mhaske",
                    "email": "maheshmhaske241198@gmail.com"
                },
                "to": to,
                "cc": cc,
                attachments: [
                    {
                        filename: "attachment-file.pdf", // Replace with the actual file name
                        path: "https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox?projector=1", // Replace with the actual file path
                    }
                ],
                "subject": subject,
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
                    saveEmail()
                })
                .catch((error) => {
                    return res.json({
                        status: 0,
                        message: "something went wrong", error
                    })
                });
        }

    })

}


exports.getLeadDealsentEmail = async (req, res) => {
    const loggedInUser = req.decoded;
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        });
    }

    let { source, source_id } = req.body

    if (!source || !source_id) {
        return res.json({
            status: 0,
            message: " source,source_id are required fields"
        })
    }

    SQL.get(`sentemail_history`, ``, `source_id=${source_id} AND source='${source}'`, async (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (result.length == 0) {
            return res.json({
                status: 0,
                message: 'invalid source or source id'
            })
        }
        return res.json({
            status: 1,
            message: `sent emails`,
            data: result,
        });

    })

}

