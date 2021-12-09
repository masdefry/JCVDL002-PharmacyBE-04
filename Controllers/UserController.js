const util = require('util');
const { db } = require('../Database/Connection');
const query = util.promisify(db.query).bind(db);

const jwtSign = require('../Helpers/JWTSign');
const hashPassword = require('../Helpers/HashPassword');
const transporter = require('../Helpers/nodemailer');
const { send } = require('process');

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
                role: 'user'
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


            let token = jwtSign({ id: getUserData[0].id, role: getUserData[0].role });

            let verifMail = {
                from: `Admin <dimzmailer@gmail.com>`,
                to: `${data.email}`,
                subject: `Account Verification`,
                html: `<a href='http://localhost:3000/auth/${token}'>Click here to verify your email address</a>`
            };

            transporter.sendMail(verifMail, (errMail, resultMail) => {
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
    changePassword: async (req, res) => {
        const dataBody = req.body;
        const dataToken = req.dataToken;

        let userQuery = 'select * from user where id = ?';
        let updateQuery = 'update user set password = ? where id = ?';

        try {
            await query('Start Transaction');

            const getUserData = await query(userQuery, dataToken.id)
                .catch((err) => {
                    console.log(err, 'Err Get User Data');
                    throw err;
                });

            const updatePassword = await query(updateQuery, [dataBody.newPassword, getUserData[0].id])
                .catch((err) => {
                    console.log(err, 'Err Update Password');
                    throw err;
                });

            let token = jwtSign({ id: getUserData[0].id, role: getUserData[0].role });
            console.log(`New password: ${JSON.stringify(updatePassword[0])}`);

            await query('Commit');
            res.status(200).send({
                error: false,
                message: 'Password Update Successful',
                detail: 'Password Updated'
            });
        } catch (err) {
            await query('Rollback');
            if (err.status) {
                res.status(err.status).send({
                    error: true,
                    message: err.message,
                    detail: err.detail,
                    data: {
                        name: getUserData[0].name,
                        username: getUserData[0].username,
                        email: getUserData[0].email,
                        password: getUserData[0].password,
                        token: token
                    }
                });
            } else {
                res.status(500).send({
                    error: true,
                    message: err.message
                });
            }

        }
    },
    ForgotPasswordReq: async (req, res) => {
        let dataBody = req.body;
        let dataToken = req.dataToken;

        let dataReqQuery = 'select * from user where id = ?';

        try {
            await query('Start Transaction');

            const getUserData = await query(dataReqQuery, dataToken.id)
                .catch((err) => {
                    console.log(err, 'Err Get User Data');
                    throw err;
                });

            let token = jwtSign({ id: getUserData[0].id, role: getUserData[0].role });

            let resetPassMail = {
                from: 'Admin (No REPLY) <dimzmailer@gmail.com>',
                to: `${dataBody.email}`,
                subject: `Password Reset`,
                hmtl: `<a href='http://localhost:3000/auth/${token}'>Click here to reset password</a>`
            };

            transporter.sendMail(resetPassMail, (errMail, resultMail) => {
                if (errMail) {
                    console.log(errMail);
                    res.status(500).send({ message: 'Mailing reset token failed', success: false, err: errMail });
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
    }
};