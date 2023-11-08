const SQL = require('../model/sqlhandler')
const { db } = require('../model/db')

exports.createContact = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { name, org_id, address1, address2, city, country, postcode, email, phone, valuation, valuation_in, domain, industry } = req.body;

        if (!name || !org_id ) {
            return res.status(400).json({
                status: 0,
                message: "name, org_id fields are required."
            });
        }

        SQL.insert('xx_company', req.body, (error, results) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    error: error
                });
            }
            if (results.affectedRows > 0) {
                SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
                    if (error) {
                        return res.json({
                            status: 0,
                            message: error
                        })
                    }
                    if (results.length > 0)
                        SQL.insert('xx_log', { attr1: `contact:added`, attr2: loggedInUser.id, attr4: `contact created with ${JSON.stringify(req.body)} parameter`, attr5: 'D' }, (error, results) => { })
                })
                return res.status(200).json({
                    status: 1,
                    message: 'Company added successfully',
                    data: results
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong", error
        });
    }
}

exports.importContact = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { data } = req.body

    if (!data || data.length == 0) {
        return res.json({
            status: 0,
            message: "no contact data provided or empty data",
        })
    }

    let query = ``

    for (let i = 0; i < data.length; i++) {

        query += `
            INSERT INTO xx_company (name, org_id, address1, address2, city, country, postcode, email, phone, valuation, valuation_in, domain, industry) 
            VALUES (
                '${!data[i].name ? '' : data[i].name}',
                '${!data[i].org_id ? '' : data[i].org_id}',
                '${!data[i].address1 ? '' : data[i].address1}',
                '${!data[i].address2 ? '' : data[i].address2}',
                '${!data[i].city ? '' : data[i].city}',
                '${!data[i].country ? '' : data[i].country}',
                '${!data[i].postcode ? '' : data[i].postcode}',
                '${!data[i].email ? '' : data[i].email}',
                '${!data[i].phone ? '' : data[i].phone}',
                '${!data[i].valuation ? '' : data[i].valuation}',
                '${!data[i].valuation_in ? '' : data[i].valuation_in}',
                '${!data[i].domain ? '' : data[i].domain}',
                '${!data[i].industry ? '' : data[i].industry}');`;
    }

    db.query(query, (error, result) => {
        if (error) {
            return res.status(500).json({
                status: 0,
                message: "invalid companyId"
            });
        }
        SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `contact:imported`, attr2: loggedInUser.id, attr4: `${data.length}||0`, attr5: 'D' }, (error, results) => { })
        })
        return res.json({
            status: 1,
            message: "contact imported successfully.",
            data: result
        });

    })
}

// Update a Company
exports.update = async (req, res) => {
    try {

        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }
        const { companyId } = req.params;
        const update_data = req.body;

        if (Object.keys(update_data).length === 0) {
            return res.status(400).json({
                status: 0,
                message: "No fields to update."
            });
        }

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.status(400).json({
                status: 0,
                message: "id, creation_date, and update_date cannot be edited"
            });
        }

        SQL.get('xx_company', ``, `id=${companyId}`, (error, results) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    error: error
                });
            }
            if (results.length == 0) {
                return res.status(500).json({
                    status: 0,
                    message: "invalid companyId"
                });
            }

            SQL.update('xx_company', update_data, `id=${companyId}`, (error, results) => {
                if (error) {
                    return res.status(500).json({
                        status: 0,
                        error: error
                    });
                }
                if (results.affectedRows > 0) {
                    SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
                        if (error) {
                            return res.json({
                                status: 0,
                                message: error
                            })
                        }
                        if (results.length > 0)
                            SQL.insert('xx_log', { attr1: `contact:updated`, attr2: loggedInUser.id, attr4: `contact updated with ${JSON.stringify(req.body)} parameter`, attr5: 'D' }, (error, results) => { })
                    })
                    return res.status(200).json({
                        status: 1,
                        message: 'Company details updated successfully'
                    });
                }
            });
        })

    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong",
            error: error
        });
    }
}

// Get All Companies
exports.getAllCompanies = async (req, res) => {
    try {
        const loggedInUser = req.decoded
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

        SQL.get('xx_company', '', `is_deleted=0 AND org_id=${org_id}`, (error, results) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    error: error
                });
            }
            SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0)
                    SQL.insert('xx_log', { attr1: `contact:get all`, attr2: loggedInUser.id, attr4: `get records of all company contact`, attr5: 'D' }, (error, results) => { })
            })
            return res.status(200).json({
                status: 1,
                message: "Company details",
                data: results
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong",
            error: error
        });
    }
}

// Delete a Company
exports.delete = async (req, res) => {
    try {
        const { companyId } = req.params;

        SQL.get('xx_company', ``, `id=${companyId}`, (error, results) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    error: error
                });
            }
            if (results.length == 0) {
                return res.status(500).json({
                    status: 0,
                    message: "invalid companyId"
                });
            }

            SQL.delete('xx_company', `id=${companyId}`, (error, results) => {
                if (error) {
                    return res.status(500).json({
                        status: 0,
                        error: error
                    });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({
                        status: 0,
                        message: "Company not found"
                    });
                }
                SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
                    if (error) {
                        return res.json({
                            status: 0,
                            message: error
                        })
                    }
                    if (results.length > 0)
                        SQL.insert('xx_log', { attr1: `contact:deleted`, attr2: loggedInUser.id, attr4: `company deleted id=${companyId}`, attr5: 'D' }, (error, results) => { })
                })
                return res.status(200).json({
                    status: 1,
                    message: "Company deleted successfully"
                });
            });
        })

    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong",
            error: error
        });
    }
}

// ============ PERSON APIS ============ //
exports.createContactPerson = async (req, res) => {
    try {
        const loggedInUser = req.decoded;
        if (!loggedInUser) {
            return res.status(401).json({
                status: 0,
                message: "Not Authorized",
            });
        }

        const { name, org_id, organization, phone, email, city, state, postal_code } = req.body;

        if (!org_id || !name ) {
            return res.status(400).json({
                status: 0,
                message: "name, org_id are Required fields."
            });
        }

        const contactPersonData = {
            org_id,
            name,
            organization,
            phone,
            email,
            city,
            state,
            postal_code
        };

        SQL.insert('xx_contact_person', contactPersonData, (error, results) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    error: error
                });
            }
            if (results.affectedRows > 0) {
                SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
                    if (error) {
                        return res.json({
                            status: 0,
                            message: error
                        })
                    }
                    if (results.length > 0)
                        SQL.insert('xx_log', { attr1: `contact:added`, attr2: loggedInUser.id, attr4: `contact created with ${JSON.stringify(req.body)} parameter`, attr5: 'D' }, (error, results) => { })
                })
                return res.status(201).json({
                    status: 1,
                    message: 'Contact person added successfully',
                    data: results
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong",
            error: error
        });
    }
};

exports.updateContactPerson = async (req, res) => {
    try {
        const loggedInUser = req.decoded;
        if (!loggedInUser) {
            return res.status(401).json({
                status: 0,
                message: "Not Authorized",
            });
        }


        const { contactPersonId } = req.params;
        const update_data = req.body;

        if (Object.keys(update_data).length === 0) {
            return res.status(400).json({
                status: 0,
                message: "No fields to update."
            });
        }

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.status(400).json({
                status: 0,
                message: "id, creation_date, and update_date cannot be edited."
            });
        }

        SQL.get('xx_contact_person', '', `id=${contactPersonId}`, (error, results) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    error: error
                });
            }
            if (results.length === 0) {
                return res.status(404).json({
                    status: 0,
                    message: "Contact person not found."
                });
            }

            SQL.update('xx_contact_person', update_data, `id=${contactPersonId}`, (error, results) => {
                if (error) {
                    return res.status(500).json({
                        status: 0,
                        error: error
                    });
                }
                if (results.affectedRows > 0) {
                    SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
                        if (error) {
                            return res.json({
                                status: 0,
                                message: error
                            })
                        }
                        if (results.length > 0)
                            SQL.insert('xx_log', { attr1: `contact:updated`, attr2: loggedInUser.id, attr4: `contact updated with ${JSON.stringify(req.body)} parameter`, attr5: 'D' }, (error, results) => { })
                    })
                    return res.status(200).json({
                        status: 1,
                        message: 'Contact person details updated successfully'
                    });
                }
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong",
            error: error
        });
    }
};

exports.getContactPersonById = async (req, res) => {
    try {
        const loggedInUser = req.decoded;
        if (!loggedInUser) {
            return res.status(401).json({
                status: 0,
                message: "Not Authorized",
            });
        }

        const { contactPersonId } = req.params;

        SQL.get('xx_contact_person', '', `id=${contactPersonId}`, (error, results) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    error: error
                });
            }
            if (results.length === 0) {
                return res.status(404).json({
                    status: 0,
                    message: "Contact person not found."
                });
            }
            SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0)
                    SQL.insert('xx_log', { attr1: `contact:get`, attr2: loggedInUser.id, attr4: `get contact id = ${contactPersonId}`, attr5: 'D' }, (error, results) => { })
            })
            return res.status(200).json({
                status: 1,
                message: "Contact person details",
                data: results[0]
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong",
            error: error
        });
    }
};

exports.getAllContactPersons = async (req, res) => {
    try {
        const loggedInUser = req.decoded;
        if (!loggedInUser) {
            return res.status(401).json({
                status: 0,
                message: "Not Authorized",
            });
        }

        const { org_id } = req.body
        if (!org_id) {
            return res.json({
                status: 0,
                message: "org_id is required"
            })
        }


        SQL.get('xx_contact_person', '', `is_deleted= 0 AND org_id=${org_id} `, (error, results) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    error: error
                });
            }
            SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        message: error
                    })
                }
                if (results.length > 0)
                    SQL.insert('xx_log', { attr1: `contact:get`, attr2: loggedInUser.id, attr4: `get contacts`, attr5: 'D' }, (error, results) => { })
            })
            return res.status(200).json({
                status: 1,
                message: "Contact person details",
                data: results
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong",
            error: error
        });
    }
};

exports.deleteContactPerson = async (req, res) => {
    try {

        const loggedInUser = req.decoded;
        if (!loggedInUser) {
            return res.status(401).json({
                status: 0,
                message: "Not Authorized",
            });
        }

        const { contactPersonId } = req.params;

        SQL.get('xx_contact_person', '', `id=${contactPersonId}`, (error, results) => {
            if (error) {
                return res.status(500).json({
                    status: 0,
                    error: error
                });
            }
            if (results.length === 0) {
                return res.status(404).json({
                    status: 0,
                    message: "Contact person not found."
                });
            }

            SQL.delete('xx_contact_person', `id=${contactPersonId}`, (error, results) => {
                if (error) {
                    return res.status(500).json({
                        status: 0,
                        error: error
                    });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({
                        status: 0,
                        message: "Contact person not found."
                    });
                }
                return res.status(200).json({
                    status: 1,
                    message: "Contact person deleted successfully"
                });
            });
        });
    } catch (error) {
        return res.status(500).json({
            status: 0,
            message: "Something went wrong",
            error: error
        });
    }
};

exports.importPerson = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }

    const { data } = req.body

    if (!data || data.length == 0) {
        return res.json({
            status: 0,
            message: "no contact data provided or empty data",
        })
    }

    let query = ``

    for (let i = 0; i < data.length; i++) {
        query += `
        INSERT INTO xx_contact_person (name, org_id,organization, phone, email, city, state, postal_code) 
        VALUES (
            '${!data[i].name ? '' : data[i].name}',
             ${data[i].org_id},
            '${!data[i].organization ? '' : data[i].organization}',
            '${!data[i].phone ? '' : data[i].phone}',
            '${!data[i].email ? '' : data[i].email}',
            '${!data[i].city ? '' : data[i].city}',
            '${!data[i].state ? '' : data[i].state}',
            '${!data[i].postal_code ? '' : data[i].postal_code}');`;
    }

    db.query(query, (error, result) => {
        if (error) {
            return res.status(500).json({
                status: 0,
                message: "invalid companyId"
            });
        }
        SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `person:imported`, attr2: loggedInUser.id, attr4: `${data.length}||0`, attr5: 'D' }, (error, results) => { })
        })
        return res.json({
            status: 1,
            message: "person contact imported successfully.",
            data: result
        });

    })


    console.log(query)
}

exports.moveContactToTrash = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    const { contactType, contactIds } = req.body

    if (!contactType || contactIds.length == 0) {
        return res.json({
            status: 0,
            message: "contactType is missing or contactIds length is not greater than 0"
        })
    }

    SQL.update(contactType, { is_deleted: 1 }, `id IN (${contactIds})`, (error, result) => {
        if (error) {
            return res.status(500).json({
                status: 0,
                message: error
            });
        }
        SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `contact:move to trash`, attr2: loggedInUser.id, attr4: `(${contactIds}) these leads removed to trash`, attr5: 'D' }, (error, results) => { })
        })
        return res.status(200).json({
            status: 1,
            message: "Contact moved towards trash",
            data: result
        });
    })
}

exports.removeContactFromTrash = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    const { contactType, contactIds } = req.body

    if (!contactType || contactIds.length == 0) {
        return res.json({
            status: 0,
            message: "contactType is missing or contactIds length is not greater than 0"
        })
    }

    SQL.update(contactType, { is_deleted: 0 }, `id IN (${contactIds})`, (error, result) => {
        if (error) {
            return res.status(500).json({
                status: 0,
                message: error
            });
        }
        SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `contact:move from trash`, attr2: loggedInUser.id, attr4: `(${contactIds}) these leads removed from trash`, attr5: 'D' }, (error, results) => { })
        })
        return res.status(200).json({
            status: 1,
            message: "Contact removed from trash",
            data: result
        });
    })
}

exports.getContactFromTrash = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    const { contactType, org_id } = req.body


    if (!contactType || !org_id) {
        return res.json({
            status: 0,
            message: "contactType or org_id is missing "
        })
    }


    SQL.get(contactType, ``, `is_deleted= 1 AND org_id=${org_id}`, (error, result) => {
        if (error) {
            return res.status(500).json({
                status: 0,
                message: error
            });
        }
        SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `contact:get from trash`, attr2: loggedInUser.id, attr4: `get contact from trash`, attr5: 'D' }, (error, results) => { })
        })
        return res.status(200).json({
            status: 1,
            message: "Contact present in trash",
            data: result
        });
    })
}

exports.deleteContactFromTrash = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    const { contactType, contactIds } = req.body


    if (!contactType) {
        return res.json({
            status: 0,
            message: "contactType is missing "
        })
    }

    SQL.delete(contactType, `id IN (${contactIds}) AND is_deleted= 1`, (error, result) => {
        if (error) {
            return res.status(500).json({
                status: 0,
                message: error
            });
        }
        SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `contact:delete`, attr2: loggedInUser.id, attr4: `deleted contact with ids (${contactIds})`, attr5: 'D' }, (error, results) => { })
        })
        return res.status(200).json({
            status: 1,
            message: "Contact deleted permanently from trash",
            data: result
        });
    })
}

exports.getContactById = async (req, res) => {
    const loggedInUser = req.decoded
    if (!loggedInUser) {
        return res.json({
            status: 0,
            message: "Not Authorized",
        })
    }
    const owner = loggedInUser.id

    const { contactType, contactId } = req.body

    if (!contactType || !contactId) {
        return res.json({
            status: 0,
            message: "contactType or contactId missing "
        })
    }

    SQL.get(contactType, ``, `is_deleted= 0 AND id=${contactId}`, (error, result) => {
        if (error) {
            return res.status(500).json({
                status: 0,
                message: error
            });
        }
        SQL.get('company_settings', ``, `setting_name='audit_contact' AND is_enabled=1`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error
                })
            }
            if (results.length > 0)
                SQL.insert('xx_log', { attr1: `contact:get by id`, attr2: loggedInUser.id, attr4: `get contact of id ${contactId}`, attr5: 'D' }, (error, results) => { })
        })
        return res.status(200).json({
            status: 1,
            message: "Contact present in trash",
            data: result
        });
    })
}

