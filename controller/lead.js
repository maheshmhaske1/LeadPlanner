// const db = require("../db");
const SQL = require('../model/sqlhandler')
const { db } = require('../model/db')
const csv = require('csv-parser');
const validator = require("validator");
const XLSX = require('xlsx');
const fs = require('fs');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.createLead = async (req, res) => {
    console.log(req.decoded)
    try {
        const { company_name, registration_no, employees, value, first_name, last_name, email, status } = req.body;
        const loggedInUser = req.decoded
        if (!loggedInUser || loggedInUser.role != 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }
        if (!first_name || !last_name || !company_name || !registration_no || !employees || !email || !status || !value) {
            return res.json({
                status: 0,
                message: 'first_name, last_name, company_name, registration_no, value ,employees, ,status ,email these are required values'
            })
        }

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
                return res.json({
                    status: 1,
                    message: 'lead added successfully', results
                })
            }
        });
    }
    catch (error) {
        return res.json({
            status: 1,
            message: "something went wrong",
            message: error
        })
    }
};

exports.importLead = async (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const owner = loggedInUser.id
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    if (fileExtension !== "csv") {
        return res.json({
            status: 0,
            message: `please provide .csv file .${fileExtension} format not allowed`
        })
    }

    const result = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            result.push(data);
        })
        .on('end', () => {
            fs.unlinkSync(req.file.path);
            if (result.length == 0) {
                return res.json({
                    status: 0,
                    message: `${req.file.originalname} is Empty`
                })
            }
            let failCount = 0
            let successCount = 0

            let query = ``
            for (let i = 0; i < result.length; i++) {
                if (!result[i].first_name || !result[i].last_name || !result[i].company_name || !result[i].registration_no ||
                    !result[i].employees || !result[i].email || !result[i].value || !result[i].status) {
                    return res.json({
                        status: 0,
                        message: `value, status, first_name, last_name, company_name, registration_no, employees, email these are required values please check row number ${i + 1}.`
                    });
                }

                query += `
                      INSERT INTO \`lead\` (\`owner\`,\`source\`,\`lead_name\`, \`position\`,\`status\`, \`company_name\`, \`registration_no\`, \`employees\`, \`first_name\`, \`last_name\`, \`priority\`,\`type\`, \`value\`, \`address1\`, \`address2\`, \`city\`, \`state\`, \`country\`, \`pin\`, \`phone\`, \`email\`, \`website\`)
                      VALUES (${owner},'${!result[i].source ? null : result[i].source}', '${!result[i].lead_name ? '' : result[i].lead_name}','${!result[i].position ? '' : result[i].position}','${result[i].status}', '${result[i].company_name}', '${result[i].registration_no}', '${!result[i].employees ? '' : result[i].employees}','${result[i].first_name}', '${result[i].last_name}', '${result[i].priority}', '${!result[i].type ? '' : result[i].type}', ${result[i].value},'${!result[i].address1 ? '' : result[i].address1}', '${!result[i].address2 ? '' : result[i].address2}', '${!result[i].city ? '' : result[i].city}', '${!result[i].state ? '' : result[i].state}','${!result[i].country ? '' : result[i].country}', '${!result[i].pin ? '' : result[i].pin}', '${!result[i].phone ? '' : result[i].phone}','${result[i].email}', '${!result[i].website ? '' : result[i].website}');`
            }
            console.log(query)
            db.query(query, (err, result) => {
                if (err) {
                    return res.json({
                        status: 0,
                        message: err
                    })
                }
                else
                    return res.json({
                        status: 1,
                        message: "data imported successfully"
                    })
            })

        });
}

exports.updateLead = async (req, res) => {
    try {
        const { leadId } = req.params
        const update_data = req.body

        const loggedInUser = req.decoded
        if (!loggedInUser || loggedInUser.role !== 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        if (update_data.id || update_data.creation_date || update_data.update_date || update_data.owner) {
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date and owner cannot be edit"
            })
        }

        SQL.get('lead', '', `id=${leadId} AND owner=${loggedInUser.id} AND is_deleted=0`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
        })

        SQL.update('lead', update_data, `id=${leadId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: 'lead details updated successfully',
                data: results
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

exports.get = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser || loggedInUser.role !== 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const owner = loggedInUser.id
        const leadId = req.params.leadId;
        console.log(leadId)

        SQL.get('lead', ``, `id=${leadId} AND owner=${owner} AND is_deleted=0`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (result.length == 0 || result[0].owner !== owner) {
                return res.json({
                    status: 0,
                    message: 'Not permitted or Invalid Lead'
                })
            }
            const query = `SELECT l.*, u.first_name AS ownerf_name, u.last_name AS ownerl_name, u.email AS owner_email, u.phone AS owner_phone FROM \`lead\` l
            INNER JOIN user u ON l.owner = u.id
            WHERE l.owner = ${owner} AND l.id = ${leadId} AND l.is_deleted = 0`;

            db.query(query, (error, result) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                return res.json({
                    status: 1,
                    message: "lead details",
                    data: result
                })
            });
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

        const loggedInUser = req.decoded
        if (!loggedInUser || loggedInUser.role !== 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        let leadOwner = loggedInUser.id
        let Open = [];
        let New = [];
        let Unread = [];
        let InProgress = [];

        SQL.get(`lead`, ``, `status="Open" AND owner=${leadOwner} AND is_deleted=0`, async (error, results) => {
            Open = results;
            await SQL.get('lead', '', `status="New" AND owner=${leadOwner} AND is_deleted=0`, async (error, result) => {
                New = result;
                await SQL.get('lead', '', `status="Unread" AND owner=${leadOwner} AND is_deleted=0`, async (error, result) => {
                    Unread = result;
                    await SQL.get('lead', '', `status="In Progress" AND owner=${leadOwner} AND is_deleted=0`, (error, result) => {
                        InProgress = result;
                        if (error)
                            return res.json({
                                status: 0,
                                message: error
                            });

                        return res.json({
                            status: 1,
                            message: "Lead details",
                            data: {
                                New,
                                Open,
                                Unread,
                                InProgress,
                            }
                        })
                    })
                })
            })
        })
    } catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            message: error,
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
    if (!loggedInUser || loggedInUser.role != 1) {
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
        return res.json({
            status: 1,
            message: "lead moved to trash",
            data: results
        })
    });
}

exports.getAllLeadFromTrash = async (req, res) => {

    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.get('lead', ``, `is_deleted = 1 AND (owner = ${owner} OR owner IN (SELECT id FROM user WHERE manager_id = ${owner}))`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
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
    if (!loggedInUser || loggedInUser.role != 1) {
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
            return res.json({
                status: 1,
                message: "lead restored",
                data: results
            })
        });
}

exports.restoreAllLeadFromTrash = async (req, res) => {

    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.get('lead', ``, `owner=${owner} AND is_deleted=1`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (result.length == 0) {
            return res.json({
                status: 0,
                message: 'No lead mark as deleted'
            })
        }
        SQL.update(`lead`, { is_deleted: 0 }, `owner=${owner} AND is_deleted=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: "leads restored",
                data: results
            })
        });
    })
}

exports.deleteLeadFromTrash = async (req, res) => {

    const { leadId } = req.body
    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.get('lead', ``, `id=${leadId} AND owner=${owner}  AND is_deleted=1`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (result.length == 0) {
            return res.json({
                status: 0,
                message: 'no data found'
            })
        }
        const leadId = result[0].id
        SQL.delete(`lead`, `id=${leadId} AND owner=${owner} AND is_deleted=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            SQL.delete('notes', `source_id=${leadId}`, (error, result) => { })
            return res.json({
                status: 1,
                message: "lead deleted permanently",
                data: results
            })
        });
    })
}

exports.deleteAllLeadFromTrash = async (req, res) => {

    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.get('lead', ``, `owner=${owner} AND is_deleted=1`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (result.length == 0) {
            return res.json({
                status: 0,
                message: 'No data found'
            })
        }
        const numbersArray = result.map(obj => obj.id);
        const leads = numbersArray.join(',');

        SQL.delete(`lead`, `owner=${owner} AND is_deleted=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            SQL.delete('notes', `source_id IN (${leads})`, (error, result) => { })
            return res.json({
                status: 1,
                message: "leads deleted permanently",
                data: results
            })
        });
    })
}

exports.exportLeadsInCsv = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.get('lead', ``, `owner=${owner}`, (error, result) => {
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

exports.assignLead = async (req, res) => {
    try {

        const loggedInUser = req.decoded
        if (!loggedInUser || loggedInUser.role !== 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const owner = loggedInUser.id
        const { leadId, userId } = req.body

        if (!leadId || !userId) {
            return res.json({
                status: 0,
                message: "leadId and userId are required fields"
            })
        }

        SQL.get('lead', ``, `id=${owner}`)
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            message: error
        })
    }
}