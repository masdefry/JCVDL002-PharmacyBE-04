const util = require('util');
const { db } = require('../Database/Connection');
const query = util.promisify(db.query).bind(db);
const bcrypt = require('bcrypt');

const jwtSign = require('../Helpers/JWTSign');
const hashPassword = require('../Helpers/HashPassword');
const bcryptHash = require('../Helpers/bcryptHash');
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

            let hashedPassword = bcryptHash(data.password);

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
                    role: getUserData[0].role,
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
    },
    login: async (req, res) => {
        let data = req.body;

        let getQuery = "SELECT * from user WHERE email = ?";

        try {
            await query('Start Transaction');

            let getUserData = await query(getQuery, data.email)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            let validation = await bcrypt.compare(data.password, getUserData[0].Password)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            console.log(`validation: ${validation}`);

            let token = jwtSign({ id: getUserData[0].id, role: getUserData[0].role });

            await query('Commit');
            if (validation) {
                console.log(getUserData);
                res.status(200).send({
                    error: false,
                    message: 'Login Succeed',
                    detail: 'Login success',
                    data: {
                        id: getUserData[0].ID,
                        token: token
                    }
                });
            } else {
                res.status(400).send({
                    error: false,
                    message: 'Password invalid',
                    detail: 'Password did not match!'
                });
            }
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
        let data = req.body;
        let dataToken = req.dataToken;
        console.log(dataToken);

        let dataReqQuery = 'select from user where email = ?';
        let patchReq = 'update user set password = ? where email = ?';

        try {
            await query('Start Transaction');

            const getUserData = await query(dataReqQuery, data.email)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            let oldValid = await bcrypt.compare(data.oldPassword, getUserData[0].Password);

            if (!oldValid) {
                throw {
                    status: 400,
                    message: 'Old password not valid',
                    detail: 'Insert the valid old password'
                };
            }

            let hashedPassword = bcryptHash(data.newPassword);

            const resetPassword = await query(patchReq, [hashedPassword, getUserData[0].email])
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            if (resetPassword) {
                res.status(200).send({
                    error: false,
                    message: 'Password Reset',
                    detail: 'Reset password success'
                });
            }

        } catch (err) {
            await query('Rollback');
            if (res.status) {
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
    resetPassword: async (req, res) => {
        let data = req.body;
        let dataToken = req.dataToken;

        let getQuery = 'select * from user where email = ?';
        let updateQuery = 'update user set password = ? where email = ?';

        try {
            await query('Start Trasaction');

            // const getUserData = await query(getQuery, data.email)
            //     .catch((err) => {
            //         console.log(err);
            //         throw err;
            //     });

            let hashedPassword = bcryptHash(data.password);
            const resetPass = await query(updateQuery, [hashedPassword, data.email]);

        } catch (err) {
            await query('Rollback');
            if (err.status) {
                res.status(err.status).send({
                    error: true,
                    message: err.message,
                    detail: err.detail
                });
            } else {
                res.status(err.status);
            }
        }
    }
};