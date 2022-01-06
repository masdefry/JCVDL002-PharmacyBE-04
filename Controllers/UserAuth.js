const util = require('util');
const { db } = require('../Database/Connection');
const query = util.promisify(db.query).bind(db);
const bcrypt = require('bcrypt');
const handlebars = require('handlebars');
const fs = require('fs');

const jwtSign = require('../Helpers/JWTSign');
const hashPassword = require('../Helpers/HashPassword');
const bcryptHash = require('../Helpers/bcryptHash');
const transporter = require('../Helpers/nodemailer');

module.exports = {
    registerUser: async (req, res) => {
        const data = req.body;
        console.log(data.email);

        let checkEmailQuery = 'SELECT * FROM user WHERE email = ?';
        let inputDataQuery = 'INSERT INTO user SET ?';
        let inputProfileId = 'INSERT INTO user_profile (fk_profile_User_ID) values (?) ';

        try {
            await query('Start Transaction');

            const checkEmail = await query(checkEmailQuery, [data.email]);

            if (checkEmail.length > 0) throw { status: 406, message: 'Validation Error', detail: 'Email Sudah Terdaftar' };

            let hashedPassword = bcryptHash(data.password);

            let dataToSend = {
                name: data.fullname ? data.fullname : '',
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

            console.log(insertData);

            const insertProfileId = await query(inputProfileId, insertData.insertId)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            let token = jwtSign({ id: insertData.insertId, role: dataToSend.role });

            let registerMail = {
                from: 'Admin (No REPLY) <dimzmailer@gmail.com>',
                to: `${data.email}`,
                subject: `Confirm Email Address`,
                html: `<a href='http://localhost:3000/verif/${token}'>Click here to Verify your account</a>`
            };

            transporter.sendMail(registerMail, (errMail, resultMail) => {
                if (errMail) {
                    console.log(errMail);
                    res.status(500).send({ message: 'Mailing reset token failed', success: false, err: errMail });
                }
            });

            // fs.readFileSync(`C:/Users/Dimz/Documents/Purwadhika/FinalProject/fpBackend/Public/verifyEmail.html`, { encoding: 'utf-8' }, (err, file) => {
            //     if (err) throw err;

            //     const template = handlebars.compile(file);
            //     const emailVerify = template({ link: `http://localhost:3000/verif/${token}` });

            //     let registerMail = {
            //         from: 'Admin (No REPLY) <dimzmailer@gmail.com>',
            //         to: `${dataBody.Email}`,
            //         subject: `Confirm Email Address`,
            //         html: emailVerify
            //     };

            //     transporter.sendMail(registerMail, (errMail, resultMail) => {
            //         if (errMail) {
            //             console.log(errMail);
            //             res.status(500).send({ message: 'Mailing reset token failed', success: false, err: errMail });
            //         }
            //     });
            // });

            await query('Commit');
            console.log('Register Berhasil');
            res.status(200).send({
                error: false,
                message: 'Register Success',
                detail: 'Register Successful, Please Check Your Email',
                data: {
                    name: insertData.name,
                    username: insertData.username,
                    email: insertData.email,
                    password: insertData.password,
                    role: insertData.role,
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
        const dataToken = req.dataToken;

        let verif = `update user set status = 'verified' where id = ?`;

        try {
            await query('Start Transaction');

            let setVerif = await query(verif, dataToken.id)
                .catch((err) => {
                    throw err;
                });

            await query('Commit');
            res.status(200).send({
                error: false,
                message: 'Verification Success',
                detail: 'Email verification successful',
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
        console.log('masuk req forgot password');
        let dataBody = req.body;
        console.log(dataBody.Email);

        let dataReqQuery = 'select * from user where email = ?';

        try {
            await query('Start Transaction');

            const getUserData = await query(dataReqQuery, dataBody.Email)
                .catch((err) => {
                    console.log(err, 'Err Get User Data');
                    throw err;
                });

            let token = jwtSign({ id: getUserData[0].id, role: getUserData[0].Role });

            let resetPassMail = {
                from: 'Admin (No REPLY) <dimzmailer@gmail.com>',
                to: `${dataBody.Email}`,
                subject: `Password Reset`,
                html: `<a href='http://localhost:3000/resetPassword/${token}'>Click here to reset password</a>`
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

            // console.log(`validation: ${validation}`);

            let token = jwtSign({ id: getUserData[0].ID, role: getUserData[0].Role });

            await query('Commit');
            if (validation) {
                console.log(getUserData);
                res.status(200).send({
                    error: false,
                    message: 'Login Succeed',
                    detail: 'Login success',
                    data: {
                        id: getUserData[0].ID,
                        role: getUserData[0].Role,
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
        // console.log(dataToken);

        let dataReqQuery = 'select * from user where id = ?';
        let patchReq = 'update user set Password = ? where email = ?';

        try {
            await query('Start Transaction');

            const getUserData = await query(dataReqQuery, dataToken.id)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            let oldValid = await bcrypt.compare(data.oldPassword, getUserData[0].Password);

            if (!oldValid) {
                console.log('Password tidak valid');
                throw {
                    status: 400,
                    message: 'Old password not valid',
                    detail: 'Insert the valid old password'
                };
            }

            console.log(data.newPassword);
            let hashedPassword = bcryptHash(data.newPassword);

            await query(patchReq, [hashedPassword, getUserData[0].email])
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            console.log('Berhasil Change Password');
            res.status(200).send({
                error: false,
                message: 'Password Reset',
                detail: 'Reset password success'
            });

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

        let updateQuery = 'update user set password = ? where id = ?';

        try {
            await query('Start Trasaction');

            let hashedPassword = bcryptHash(data.password);

            const resetPass = await query(updateQuery, [hashedPassword, dataToken.id])
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            console.log('Berhasil Reset Password');
            res.status(200).send({
                error: false,
                message: 'Password Reset',
                detail: 'Reset password success'
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
                res.status(err.status);
            }
        }
    }
};