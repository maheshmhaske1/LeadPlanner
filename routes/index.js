var express = require('express');
var router = express.Router();
const axios = require('axios');




/* GET home page. */
router.get('/', async (req, res, next) => {
    // const mailchimp = require("mailchimp_transactional")(
    //     "md-whsfUlZpNNDIwZGJHkEpBA"
    // );

    const mailchimpClient = require('@mailchimp/mailchimp_transactional')('md-whsfUlZpNNDIwZGJHkEpBA');

    // const mailchimpClient = require("@mailchimp/mailchimp_transactional")(
    //     "YOUR_API_KEY"
    //   );

    // const run = async () => {
    //     const response = await mailchimpClient.messages.send({
    //         message: {
    //             from_email: "care@bookmyplayer.com",
    //             subject: "Hello world",
    //             text: "Welcome to Mailchimp Transactional!",
    //             to: [
    //                 {
    //                     email: "maheshmhaske241198@gmail.com",
    //                     type: "to"
    //                 }
    //             ]
    //         }
    //     });
    //     console.log(response);
    // };

    const run = async () => {
        const response = await mailchimpClient.messages.sendTemplate({
            template_name: "test",
            template_content: [{}],
            message: {
                from_email: "care@bookmyplayer.com",
                subject: "Hello world",
                text: "Welcome to Mailchimp Transactional!",
                to: [
                    {
                        email: "care@bookmyplayer.com",
                        type: "to"
                    }
                ]
            }
        });
        console.log(response);
    };

    run();

    // const message = {
    //     from_email: "care@bookmyplayer.com",
    //     subject: "Hello world",
    //     text: "Welcome to Mailchimp Transactional!",
    //     to: [
    //         {
    //             email: "care@bookmyplayer.com",
    //             type: "to"
    //         }
    //     ]
    // };

    // async function run() {
    //     const response = await mailchimp.messages.send({
    //         message
    //     });
    //     console.log(response);
    // }
    // run();
});

module.exports = router;
