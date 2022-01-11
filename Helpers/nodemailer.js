const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dimzmailer@gmail.com',
        pass: 'hhtjhuumfmkhbyzh'
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = transporter;