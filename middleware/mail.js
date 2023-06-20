const nodemailer = require('nodemailer')
require('dotenv').config()

const { EMAIL_PASSWORD, EMAIL } = process.env

exports.sendMail = async (to, subject, text) => {
    const isMailSent = false
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL,
            pass: EMAIL_PASSWORD
        }
    });

    var mailOptions = {
        from: EMAIL,
        to: to,
        subject: subject,
        text: text
    };

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            isMailSent == true
        }
    });


}