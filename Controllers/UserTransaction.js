const util = require('util');
const { db } = require('../Database/Connection');
const query = util.promisify(db.query).bind(db);
const bcrypt = require('bcrypt');

const cardGen = require('card-number-generator');
const jwtSign = require('../Helpers/JWTSign');
const hashPassword = require('../Helpers/HashPassword');
const bcryptHash = require('../Helpers/bcryptHash');

module.exports = {
    paymentDetail: async (req, res) => {
        console.log('Masuk Payment Detail');
        let dataToken = req.dataToken;
        let idToken = dataToken.id;
        console.log(idToken);

        const getPaymentQuery = 'SELECT * FROM payments WHERE User_Order_ID = ? AND Status =  ?';

        const getDetailQuery = 'SELECT *, prescription_order.ID AS prescription_ID FROM prescription_order LEFT JOIN shipping_methods ON prescription_order.Shipping_Method = shipping_methods.Methods_ID LEFT JOIN order_status ON prescription_order.Status = order_status.ID LEFT JOIN addresses ON prescription_order.Address_Target_Id = addresses.ID WHERE prescription_order.ID = ?';

        try {
            await query('Start Transaction');

            const getPayment = await query(getPaymentQuery, [idToken, 'active'])
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            const getDetail = await query(getDetailQuery, getPayment[0].Order_ID)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            // console.table(getDetail);
            const images = getDetail[0].Image ? `http://localhost:2004/${getDetail[0].Image}` : null;

            await query('Commit');
            console.log('Berhasil get detail transaksi');
            res.status(200).send({
                error: false,
                message: 'Get Transaction success',
                detail: 'Details transaction succes',
                data: {
                    ID: getDetail[0].prescription_ID,
                    Status: getDetail[0].Status,
                    Prescription_Doctor: getDetail[0].Prescription_Doctor,
                    Desease_Type: getDetail[0].Desease_Type,
                    Description: getDetail[0].Description,
                    Image: images,
                    Shipping_Method: getDetail[0].Shipping_Method,
                    Address_Target_ID: getDetail[0].Address_Target_ID,
                    Created_At: getDetail[0].Created_At,
                    Prescription_User_ID: getDetail[0].Prescription_User_ID,
                    Total_Price: getDetail[0].Total_Price,
                    Order_Qty: getDetail[0].Order_Qty,
                    Shipping_Code: getDetail[0].Shipping_Code,
                    Methods_ID: getDetail[0].Methods_ID,
                    Shipping_Provider: getDetail[0].Shipping_Provider,
                    Method: getDetail[0].Method,
                    Cost: getDetail[0].Cost,
                    Status_Name: getDetail[0].Status_Name,
                    Fk_Address_User_ID: getDetail[0].Fk_Address_User_ID,
                    Full_Address: getDetail[0].Full_Address,
                    Recipient_Name: getDetail[0].Recipient_Name,
                    Recipient_Phone: getDetail[0].Recipient_Phone,
                    Zip_Code: getDetail[0].Zip_Code,
                    Address_Label: getDetail[0].Address_Label,
                    Province: getDetail[0].Province,
                    City: getDetail[0].City,
                    Districts: getDetail[0].Districts
                }
            });

        } catch (err) {
            await query('Rollback');
            if (err.status) {
                err.status(err.status).send({
                    error: true,
                    message: err.message,
                    detail: err.detail
                });
            } else {
                err.status(500).send({
                    error: true,
                    message: err.message
                });
            }
        }
    },

    completeTransaction: async (req, res) => {
        let dataToken = req.dataToken;
        let data = req.body;

        let patchQuery = 'UPDATE prescription_order SET Status = 4 WHERE Prescription_User_ID = ? AND ID = ?';

        try {
            await query('Start Transaction');

            const completeTransaction = await query(patchQuery, [dataToken.id, data.ID])
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            console.log('Berhasil Complete Transaction');
            res.status(200).send({
                error: false,
                message: 'Transaction Complete',
                detail: 'Transaction status set to complete'
            });
        } catch (err) {
            await query('Rollback');
            if (err.status) {
                err.status(err.status).send({
                    error: true,
                    message: err.message,
                    detail: err.detail
                });
            } else {
                err.status(500).send({
                    error: true,
                    message: err.message
                });
            }
        }
    },

    setPaymentDetail: async (req, res) => {
        let dataToken = req.dataToken;
        let data = req.params;

        const setQuery = 'INSERT INTO payments SET ?';

        try {
            await query('Start Transaction');

            let dataToSet = {
                Order_ID: data.ID,
                User_Order_ID: dataToken.id,
                Status: 'active'
            };

            const setPayment = await query(setQuery, dataToSet)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            console.log('Berhasil Set Payment');
            res.status(200).send({
                error: false,
                message: 'Set Payment Success',
                detail: 'Payment Order ID set to active'
            });
        } catch (err) {
            await query('Rollback');
            if (err.status) {
                err.status(err.status).send({
                    error: true,
                    message: err.message,
                    detail: err.detail
                });
            } else {
                err.status(500).send({
                    error: true,
                    message: err.message
                });
            }
        }
    },

    userPayment: async (req, res) => {
        let data = req.body;
        let dataToken = req.dataToken;
        let cardNumber = cardGen({ issuer: 'MasterCard' });

        const setNotifQuery = 'INSERT INTO notification SET ?';
        const updatePaymentQuery = 'UPDATE payments SET Status = ? WHERE ID = ?';
        const setPaymentQuery = 'UPDATE prescription_order SET ? WHERE (ID = ?)';

        try {
            await query('Start Transaction');

            const paymentsStatus = await query(updatePaymentQuery, ['inactive', data.ID])
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            let setNotif = {
                Prescription_Order_ID: dataToken.ID,
                User_ID: data.ID,
                Status: 'unpaid'
            };

            let dataToSet = {
                Virtual_Account: cardNumber,
                Total_Price: data.totalTax,
                Shipping_Method: data.shippingMethod,
                Payment_Method_ID: data.payment,
                Status: 6
            };

            const setPayment = await query(setPaymentQuery, [dataToSet, data.ID])
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            const setNotification = await query(setNotifQuery, setNotif)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            console.log('Berhasil Set Payment');
            res.status(200).send({
                error: false,
                message: 'Set Payment Success',
                detail: 'Payment Order ID set to active'
            });
        } catch (err) {
            await query('Rollback');
            if (err.status) {
                err.status(err.status).send({
                    error: true,
                    message: err.message,
                    detail: err.detail
                });
            } else {
                err.status(500).send({
                    error: true,
                    message: err.message
                });
            }
        }
    }
};