const SQL = require('../model/sqlhandler')

exports.createPipeline = async (req, res) => {
    try {

        const { name, description } = req.body
        if (!name || !description)
            return res.json({
                status: 0,
                message: "name and description are required fields",
            });

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be add",
            });

        SQL.insert('pipeline', req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: 'pipeline added successfully',
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

exports.updatePipeline = async (req, res) => {
    try {
        const { pipelineId } = req.params
        const update_data = req.body


        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be edit"
            })
        }

        SQL.get('pipeline', '', `id=${pipelineId}`, (error, result) => {
            if (error || result.length == 0) {
                return res.json({
                    status: 0,
                    message: 'please enter valid pipeline id'
                })
            }
        })

        SQL.update('product', update_data, `id=${pipelineId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: 'pipeline details updated successfully'
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
        const pipelineId = req.params.pipelineId;
        SQL.get(`pipeline`, ``, `id=${pipelineId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            return res.json({
                status: 1,
                message: "pipeline detail",
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
        SQL.get('pipeline', '', '', (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            return res.json({
                status: 1,
                message: "pipeline details",
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