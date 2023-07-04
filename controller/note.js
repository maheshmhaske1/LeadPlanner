// const db = require("../db");
const SQL = require('../model/sqlhandler')
const validator = require("validator");

exports.createNote = async (req, res) => {
    try {
        const { source_id, type, description, created_by, status, sort, importance, urgency, viewable, attr2, attr1 } = req.body;


        if (!source_id || !type || !description || !created_by || !status || !sort) {
            return res.json({
                status: 0,
                message: 'source_id, type, description, created_by, status, sort these are required values'
            })
        }

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be add",
            });

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
    }
    catch (error) {
        return res.json({
            status: 0,
            message: "something went wrong",
            error: error
        })
    }
};

exports.updateNote = async (req, res) => {
    try {
        const { noteId } = req.params
        const update_data = req.body


        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be edit"
            })
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
        const noteId = req.params.noteId;
        SQL.get(`notes`, ``, `id=${noteId}`, (error, results) => {
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

exports.getAllBySource = async (req, res) => {
    const { source_id } = req.params

    if (!source_id) {
        return res.json({
            status: 0,
            message: "please provide source_id"
        })
    }
    try {
        SQL.get('notes', '', `source_id=${source_id}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            return res.json({
                status: 1,
                message: "notes of source",
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