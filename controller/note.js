// const db = require("../db");
const { db } = require('../model/db');
const SQL = require('../model/sqlhandler')
const validator = require("validator");

exports.createNote = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { source_id, type, description, status, sort, importance, urgency, viewable, attr2 } = req.body;
        req.body.created_by = loggedInUser.id

        if (!description || !type || !importance || !source_id) {
            return res.json({
                status: 0,
                message: 'source_id, description, type, importance these are required values'
            })
        }

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be add",
            });

        let tblName = type === 'lead' ? 'lead' : 'deal'
        SQL.get(`${tblName}`, ``, `owner=${loggedInUser.id} AND id=${source_id}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error,
                });
            }
            if (results.length == 0) {
                return res.json({
                    status: 0,
                    message: "invalid owner",
                });
            }
            SQL.insert('notes', req.body, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        error: error
                    })
                }
                if (results.affectedRows > 0) {
                    return res.json({
                        status: 1,
                        message: 'note added successfully',
                        data: results
                    })
                }
            });
        })
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong", error,
        })
    }
};

exports.updateNote = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { noteId } = req.params
        const update_data = req.body
        console.log(req.body)

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be edit"
            })
        }

        SQL.get('notes', ``, `id=${noteId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error,
                });
            }
            if (results.length == 0) {
                return res.json({
                    status: 0,
                    message: "please provide valid noteId",
                });
            }

            SQL.update('notes', update_data, `id=${noteId}`, (error, results) => {
                if (error) {
                    return res.json({
                        status: 0,
                        error: error
                    })
                }
                if (results.affectedRows > 0) {
                    return res.json({
                        status: 1,
                        message: 'note details updated successfully',
                        data: results
                    })
                }
            })
        })
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong", error,
        })
    }
}

exports.get = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const noteId = req.params.noteId;
        SQL.get(`notes`, ``, `id=${noteId} AND is_deleted=0`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }

            return res.json({
                status: 1,
                message: "Note details",
                data: results
            })
        });
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong", error,
        })
    }
}

exports.getAllBySource = async (req, res) => {
    try {
        const { source, source_id } = req.params
        console.log("req.params == ", req.params)
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        if (!source_id) {
            return res.json({
                status: 0,
                message: "please provide source_id"
            })
        }

        let tblName = source === 'lead' ? 'lead' : 'deal'
        SQL.get(tblName, ``, `id=${source_id} AND is_deleted=0`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    message: error,
                });
            }
            if (results.length == 0) {
                return res.json({
                    status: 0,
                    message: "please provide valid source_id",
                });
            }

            let query = 'SELECT notes.*, user.first_name as ownerf_name, user.last_name as ownerl_name FROM notes JOIN user ON notes.created_by = user.id WHERE notes.type = ? AND notes.source_id = ? AND notes.is_deleted=0;';
            let values = [source, source_id];

            db.query(query, values, (error, result) => {
                if (error) {
                    return res.json({
                        status: 0,
                        error: error
                    })
                }
                return res.json({
                    status: 1,
                    message: "notes of source",
                    data: result
                })
            });
        })
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong", error,
        })
    }
}

exports.moveNoteToTrash = async (req, res) => {
    try {
        const { notes, source_type } = req.body
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }
        const owner = loggedInUser.id

        if (!notes) {
            return res.json({
                status: 0,
                message: "please provide note id's"
            })
        }

        let tbl = source_type == 'lead' ? 'lead' : 'deal'
        SQL.get(`notes`, ``, `id IN (${notes})`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            let source_id = []
            result.map(result => {
                source_id.push(result.source_id)
            })
            SQL.get(tbl, [`owner`], `id IN (${source_id}) and owner = ${owner}`, (error, result) => {
                if (error) {
                    return res.json({
                        status: 0,
                        error: error
                    })
                }
                if (result.length == 0) {
                    return res.json({
                        status: 0,
                        error: 'invalid owner'
                    })
                }
                SQL.update('notes', { is_deleted: 1 }, `id IN (${notes})`, (error, result) => {
                    if (error) {
                        return res.json({
                            status: 0,
                            error: error
                        })
                    }
                    if (result.affectedRows > 0) {
                        return res.json({
                            status: 1,
                            message: 'note moved to trash',
                            data: result
                        })
                    }
                })
            })
        })

    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong", error,
        })
    }
}

exports.getAllTrashedNotes = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }
        const owner = loggedInUser.id

        SQL.get('notes', ``, `is_deleted=1`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            return res.json({
                status: 1,
                message: 'trashed notes',
                data: result
            })
        })

    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong", error,
        })
    }
}

exports.moveFromTrash = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { noteIds } = req.body
        SQL.update('notes', { is_deleted: 0 }, `id IN (${noteIds}) AND is_deleted=1`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            return res.json({
                status: 1,
                message: 'notes restored',
                data: result
            })
        })
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong", error,
        })
    }
}

exports.deleteFromTrash = async (req, res) => {
    try {
        const loggedInUser = req.decoded
        if (!loggedInUser) {
            return res.json({
                status: 0,
                message: "Not Authorized",
            })
        }

        const { noteIds } = req.body
        SQL.delete('notes', `id IN (${noteIds}) AND is_deleted=1`, (error, result) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            return res.json({
                status: 1,
                message: 'notes deleted permanently',
                data: result
            })
        })
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong", error,
        })
    }
}
