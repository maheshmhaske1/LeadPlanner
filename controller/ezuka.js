const { dbB } = require('../model/db');

exports.createContact = async (req, res) => {
    const { name, email, phone, description } = req.body

    const missingFields = ['name', 'email', 'phone', 'description'].filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.json({
            status: false,
            message: `Missing required fields: ${missingFields.join(', ')}`
        });
    }

    let query = `
    INSERT INTO ezuka_leads (name, email, phone, description)
    VALUES ('${name}', '${email}', '${phone}', '${description}')
`;

    dbB.query(query, (error, result) => {
        if (error) {
            return res.json({
                status: 0,
                message: "something went wrong.",
                data: error
            })
        }
        return res.json({
            status: 1,
            message: "your request sent successfully.",
            data: result
        })
    })
}