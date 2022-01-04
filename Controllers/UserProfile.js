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
        // console.log('user detail token' + JSON.stringify(dataToken));

        let getDetailQuery = 'select * from user_profile where fk_profile_User_ID = ?';
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

            // console.log(getUserData);
            // console.log(getUserDetail);

            await query('Commit');
            console.log('berhasil profile detail');
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
                    phone: getUserDetail[0].Phone,
                    profileImg: getUserDetail[0].Profile_IMG,
                    role: getUserData[0].Role
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

        // console.log('ini data token' + JSON.stringify(dataToken));

        let navQuery = 'select * from user_profile where fk_profile_User_ID = ?';

        let navUserQuery = 'select * from user where ID = ?';
        // console.log(dataToken.id);

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

            // console.table(getUserData);
            await query('Commit');
            console.log('Berhasil Keep Login');
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
    },


    profileUpdate: async (req, res) => {
        let dataToken = req.dataToken;
        let data = req.body;
        // console.log('profile update ' + dataToken);

        let insertQuery = 'UPDATE user_profile SET ? WHERE fk_profile_User_ID = ?';
        let getDataQuery = 'SELECT * FROM user_profile where fk_profile_User_ID = ?';
        let setNameQuery = 'UPDATE user SET `Name` = ? WHERE (`ID` = ?)';

        try {
            await query('Start Transaction');

            const getUserData = await query(getDataQuery, dataToken.id);

            let dataToSend = {
                Gender: data.gender ? data.gender : getUserData[0].Gender,
                Birth_Date: data.birthDate ? data.birthDate : getUserData[0].Birth_Date,
                Weight: data.weight ? data.weight : getUserData[0].Weight,
                Height: data.height ? data.height : getUserData[0].Height,
                Phone: data.phone ? data.phone : getUserData[0].Phone,
            };

            if (data.name) {
                await query(setNameQuery, [data.name, dataToken.id])
                    .catch((err) => {
                        console.log(err);
                        throw err;
                    });
            }

            const updateUserData = await query(insertQuery, [dataToSend, dataToken.id])
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            res.status(200).send({
                error: false,
                message: 'Profile Updated',
                detail: 'Update Profile Success'
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

    AddAddress: async (req, res) => {
        console.log('masuk addaddress');
        let dataToken = req.dataToken;
        let data = req.body;
        console.log(data);

        let addAddressQuery = 'INSERT INTO addresses SET ?';
        try {
            await query('Start Transaction');

            let dataToSend = {
                Fk_Address_User_ID: data.Fk_Address_User_ID,
                Full_Address: data.Full_Address,
                Recipient_Name: data.Recipient_Name,
                Recipient_Phone: data.Recipient_Phone,
                Zip_Code: data.Zip_Code,
                Address_Label: data.Address_Label,
                City: data.City,
            };

            let AddressData = await query(addAddressQuery, dataToSend)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            res.status(200).send({
                error: false,
                message: 'Address Added',
                detail: 'Add Address Success'
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