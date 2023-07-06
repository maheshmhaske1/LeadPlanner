// const db = require("../db");
const SQL = require('../model/sqlhandler')
const validator = require("validator");
const fs = require('fs');
const csv = require('csvtojson');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.createLead = async (req, res) => {
    try {
        const { company_name, registration_no, employees, value, first_name, last_name, email, status } = req.body;


        if (!first_name || !last_name || !company_name || !registration_no || !employees || !email || !status || !value) {
            return res.json({
                status: 1,
                message: 'first_name, last_name, company_name, gender, registration_no, ,value ,employees, ,status ,email these are required values'
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

    const results = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            results.push(data);
        })
        .on('end', () => {
            fs.unlinkSync(req.file.path);
            res.json({ data: results });
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
    try {
        const leadId = req.params.leadId;
        SQL.get(`lead`, ``, `status="Open"`, (error, results) => {
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
