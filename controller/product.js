const SQL = require('../model/sqlhandler')

exports.createProduct = async (req, res) => {
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

        SQL.insert('product', req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: 'product added successfully',
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

exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params
        const update_data = req.body

        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: 0,
                message: "id ,creation_date ,update_date cannot be edit"
            })
        }

        SQL.get('product', '', `id=${productId}`, (error, result) => {
            if (error || result.length == 0) {
                return res.json({
                    status: 0,
                    message: 'please enter valid product id'
                })
            }
        })

        SQL.update('product', update_data, `id=${productId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: 1,
                    message: 'product details updated successfully'
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
        const { productId } = req.body;
        SQL.get(`product`, ``, `id=${productId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            return res.json({
                status: 1,
                message: "product details",
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
        SQL.get('product', '', '', (error, results) => {
            if (error) {
                return res.json({
                    status: 0,
                    error: error
                })
            }
            return res.json({
                status: 1,
                message: "product details",
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