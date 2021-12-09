const util = require('util');
const { db } = require('../Database/Connection');
const query = util.promisify(db.query).bind(db);

const jwtSign = require('../Helpers/JWTSign');
const hashPassword = require('../Helpers/HashPassword');
const transporter = require('../Helpers/nodemailer');

module.exports = {
    registerUser: async (req, res) => {
        const data = req.body;

        let checkEmailQuery = 'SELECT * FROM user WHERE email = ?';
        let inputDataQuery = 'INSERT INTO user SET ?';
        let dataForJWTQuery = 'SELECT * FROM user WHERE id = ?';

        try {
            await query('Start Transaction');

            const checkEmail = await query(checkEmailQuery, [data.email]);

            if (checkEmail.length > 0) throw { status: 406, message: 'Validation Error', detail: 'Email Sudah Terdaftar' };

            let hashedPassword = hashPassword(data.password);

            let dataToSend = {
                name: data.name ? data.name : '',
                username: data.username ? data.username : '',
                email: data.email ? data.email : '',
                password: hashedPassword ? hashedPassword : '',
                status: 'unverified',
            };

            const insertData = await query(inputDataQuery, dataToSend)
                .catch((err) => {
                    console.log('errInsertQuery');
                    throw err;
                });

            const getUserData = await query(dataForJWTQuery, insertData.insertId)
                .catch((err) => {
                    console.log("errGetUserData");
                    throw err;
                });

            let token = jwtSign({ id: getUserData[0].id, status: getUserData[0].status });

            let verifMail = {
                from: `Admin <dimzmailer@gmail.com>`,
                to: `${data.email}`,
                subject: `Account Verification`,
                html: `<a href='http://localhost:3000/auth/${token}'>Click here to verify your email address</a>`
            };

            transporter.sendMail(verifMail, (errMail, resMail) => {
                if (errMail) {
                    console.log(errMail);
                    res.status(500).send({ message: 'Registration Failed', success: false, err: errMail });
                }
            });

            await query('Commit');
            res.status(200).send({
                error: false,
                message: 'Register Success',
                detail: 'Register Successful, Please Check Your Email',
                data: {
                    name: getUserData[0].name,
                    username: getUserData[0].username,
                    email: getUserData[0].email,
                    password: getUserData[0].password,
                    token: token
                }
            });
        } catch (err) {
            await query('Rollback');
            if (err.status) {
                res.status(err.status).send({
                    error: true,
                    message: err.message,
                    detail: err.detail
                });
            } else {
                res.status(500).send({
                    error: true,
                    message: err.message
                });
            }
        }
    },
    verification: async (req, res) => {
        const data = req.body;

        let verif = `update user set status = 'varified' where name = ?`;

        try {
            await query('Start Transaction');

            let setVerif = await query(verif, data.name)
                .catch((err) => {
                    throw err;
                });

            await query('Commit');
            res.status(200).send({
                error: false,
                message: 'Verification Success',
                detail: 'Email varification successful',
                data: setVerif
            });

        } catch (err) {
            await query('Rollback');
            if (err.status) {
                res.status(err.status).send({
                    error: true,
                    message: err.message,
                    detail: err.detail
                });
            } else {
                res.status(500).send({
                    error: true,
                    message: err.message
                });
            }
        }
    },
};