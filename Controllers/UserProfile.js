const util = require('util');
const { db } = require('../Database/Connection');
const query = util.promisify(db.query).bind(db);
const bcrypt = require('bcrypt');

const jwtSign = require('../Helpers/JWTSign');
const hashPassword = require('../Helpers/HashPassword');
const bcryptHash = require('../Helpers/bcryptHash');

module.exports = {
    userDetail: async (req, res) => {
        let dataToken = req.dataToken;

        let getDetailQuery = 'select * from user_profile where id = ?';
        let getDataQuery = 'select * from user where id = ?';

        try {
            await query('Start Transaction');

            const getUserData = await query(getDataQuery, dataToken.id)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            const getUserDetail = await query(getDetailQuery, dataToken.id)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            res.status(200).send({
                error: false,
                message: 'Request success',
                detail: 'Get User Detail Sucess',
                data: {
                    name: getUserData[0].Name,
                    username: getUserData[0].UserName,
                    email: getUserData[0].Email,
                    gender: getUserDetail[0].Gender,
                    birthday: getUserDetail[0].Birth_Date,
                    desease: getUserDetail[0].Desease_History,
                    weight: getUserDetail[0].Weight,
                    height: getUserDetail[0].Height,
                    phone: getUserDetail[0].phone,
                    profileImg: getUserDetail[0].Profile_IMG
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
    keepLogin: async (req, res) => {
        let dataToken = req.dataToken;

        let navQuery = 'select * from user_profile where id = ?';

        let navUserQuery = 'select * from user where id = ?';

        try {
            await query('Start Transaction');

            const getUserData = await query(navUserQuery, dataToken.id)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            const getUserDetail = await query(navQuery, dataToken.id)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            res.status(200).send({
                error: false,
                message: 'Request Success',
                detail: 'Get Nav Detail Success',
                data: {
                    username: getUserData[0].Username,
                    name: getUserData[0].Name,
                    role: getUserData[0].Role,
                    profileImg: getUserDetail[0].Profile_IMG,
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