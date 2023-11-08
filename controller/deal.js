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
            org_id, lead_id, deal_name, email, mobile, currency, status, label_id,
            organization, probability, closure_date, priority, contact, value, pipeline_id
        } = req.body;


        if (!org_id || !deal_name ) {
            return res.json({
                status: 0,
                message: 'org_id,deal_name are required values'
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

// exports.updateDeal = async (req, res) => {
//     try {
//         const loggedInUser = req.decoded;
//         if (!loggedInUser) {
//             return res.json({
//                 status: 0,
//                 message: "Not Authorized",
//             });
//         }

//         const owner = loggedInUser.id;
//         const { dealIds } = req.params;
//         const update_data = req.body;

//         console.log(dealIds)

//         if (!dealIds) {
//             return res.json({
//                 status: 0,
//                 message: "please provide dealIds",
//             });
//         }

//         if (update_data.id || update_data.creation_date || update_data.update_date) {
//             return res.json({
//                 status: 0,
//                 message: "id, creation_date, update_date cannot be edited",
//             });
//         }

//         SQL.get(`deal`, ``, `id = ${dealIds} AND owner = ${owner} AND is_deleted=0`, (error, result) => {
//             if (error) {
//                 return res.json({
//                     status: 0,
//                     message: "something went wrong", error,
//                 });
//             }
//             if (result.length === 0) {
//                 return res.json({
//                     status: 0,
//                     message: "Invalid dealId"
//                 });
//             }

//             // ============== condition check start ============== //
//             // const stage_id = result[0].stage_id
//             // if (!update_data.stage_id)
//             //     updateDeal()

//             // // checking if updating stage 
//             // if (update_data.stage_id) {
//             //     SQL.get(`workflow`, ``, `deal_stage = ${stage_id}`, async (error, result) => {
//             //         if (error) {
//             //             return res.json({
//             //                 status: 0,
//             //                 message: "something went wrong", error,
//             //             });
//             //         }
//             //         if (result.length == 0) {
//             //             checkNextStage()
//             //         }
//             //         else {
//             //             let currentStagePassed = true;

//             //             for (const condition of result) {
//             //                 if (condition.validator === 'doc_verification') {
//             //                     const docResult = await new Promise((resolve) => {
//             //                         SQL.get('deal', '', `id=${dealIds} AND document_verified=1`, (error, result) => {
//             //                             console.log('result00000', result);
//             //                             resolve(result);
//             //                         });
//             //                     });
//             //                     if (docResult.length === 0) {
//             //                         currentStagePassed = false;
//             //                         return res.json({
//             //                             status: 0,
//             //                             message: 'documents not verified for this deal'
//             //                         });
//             //                     }
//             //                 }
//             //             }
//             //         }

//             //         checkNextStage()
//             //     })
//             // }

//             // async function checkNextStage() {
//             //     console.log('==')
//             //     let sql = `SELECT * FROM workflow WHERE deal_stage > ${stage_id} AND deal_stage < ${update_data.stage_id}`
//             //     db.query(sql, (error, result) => {
//             //         if (error) {
//             //             return res.json({
//             //                 status: 0,
//             //                 message: "something went wrong", error,
//             //             });
//             //         }
//             //         console.log(result)
//             //         if (result.length > 0) {
//             //             return res.json({
//             //                 status: 0,
//             //                 message: "you cant change this status. please check workflow"
//             //             });
//             //         }
//             //         else updateDeal()
//             //     })
//             // }
//             // ============== condition check end ============== //


//             updateDeal()

//             async function updateDeal() {
//                 SQL.update('deal', update_data, `id = ${dealIds} AND owner = ${owner}`, (error, results) => {
//                     if (error) {
//                         return res.json({
//                             status: 0,
//                             message: "something went wrong", error,
//                         });
//                     }
//                     SQL.get('company_settings', ``, `setting_name='audit_deal' AND is_enabled=1`, (error, results) => {
//                         if (error) {
//                             return res.json({
//                                 status: 0,
//                                 message: error
//                             })
//                         }
//                         if (results.length > 0)
//                             SQL.insert('xx_log', { attr1: `deal:update`, attr2: loggedInUser.id, attr3: `updated ${dealIds} with ${JSON.stringify(update_data)}`, attr5: 'D' }, (error, results) => { console.log(error) })
//                     })
//                     return res.json({
//                         status: 1,
//                         message: 'Deals details updated successfully',
//                         data: results,
//                     });
//                 });
//             }
//         })
//     }
//     catch (error) {
//         console.error("Catch block error:", error);
//         return res.json({
//             status: 0,
//             message: "Something went wrong",
//             error: error.message,
//         });
//     }
// };

exports.updateDeal = async (req, res) => {
    try {
        const loggedInUser = req.decoded;
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            });
        }

        const owner = loggedInUser.id;
        const { dealId } = req.body;
        const update_data = req.body;


        if (!dealId) {
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

        const dealIds = dealId
        delete update_data.dealId

        SQL.get(`deal`, ``, `id IN (${dealIds}) AND is_deleted=0`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: "something went wrong", error,
                });
            }
            if (result.length === 0) {
                return res.json({
                    status: 0,
                    message: "Invalid dealId"
                });
            }

            updateDeal()

            async function updateDeal() {
                SQL.update('deal', update_data, `id IN (${dealIds}) AND is_deleted=0`, (error, results) => {
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
        })
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
        console.log(req.params.dealId)
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }
        const dealId = req.params.dealId;


        const query = `SELECT deal.*,label.name as label_name, label.colour_code as label_coloure,
            user.first_name AS ownerf_name, user.last_name AS ownerl_name from deal
            LEFT JOIN user ON user.id = deal.owner
            LEFT JOIN label ON label.id = deal.label_id
            WHERE deal.id=${dealId} AND deal.is_deleted = 0`;

        console.log("query ==>", query)
        db.query(query, (error, result) => {
            console.error(error)
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            SQL.get('company_settings', ``, `setting_name='audit_lead' AND is_enabled=1`, (error, results) => {
                console.error(error)
                console.error(error)
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0)
                    SQL.insert('xx_log', { attr1: `deal:get`, attr2: loggedInUser.id, attr3: `get leads`, attr5: 'D' }, (error, results) => { console.error(error) })
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
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const userId = req.params.userId;

        const query = `SELECT deal.*,label.name AS label_name,label.colour_code AS label_coloure,user.first_name AS ownerf_name,
        user.last_name AS ownerl_name,stage_master.display_name AS stage_name,stage_master.stage_name AS status
        FROM deal
        LEFT JOIN user ON user.id = deal.owner
        LEFT JOIN label ON label.id = deal.label_id
        LEFT JOIN stage_master ON deal.stage_id = stage_master.id
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

        const query = `SELECT deal.*,label.name AS label_name,label.colour_code AS label_coloure,user.first_name AS ownerf_name,
        user.last_name AS ownerl_name,stage_master.display_name AS stage_name,stage_master.stage_name AS status
        FROM deal
        LEFT JOIN user ON user.id = deal.owner
        LEFT JOIN label ON label.id = deal.label_id
        LEFT JOIN stage_master ON deal.stage_id = stage_master.id 
        where deal.owner = ${owner} AND deal.is_deleted = 0`;

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

    SQL.get('deal', ``, `is_deleted = 1 AND (owner = ${owner} OR owner IN (SELECT id FROM user WHERE manager_id = ${owner})) AND org_id=${org_id}`, (error, result) => {
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
    if (!loggedInUser) {
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
    if (!loggedInUser) {
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
    const { source_id, source_type, docId } = req.body;



    if (!source_id || !source_type || !docId) {
        return res.json({
            status: 0,
            message: " source_id,source_type and docId are required fields",
        })
    }
    const imageName = req.file.filename;
    const imagePath = `./public/leadDealDoc/${imageName}`;



    SQL.get(source_type, ``, `id=${source_id}`, (error, results) => {
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
                message: 'invalid source id and type'
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

            SQL.get('deal_documents', ``, `source_id=${source_id} AND source_type='${source_type}' AND doc_id=${docId}`, (error, results) => {
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
                SQL.insert(
                    'deal_documents',
                    { source_id: source_id, source_type: source_type, doc_id: docId, document_url: imageName },
                    (error, results) => {
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
    const { source_id, source_type } = req.params

    SQL.get(source_type, ``, `id=${source_id}`, (error, results) => {
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
        // let query = `select deal_documents.*,document_master.* from deal_documents LEFT join document_master on deal_documents.doc_id = document_master.id where source_id=${source_id} AND source_type='${source_type}'`
        let query = `
        SELECT deal_documents.*, document_master.*
FROM deal_documents
LEFT JOIN document_master ON deal_documents.doc_id = document_master.id
WHERE deal_documents.source_id = ${source_id} AND deal_documents.source_type = '${source_type}';
`

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

exports.getAllStagesDealLead = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { type } = req.params
    const { org_id } = req.body

    if (!req.body) {
        return res.json({
            status: 0,
            message: "org_id is required"
        })
    }

    await SQL.get('stage_master', ``, `stage_type='${type}' and org_id=${org_id}`, (error, result) => {
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
``
exports.updateStage = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { stage_id } = req.params
    const update_data = req.body

    if (update_data.creation_date || update_data.update_date || update_data.id) {
        return res.json({
            status: 0,
            message: "creation_date,update_date and id cant be edited",
        })
    }

    SQL.update('stage_master', update_data, `id=${stage_id}`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        return res.json({
            status: 1,
            message: 'stage master updated successfully'
        })
    })
}

exports.addStagesForDealLead = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { display_name, stage_type, stage_name, position, org_id } = req.body

    if (!display_name || !stage_type || !stage_name || !org_id) {
        return res.json({
            status: 0,
            message: 'display_name,stage_type,stage_name,org_id are required fields'
        })
    }

    await SQL.insert('stage_master', req.body, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        return res.json({
            status: 1,
            message: 'stage added.',
            message: result
        })
    })
}

exports.removeDealLeadStage = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { stage_id } = req.params



    await SQL.get('lead', ``, `stage_id = ${stage_id}`, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: error
            })
        }
        if (result.length > 0) {
            return res.json({
                status: 0,
                message: "cant delete this stage because already assigned to lead"
            })
        }
        SQL.get('deal', ``, `stage_id = ${stage_id}`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (result.length > 0) {
                return res.json({
                    status: 0,
                    message: "cant delete this stage because already assigned to deal"
                })
            }
            SQL.delete('stage_master', `id=${stage_id}`, (error, result) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                return res.json({
                    status: 1,
                    message: 'stage deleted successfully.'
                })
            })
        })
    })
}

exports.updateStagesRequirement = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
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

exports.importDeal = async (req, res) => {

    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    let data = req.body.data
    const owner = loggedInUser.id

    const requiredFields = [
        "org_id",
        "stage_id",
        "deal_name",
        "email",
        "mobile",
        "probability",
        "value",
        "closure_date",
        "currency",
        "organization",
        "value",
        "contact",
        "mobile",
        "security_value",
        "loan_amount",
        "deposit"
    ];

    const missingFields = [];

    if (!Array.isArray(req.body.data)) {
        return res.status(400).json({
            status: 0,
            message: 'The "data" field must be an array.'
        });
    }

    req.body.data.forEach((item, index) => {
        const missingInItem = requiredFields.filter(field => !(field in item));
        if (missingInItem.length > 0) {
            missingFields.push({
                row_number: index + 1,
                missing_fields: missingInItem,
            });
        }
    });

    if (missingFields.length > 0) {
        return res.status(400).json({
            status: 0,
            message: `${missingFields.map(item => `Row ${item.row_number}: ${item.missing_fields.join(", ")}`).join(". ")} are required values.`
        });
    }

    const result = data
    let query = ``

    for (let i = 0; i < data.length; i++) {
        query += `
            INSERT INTO deal (org_id,lead_id, owner,stage_id, deal_name, currency, organization, probability, closure_date, value, email, contact, pipeline_id, mobile, introducer_name, introducer_firm_name, data_enquiry_receive, borrower_entry, security_value, loan_amount, deposit, type_of_security, loan_type, lender, lead_source, engagement_fee, engagement_fee_paid, broker_fee, broker_fee_paid, procuration_fee, procuration_fee_paid, deal_commission, completion_date) 
            VALUES (
                 ${data[i].org_id},
                '${!data[i].lead_id ? null : data[i].lead_id}',
                 ${owner},
                 ${data[i].stage_id},
                '${!data[i].deal_name ? '' : data[i].deal_name}',
                '${!data[i].currency ? '' : data[i].currency}',
                '${!data[i].organization ? '' : data[i].organization}',
                '${!data[i].probability ? '' : data[i].probability}',
                '${!data[i].closure_date ? '' : data[i].closure_date}',
                '${!data[i].value ? '' : data[i].value}',
                '${!data[i].email ? '' : data[i].email}',
                '${!data[i].contact ? '' : data[i].contact}',
                '${!data[i].pipeline_id ? '' : data[i].pipeline_id}',
                '${!data[i].mobile ? '' : data[i].mobile}',
                '${!data[i].introducer_name ? '' : data[i].introducer_name}',
                '${!data[i].introducer_firm_name ? '' : data[i].introducer_firm_name}',
                '${!data[i].data_enquiry_receive ? '' : data[i].data_enquiry_receive}',
                '${!data[i].borrower_entry ? '' : data[i].borrower_entry}',
                '${!data[i].security_value ? '' : data[i].security_value}',
                '${!data[i].loan_amount ? '' : data[i].loan_amount}',
                '${!data[i].deposit ? '' : data[i].deposit}',
                '${!data[i].type_of_security ? '' : data[i].type_of_security}',
                '${!data[i].loan_type ? '' : data[i].loan_type}',
                '${!data[i].lender ? '' : data[i].lender}',
                '${!data[i].lead_source ? '' : data[i].lead_source}',
                '${!data[i].engagement_fee ? '' : data[i].engagement_fee}',
                '${!data[i].engagement_fee_paid ? '' : data[i].engagement_fee_paid}',
                '${!data[i].broker_fee ? '' : data[i].broker_fee}',
                '${!data[i].broker_fee_paid ? '' : data[i].broker_fee_paid}',
                '${!data[i].procuration_fee ? '' : data[i].procuration_fee}',
                '${!data[i].procuration_fee_paid ? '' : data[i].procuration_fee_paid}',
                '${!data[i].deal_commission ? '' : data[i].deal_commission}',
                '${!data[i].completion_date ? '' : data[i].completion_date}');`;
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
            SQL.get('company_settings', ``, `setting_name='audit_deal' AND is_enabled=1`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0)
                    SQL.insert('xx_log', { attr1: `deal:imported`, attr2: loggedInUser.id, attr4: `${data.length}||0`, attr5: 'D' }, (error, results) => { })

            })
        }
        return res.json({
            status: 1,
            message: "deal imported successfully"
        })
    })

}

