// const db = require("../db");
const SQL = require('../model/sqlhandler')

exports.createDoc = async (req, res) => {
    try {
        let { type, activity_details, activity_owner, source_id, parent_id, url, attr1, attr2, attr3, attr4, attr5 } = req.body;

        if (!type || !activity_details || !activity_owner || !source_id || !parent_id) {
            return res.json({
                status: 0,
                message: ' type, activity_details, activity_owner, source_id, parent_id these are required values'
            })
        }

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be add",
            });

        const imageName = req.file.filename;
        req.body.url = imageName
        if (!imageName) return res.json({ status: 0, message: "please provide image" })


        SQL.insert('activity', req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: 'Document added successfully',
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

exports.updateDoc = async (req, res) => {
    try {
        const { docId } = req.params
        const update_data = req.body


        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be edit"
            })
        }

        const imageName = req.file.filename;
        if (imageName)
            req.body.url = imageName

        SQL.update('activity', update_data, `id=${docId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: 'Document details updated successfully',
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
        const docId = req.params.docId;
        SQL.get(`activity`, ``, `id=${docId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            return res.json({
                status: 1,
                message: "document details",
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
        SQL.get('activity', '', `source_id=${source_id}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            return res.json({
                status: 1,
                message: "Document of source",
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