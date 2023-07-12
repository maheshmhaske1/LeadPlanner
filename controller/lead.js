// const db = require("../db");
const SQL = require('../model/sqlhandler')
const db = require('../model/db')
const csv = require('csv-parser');
const validator = require("validator");
const fs = require('fs');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.createLead = async (req, res) => {
    try {
        const { company_name, registration_no, employees, value, first_name, last_name, email, status } = req.body;


        if (!first_name || !last_name || !company_name || !registration_no || !employees || !email || !status || !value) {
            return res.json({
                status: 1,
                message: 'first_name, last_name, company_name, registration_no, value ,employees, ,status ,email these are required values'
            })
        }

        if (!validator.isEmail(email))
            return res.json({
                status: 1,
                message: `${email} is not valid email`
            })

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: 1,
                message: "id ,creation_date ,update_date cannot be add",
            });

        SQL.insert('lead', req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: 1,
                    error: error
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
            error: error
        })
    }
};

exports.importLead = async (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    if (!req.body.userId) {
        return res.json({
            status: 0,
            message: "please provide userId"
        })
    }

    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    if (fileExtension !== "csv") {
        return res.json({
            status: 0,
            message: `please provide .csv file .${fileExtension} format not allowed`
        })
    }

    const result = [];
    let resultLength = 0;

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
                      INSERT INTO \`lead\` (\`source\`,\`lead_name\`, \`position\`,\`status\`, \`company_name\`, \`registration_no\`, \`employees\`, \`first_name\`, \`last_name\`, \`priority\`,\`type\`, \`value\`, \`address1\`, \`address2\`, \`city\`, \`state\`, \`country\`, \`pin\`, \`phone\`, \`email\`, \`website\`)
                      VALUES ('${!result[i].source ? null : result[i].source}', '${!result[i].lead_name ? '' : result[i].lead_name}','${!result[i].position ? '' : result[i].position}','${result[i].status}', '${result[i].company_name}', '${result[i].registration_no}', '${!result[i].employees ? '' : result[i].employees}','${result[i].first_name}', '${result[i].last_name}', '${result[i].priority}', '${!result[i].type ? '' : result[i].type}', ${result[i].value},'${!result[i].address1 ? '' : result[i].address1}', '${!result[i].address2 ? '' : result[i].address2}', '${!result[i].city ? '' : result[i].city}', '${!result[i].state ? '' : result[i].state}','${!result[i].country ? '' : result[i].country}', '${!result[i].pin ? '' : result[i].pin}', '${!result[i].phone ? '' : result[i].phone}','${result[i].email}', '${!result[i].website ? '' : result[i].website}');`
            }
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


        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be edit"
            })
        }

        SQL.update('lead', update_data, `id=${leadId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: 'lead details updated successfully',
                    data: results
                })
            }
        })
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            error: error
        })
    }
}

exports.get = async (req, res) => {
    console.log("req.session.userId ==>", req.session)

    try {
        const leadId = req.params.leadId;
        SQL.get(`lead`, ``, `id=${leadId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            return res.json({
                status: 1,
                message: "lead details",
                data: results
            })
        });
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            error: error
        })
    }
}

exports.getAll = async (req, res) => {
    try {
        let Open = [];
        let New = [];
        let Unread = [];
        let InProgress = [];

        SQL.get(`lead`, ``, `status="Open"`, async (error, results) => {
            Open = results;
            await SQL.get('lead', '', 'status="New"', async (error, result) => {
                New = result;
                await SQL.get('lead', '', 'status="Unread"', async (error, result) => {
                    Unread = result;
                    await SQL.get('lead', '', 'status="In Progress"', (error, result) => {
                        InProgress = result;
                        if (error)
                            return res.json({
                                status: 0,
                                error: error
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
            error: error,
        });
    }
};

exports.convertLeadToDeal = async (req, res) => {
    const { leadId } = req.params

    SQL.get('lead', '', `id=${leadId}`, (error, result) => {
        if (error)
            return res.json({
                status: 0,
                error: error
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
                    error: error
                })
            const update_lead = { status: "Deal" }
            SQL.update('lead', update_lead, `id=${leadId}`, (error, result) => {
                if (error)
                    return res.json({
                        status: 0,
                        error: error
                    })
                return res.json({
                    status: 1,
                    message: 'lead successfully converted to deal'
                })

            })
        })
    })
}
