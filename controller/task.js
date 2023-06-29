// const db = require("../db");
const SQL = require('../model/sqlhandler')
const validator = require("validator");

exports.createTask = async (req, res) => {
    try {
        const { source_id, type, description, created_by, status, sort, importance, urgency, viewable, attr2, attr1 } = req.body;


        if (!source_id || !type || !description || !created_by || !status || !sort) {
            return res.json({
                status: false,
                message: 'source_id, type, description, created_by, status, sort these are required values'
            })
        }

        if (req.body.id || req.body.creation_date || req.body.update_date)
        return res.json({
            status: false,
            message: "id ,creation_date ,update_date cannot be add",
        });

        SQL.insert('task', req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: true,
                    message: 'task added successfully',
                    data: results
                })
            }
        });
    }
    catch (error) {
        return res.json({
            status: false,
            message: "something went wrong",
            error: error
        })
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params
        const update_data = req.body


        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: false,
                message: "id ,creation_date ,update_date cannot be edit"
            })
        }

        SQL.update('task', update_data, `id=${taskId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: true,
                    message: 'task details updated successfully',
                    data: results
                })
            }
        })
    }
    catch (error) {
        return res.json({
            status: false,
            message: "something went wrong",
            error: error
        })
    }
}

exports.get = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        SQL.get(`task`, ``, `id=${taskId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            return res.json({
                status: true,
                message: "lead details",
                data: results
            })
        });
    }
    catch (error) {
        return res.json({
            status: false,
            message: "something went wrong",
            error: error
        })
    }
}

exports.getAllBySource = async (req, res) => {
    const { source_id } = req.params

    if (!source_id) {
        return res.json({
            status: false,
            message: "please provide source_id"
        })
    }
    try {
        SQL.get('task', '', `source_id=${source_id}`, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            return res.json({
                status: true,
                message: "task of source",
                data: results
            })
        });
    }
    catch (error) {
        return res.json({
            status: false,
            message: "something went wrong",
            error: error
        })
    }
}