const { default: axios } = require('axios');
const { dbB } = require('../model/db');
const requestIp = require('request-ip');
const useragent = require('useragent');


exports.createContact = async (req, res) => {
    const { name, email, phone, description } = req.body

    const missingFields = ['name', 'email', 'phone', 'description'].filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.json({
            status: false,
            message: `Missing required fields: ${missingFields.join(', ')}`
        });
    }

    const ipInfo = await axios.get('https://api.ipify.org/')
    const ip = ipInfo.data ? ipInfo.data : "0.0.0.0"
    const userAgentString = req.headers['user-agent'];
    const agent = useragent.parse(userAgentString);
    const user_agent = userAgentString;
    const browser = agent.family
    const os = agent.os.family


    let query = `
    INSERT INTO ezuka_leads (name, email, phone, description, user_agent, browser, os, ip)
    VALUES ('${name}', '${email}', '${phone}', '${description}', '${user_agent}, '${browser}', '${os}', '${ip}')
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