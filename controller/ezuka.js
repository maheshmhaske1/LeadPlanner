const { dbB } = require('../model/db');
const requestIp = require('request-ip');
const useragent = require('useragent');


exports.createContact = async (req, res) => {
    const { name, email, phone, description } = req.body

    const missingFields = ['name', 'email', 'phone', 'description'].filter(field => !req.body[field]);

    // if (missingFields.length > 0) {
    //     return res.json({
    //         status: false,
    //         message: `Missing required fields: ${missingFields.join(', ')}`
    //     });
    // }

    let query = `
    INSERT INTO ezuka_leads (name, email, phone, description)
    VALUES ('${name}', '${email}', '${phone}', '${description}')
`;

const ipAddress = req.clientIp;
    const userAgentString = req.headers['user-agent'];
    const agent = useragent.parse(userAgentString);

    const message = req.body.message;

    // Additional data to be sent to the server
    const data = {
        name: name,
        email: email,
        phone: phone,
        message: message,
        ipAddress: ipAddress,
        browserDetails: {
            userAgent: userAgentString,
            browser: agent.family,
            os: agent.os.family,
            platform: agent.os.platform,
        },
    };

    return res.json({data})
    console.log(data)

    // dbB.query(query, (error, result) => {
    //     if (error) {
    //         return res.json({
    //             status: 0,
    //             message: "something went wrong.",
    //             data: error
    //         })
    //     }
    //     return res.json({
    //         status: 1,
    //         message: "your request sent successfully.",
    //         data: result
    //     })
    // })
}