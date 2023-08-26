const { db } = require('../model/db');
const SQL = require('../model/sqlhandler')
const fs = require("fs");
const validator = require("validator");

exports.createDeal = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const {
            lead_id, deal_name, email, mobile, currency, status, label_id,
            organization, probability, closure_date, priority, contact, value, pipeline_id
        } = req.body;


        if (!deal_name || !email || !mobile || !probability || !value || !closure_date || !label_id) {
            return res.json({
                status: 0,
                message: 'deal_name, email, value, mobile , probability ,closure_date, label_id these are required values'
            })
        }

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be add",
            });

        req.body.owner = loggedInUser.id

        await SQL.get('label', ``, `id=${label_id}`, async (error, result) => {
            console.log(result)
            if (result.length === 0) {
                return res.json({
                    status: 0,
                    message: 'please provide valid label_id'
                })
            }

            SQL.insert('deal', req.body, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.affectedRows > 0) {
                    SQL.get('company_settings', ``, `setting_name='audit_deal' AND is_enabled=1`, (error, results) => {
                        if (error) {
                            return res.json({
                                status: 0,
                                message: error
                            })
                        }
                        if (results.length > 0)
                            SQL.insert('xx_log', { attr1: `deal:create`, attr2: loggedInUser.id, attr4: `deal created with ${JSON.stringify(req.body)} parameter`, attr5: 'D' }, (error, results) => { })

                    })
                    return res.json({
                        status: 1,
                        message: 'deal created successfully',
                        data: results
                    })
                }
            });
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

exports.updateDeal = async (req, res) => {
    try {
        const loggedInUser = req.decoded;
        if (!loggedInUser || loggedInUser.role !== 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            });
        }

        const owner = loggedInUser.id;
        const update_data = req.body;
        const { dealIds } = req.params;

        if (!dealIds) {
            return res.json({
                status: 0,
                message: "please provide dealIds",
            });
        }

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id, creation_date, update_date cannot be edited",
            });
        }


        // SQL.get('deal', ``, `id IN (${dealIds}) AND owner = ${owner}`, (error, result) => {
        //     if (error) {
        //         return res.json({
        //             status: 0,
        //             message: "something went wrong", error,
        //         });
        //     }
        //     if (result.length === 0) {
        //         return res.json({
        //             status: 0,
        //             message: 'please provide valid dealId'
        //         })
        //     }

        //     const stagesComplete = result[0].stages_complete;
        //     let requiredStages = ''
        //     console.log("stagesComplete", stagesComplete)
        //     if (update_data.update_stage_id) {
        //         SQL.get('workflow', ``, `deal_stage IN (${update_data.update_stage_id})`, (error, result) => {
        //             if (error) {
        //                 return res.json({
        //                     status: 0,
        //                     message: "something went wrong", error,
        //                 });
        //             }
        //             requiredStages = result[0].required_stages;
        //             console.log("requiredStages", requiredStages)
        //         })
        //         const stagesCompleteArray = stagesComplete.split(',');
        //         const requiredStagesArray = requiredStages.split(',');

        //         const missingStages = requiredStagesArray.filter(stage => !stagesCompleteArray.includes(stage)).join(',')

        //         if (missingStages.length > 0 || requiredStagesArray.length > 0) {
        //             console.log('All required stages are completed.');
        //         } else {
        //             console.log('Not all required stages are completed.');
        //             console.log(`Missing stages: ${missingStages}`);
        //         }

        //         if (missingStages.length > 0) {
        //             SQL.get('deal_stage_master', ``, `id IN ${missingStages}`, (error, result) => {
        //                 console.log(result)
        //             })
        //         }
        //     }
        // })
        SQL.update('deal', update_data, `id IN (${dealIds}) AND owner = ${owner}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: "something went wrong", error,
                });
            }
            SQL.get('company_settings', ``, `setting_name='audit_deal' AND is_enabled=1`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0)
                    SQL.insert('xx_log', { attr1: `deal:update`, attr2: loggedInUser.id, attr3: `updated ${dealIds} with ${JSON.stringify(update_data)}`, attr5: 'D' }, (error, results) => { console.log(error) })
            })
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
        const dealId = req.params.dealId;

        const query = `SELECT deal.*,label.name as label_name, label.colour_code as label_coloure,
            user.first_name AS ownerf_name, user.last_name AS ownerl_name from deal
            LEFT JOIN user ON user.id = deal.owner
            LEFT JOIN label ON label.id = deal.label_id
            WHERE deal.id =${dealId} AND deal.owner = ${owner} AND deal.is_deleted = 0`;

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
                    SQL.insert('xx_log', { attr1: `deal:get`, attr2: loggedInUser.id, attr3: `get leads`, attr5: 'D' }, (error, results) => { console.log(error) })
            })
            return res.json({
                status: 1,
                message: "Deal details",
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

exports.getDealByOwner = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser || loggedInUser.role !== 1) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const userId = req.params.userId;

        const query = `SELECT deal.*,label.name as label_name, label.colour_code as label_coloure,
        user.first_name AS ownerf_name, user.last_name AS ownerl_name from deal
        LEFT JOIN user ON user.id = deal.owner
        LEFT JOIN label ON label.id = deal.label_id
        WHERE deal.owner = ${userId} AND deal.is_deleted = 0`;

        db.query(query, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            SQL.get('company_settings', ``, `setting_name='audit_deal' AND is_enabled=1`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0)
                    SQL.insert('xx_log', { attr1: `deal:get`, attr2: loggedInUser.id, attr3: `get leads`, attr5: 'D' }, (error, results) => { console.log(error) })
            })
            return res.json({
                status: 1,
                message: "Deal details",
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
        const owner = loggedInUser.id;

        const query = `SELECT deal.*,label.name as label_name, label.colour_code as label_coloure,
        user.first_name AS ownerf_name, user.last_name AS ownerl_name from deal
        LEFT JOIN user ON user.id = deal.owner
        LEFT JOIN label ON label.id = deal.label_id
        WHERE deal.owner = ${owner} AND deal.is_deleted = 0`;

        db.query(query, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: "Deal details",
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

exports.moveDealToTrash = async (req, res) => {

    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const owner = loggedInUser.id
    const { dealIds } = req.body
    if (!dealIds) {
        return res.json({
            status: 0,
            message: "please provide dealId",
        })
    }

    SQL.update(`deal`, { is_deleted: 1 }, `id IN (${dealIds}) AND owner=${owner}`, (error, results) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        SQL.get('company_settings', ``, `setting_name='audit_deal' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `deal:moved to trash`, attr2: loggedInUser.id, attr4: `deal ${dealIds} moved to trash`, attr5: 'D' }, (error, results) => { console.log(error) })
        })
        return res.json({
            status: 1,
            message: "lead moved to trash",
            data: results
        })
    });
}

exports.getAllDealFromTrash = async (req, res) => {

    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.get('deal', ``, `is_deleted = 1 AND (owner = ${owner} OR owner IN (SELECT id FROM user WHERE manager_id = ${owner}))`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        SQL.get('company_settings', ``, `setting_name='audit_deal' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `get:get deal from trash`, attr2: loggedInUser.id, attr3: `get deals from trash`, attr5: 'D' }, (error, results) => { console.log(error) })
        })
        return res.json({
            status: 1,
            message: "deal details",
            data: result
        })
    })
}

exports.restoreDealFromTrash = async (req, res) => {

    const { dealIds } = req.body
    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id
    console.log(dealIds)

    SQL.update(`deal`, { is_deleted: 0 }, `id IN (${dealIds}) AND is_deleted = 1 AND (owner = ${owner} OR owner IN (SELECT id FROM user WHERE manager_id = ${owner}))`, (error, results) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        SQL.get('company_settings', ``, `setting_name='audit_deal' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `deal:restore from trash`, attr2: loggedInUser.id, attr4: `deal ${dealIds} restore from trash`, attr5: 'D' }, (error, results) => { })
        })
        return res.json({
            status: 1,
            message: "lead restored",
            data: results
        })
    });
}

exports.deleteDealFromTrash = async (req, res) => {

    const { dealIds } = req.body
    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    SQL.delete('deal', `id IN (${dealIds}) AND is_deleted = 1 AND (owner = ${owner} OR owner IN (SELECT id FROM user WHERE manager_id = ${owner}))`, (error, result) => {

        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        SQL.get('company_settings', ``, `setting_name='audit_deal' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `deal:deleted from trash`, attr2: loggedInUser.id, attr4: `deal ${dealIds} deleted from trash`, attr5: 'D' }, (error, results) => { })
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

exports.uploadDealDocuments = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const owner = loggedInUser.id
    const { dealId, docId } = req.body;

    console.log(docId, dealId)


    if (!dealId || !docId) {
        return res.json({
            status: 0,
            message: "dealId and docId are required fields",
        })
    }
    const imageName = req.file.filename;
    const imagePath = `./public/leadDealDoc/${imageName}`;


    SQL.get('deal', ``, `id=${dealId}`, (error, results) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (results.length == 0) {
            fs.unlink(imagePath, (error) => { })
            return res.json({
                status: 0,
                message: 'invalid deal id'
            })
        }

        SQL.get('document_master', ``, `id=${docId} AND is_deleted=0`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length == 0) {
                fs.unlink(imagePath, (error) => { })
                return res.json({
                    status: 0,
                    message: 'invalid docId'
                })
            }

            SQL.get('deal_documents', ``, `deal_id=${dealId} AND doc_id=${docId}`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0) {
                    fs.unlink(imagePath, (error) => { })
                    return res.json({
                        status: 0,
                        message: 'this document is already attached'
                    })
                }
                SQL.insert('deal_documents', { deal_id: dealId, doc_id: docId, document_url: imageName }, (error, results) => {
                    if (error) {
                        return res.json({
                            status: 0,
                            message: error
                        })
                    }
                    return res.json({
                        status: 1,
                        message: 'Document uploaded successfully'
                    })
                })
            })
        })
    })
}

exports.getUploadedDocs = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const owner = loggedInUser.id
    const { dealId } = req.params

    SQL.get('deal', ``, `id=${dealId} AND owner = ${owner}`, (error, results) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (results.length == 0) {
            return res.json({
                status: 0,
                message: 'invalid deal_id or ownership'
            })
        }
        let query = `
        select deal_documents.*,document_master.* from deal_documents
        join document_master on deal_documents.doc_id = document_master.id where deal_id=${dealId}`

        db.query(query, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            return res.json({
                status: 1,
                message: 'deal documents.',
                message: results
            })
        })
    })
}

exports.getAllDealStages = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    await SQL.get('deal_stage_master', ``, ``, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        return res.json({
            status: 1,
            message: 'deal stages.',
            message: result
        })
    })
}

exports.updateStagesRequirement = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser || loggedInUser.role != 1) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { deal_stage, required_stages } = req.body

    if (!deal_stage || !required_stages) {
        return res.json({
            status: 0,
            message: "required_stages and stage_id are required fields"
        })
    }

    const requiredStages = required_stages.split(',').map(Number);
    const dealStage = deal_stage;
    const allSmaller = requiredStages.every(stage => stage < dealStage);

    if (!allSmaller) {
        return res.json({
            status: 0,
            message: "required stages must be before by current stage"
        })
    }

    await SQL.update('workflow', { required_stages }, `deal_stage=${deal_stage}`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        return res.json({
            status: 1,
            message: `required stages update ${deal_stage}`,
            message: result
        })
    })

}