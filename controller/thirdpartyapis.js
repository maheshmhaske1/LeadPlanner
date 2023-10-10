var express = require('express');
const isBase64 = require('is-base64');
var router = express.Router();
const axios = require('axios')
const SQL = require('../model/sqlhandler');
const { db } = require('../model/db');
require('dotenv').config();


exports.sendEnvolap = async (req, res) => {
    const { DocBase64, bearerToken, recipatant, dealId } = req.body

    if (!isBase64(DocBase64)) {
        return res.json({
            status: 0,
            message: "invalid Base-64"
        })
    }

    if (!bearerToken || !recipatant || !dealId) {
        return res.json({
            status: 0,
            message: "bearerToken, recipatant, dealId are required fields"
        })
    }

    let data = JSON.stringify({
        "documents": [
            {
                "documentBase64": DocBase64,
                "documentId": "3",
                "fileExtension": "pdf",
                "name": "document"
            }
        ],
        "emailSubject": "Simple Signing Example",
        "recipients": {
            "signers": recipatant
        },
        "status": "sent"
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://demo.docusign.net/restapi//v2.1/accounts/45fb400c-8bae-4acb-ae25-a47b51f7038f/envelopes',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`
        },
        data: data
    };

    axios.request(config)
        .then(async (response) => {
            console.log(response.data)

            // const envolap = JSON.stringify(response.data)
            // await SQL.update('deal', { docusign_id: envolap.envelopeId }, `id=${dealId}`)
            // db.query(`update deal set docusign_id = '${response.data.envelopeId}' where id=${dealId}`, (error, result) => {console.log(error) })
            return res.json({
                status: 1,
                message: 'envolape send successfully',
                data: response.data
            })
        })
        .catch((error) => {
            console.log(error);
            return res.json({
                status: 0,
                message: 'something wnet wrong', error,
            })
        });

}


exports.getEnvolapDtails = async (req, res) => {
    const { envelopId, bearerToken } = req.body

    if (!envelopId || !bearerToken) {
        return res.json({
            status: 0,
            message: "bearerToken and envelopIdare requred fields"
        })
    }

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://demo.docusign.net/restapi//v2.1/accounts/45fb400c-8bae-4acb-ae25-a47b51f7038f/envelopes/${envelopId}`,
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    };

    axios.request(config)
        .then((response) => {
            return res.json({
                status: 1,
                message: 'envolap details',
                data: response.data
            })
        })
        .catch((error) => {
            // console.log(error);
            return res.json({
                status: 0,
                message: 'something went wrong', error
            })
        });
}

exports.getRefreshToken = async (req, res) => {
    const axios = require('axios');
    const qs = require('qs');
    let data = qs.stringify({
        'refresh_token': 'eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAgABwAAwVkCj8nbSAgAAEG--iHh20gCADYV3rL58-xDiLmUHeKwuXAVAAEAAAAYAAEAAAAFAAAADQAkAAAANzYwMTk4ZTktYzIzMS00MmNlLWEyODMtYWFmZWZiMzIxZTUzIgAkAAAANzYwMTk4ZTktYzIzMS00MmNlLWEyODMtYWFmZWZiMzIxZTUzMAAACjVUQ7PbSDcAgkiZkDF9NUmIa0Hhp06GBw.W5SicFZeEMi4sAWIOCkdK7JuT1w3s9CwHjP32OCwaGSejN-wlVR19cR-hOLJrRkdzA9vWdTSGIeDfgwCqNSWyE8tLunwRWMCjTk15yqotw_cGcX7bk-oM9mkhchLKdp0iJj2IwFUB9h1CymCPEdDJT16KlX5NtFB1TZOEhGT2oOaRzNFLxlP_Klf-lHsKEP41MwO-5IkU1Oi-0z3NA0GbGVhJ-7b-fOqmhUq4fp3HVPmltlusbfnUSjeuzUZdmHQEUxkY7igTtIbIt3_huPaM3jVU-Gg24o1N0AYNKHCOHkMnKGqLpHuMYr4OmOh5BEtj0pfl4JMNVZqPxtJH0g7nQ',
        'grant_type': 'refresh_token'
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://account-d.docusign.com/oauth/token',
        headers: {
            'Authorization': 'Basic NzYwMTk4ZTktYzIzMS00MmNlLWEyODMtYWFmZWZiMzIxZTUzOmQ5MzMyZDliLTU2MDYtNDlhZi1iYWE1LWVjMjU5YjZlODEyMg==',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            return res.json({
                status: 1,
                message: 'envolap details',
                data: response.data
            })
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });

}


// router.get('/rsa', () => {
//     const request = require('request');
//     const clientId = '22093712';
//     const clientSecret = 'f49e8eeb-341c-4ea7-8319-2a436586b0d8';
//     const refreshToken = 'eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAgABwCAqVt6RbPbSAgAgCnActjK20gCADYV3rL58-xDiLmUHeKwuXAVAAEAAAAYAAEAAAAFAAAADQAkAAAANzYwMTk4ZTktYzIzMS00MmNlLWEyODMtYWFmZWZiMzIxZTUzIgAkAAAANzYwMTk4ZTktYzIzMS00MmNlLWEyODMtYWFmZWZiMzIxZTUzMAAACjVUQ7PbSDcAgkiZkDF9NUmIa0Hhp06GBw.T2DMeTjSD5qpV4_3wnmvJTCBcxdU0dTMaWb7za4AYABX6vkewWQP-x98B3rQO-kEvKjSg4tuA9re9BFGjeIwohn3UEneTxtdeGJS705zw_ALGKy0qhz3c145GQuGmZ7Td3nvNW7xHLAueYoAsP4ku8beKi5aGF82FCuy0oF7J_NdfO9u0e9wAoy2FYURrk11IRvhwjl-N8DoAdOY77XcrqETAX78gQpVhFZsYLUgwGanTOjD5gAhowSTJwk6RggHDq6BWNVE4YL1r7SWMUMSQIjs1p8VRerW05zVJaltcgwAKdZ20Pf0auTZnhX7GSm9U1YY5Z__oo1I_lZZoft-pw';

//     function refreshAccessToken() {
//         const authUrl = 'https://account-d.docusign.com/oauth/token';

//         const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
//         const requestBody = `grant_type=refresh_token&scope=signature&refresh_token=${refreshToken}`;

//         request.post(
//             {
//                 url: authUrl,
//                 headers: {
//                     'Authorization': authHeader,
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                 },
//                 body: requestBody,
//             },
//             (error, response, body) => {
//                 if (error) {
//                     console.error('Error refreshing access token:', error);
//                 } else {
//                     const tokenInfo = JSON.parse(body);
//                     const newAccessToken = tokenInfo.access_token;
//                     console.log('New access token obtained:', newAccessToken);
//                 }
//             }
//         );
//     }
//     refreshAccessToken();

// })






