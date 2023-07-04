const SQL = require('../model/sqlhandler')
const validator = require("validator");

exports.createSite = async (req, res) => {
    try {

        const { site, route, view_page, title, description, sitemap } = req.params
        if (!site || route || !view_page || !title || !description || !sitemap)
            return res.json({
                status: false,
                message: "site, route, view_page, title, description, sitemap are required fields",
            });

        if (req.body.id || req.body.creation_date || req.body.update_date)
            return res.json({
                status: false,
                message: "id ,creation_date ,update_date cannot be add",
            });

        SQL.insert('xx_pages', req.body, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: true,
                    message: 'site added successfully',
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


exports.updateSite = async (req, res) => {
    try {
        const { siteId } = req.params
        const update_data = req.body


        if (update_data.id || update_data.creation_date || update_data.update_date) {
            return res.json({
                status: false,
                message: "id ,creation_date ,update_date cannot be edit"
            })
        }

        SQL.update('xx_pages', update_data, `id=${siteId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            if (results.affectedRows > 0) {
                return res.json({
                    status: true,
                    message: 'site details updated successfully'
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
        const siteId = req.params.siteId;
        SQL.get(`xx_pages`, ``, `id=${siteId}`, (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            return res.json({
                status: true,
                message: "site details",
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

exports.getAll = async (req, res) => {
    try {
        SQL.get('xx_pages', '', '', (error, results) => {
            if (error) {
                return res.json({
                    status: false,
                    error: error
                })
            }
            return res.json({
                status: true,
                message: "site details",
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