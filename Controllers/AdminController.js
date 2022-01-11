const util = require('util');
const { db } = require('../Database/Connection');
const query = util.promisify(db.query).bind(db);

const resiGenerator = require('../Helpers/TrackingNumber');
const dateGenerator = require('../Helpers/DateGenerator');
const singleUpload = require('../Helpers/multerSingle');
const deleteFiles = require('../Helpers/deleteFiles');
const singleUploadAwait = util.promisify(singleUpload).bind(singleUpload);

const express = require('express');
const app = express();


module.exports = {
    addProduct: async (req, res) => {
        let { data } = req.body;
        let imgPath = req.body.storePicture;
        console.log(data);
        let dataParsed = JSON.parse(data);
        console.log([dataParsed]);

        let insertDataQuery = 'INSERT INTO products SET ?';
        let insertImgQuery = 'UPDATE products SET `Image` = ? WHERE (`SKU` = ?)';

        try {
            await query('Start Transaction');

            const insertData = await query(insertDataQuery, dataParsed)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            const insertImg = await query(insertImgQuery, [imgPath, insertData.insertId])
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            console.log('berhasil commit data product');
            res.status(200).send({
                error: false,
                message: 'Update Product Success',
                detail: 'Product now available in database'
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

    editProduct: async (req, res) => {
        let { data } = req.body;
        let imgPath = req.body.storePicture;
        console.log(data);
        let dataParsed = JSON.parse(data);
        console.log([dataParsed]);

        let insertDataQuery = 'UPDATE products SET ?';
        let insertImgQuery = 'UPDATE products SET `Image` = ? WHERE (`SKU` = ?)';

        try {
            await query('Start Transaction');

            const insertData = await query(insertDataQuery, dataParsed)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            const insertImg = await query(insertImgQuery, [imgPath, insertData.insertId])
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            console.log('berhasil commit data product');
            res.status(200).send({
                error: false,
                message: 'Update Product Success',
                detail: 'Product now available in database'
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

    deleteProduct: async (req, res) => {
        console.log(req);
        let data = req.params;

        const deleteQuery = 'DELETE FROM products WHERE (SKU = ?)';

        try {
            await query('Start Transaction');

            const deleteAddress = await query(deleteQuery, data.ID)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            console.log('Berhasil hapus address');
            res.status(200).send({
                error: false,
                message: 'Product Deleted',
                detail: 'Delete Product Success'
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

    fetchProduct: async (req, res) => {

        const getProductQuery = 'SELECT products.SKU, products.Category_ID, products.Name, products.Qty, products.Price, products.Image, products.Description, product_category.Name AS Category_Name FROM products INNER JOIN product_category ON products.Category_ID = product_category.ID';

        try {
            await query('Start Transaction');

            const getProduct = await query(getProductQuery)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            let productData = getProduct.map((val) => ({
                SKU: val.SKU,
                Category_ID: val.Category_Name,
                Name: val.Name,
                Price: val.Price,
                Qty: val.Qty,
                Image: `http://localhost:2004/${val.Image}`,
                Description: val.Description
            }));

            await query('Commit');
            console.log('berhasil get data product');
            res.status(200).send({
                error: false,
                message: 'Update Product Success',
                detail: 'Product now available in database',
                data: productData
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

    prescriptionOrder: async (req, res) => {
        let dataToken = req.dataToken;
        let { data } = req.body;
        let parsedData = JSON.parse(data);
        let imgPath = req.body.storePicture;
        let date = dateGenerator();
        console.log(date);

        const getUserDataQuery = 'SELECT * FROM user WHERE ID = ?';
        const insertQuery = 'INSERT INTO prescription_order SET ?';

        try {
            await query('Start Transaction');

            const userData = await query(getUserDataQuery, dataToken.id)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            let dataToSend = {
                Status: 5,
                Prescription_Doctor: parsedData.doctor,
                Desease_Type: parsedData.deseaseType,
                Description: parsedData.description,
                Address_Target_ID: parsedData.addressID,
                Created_At: date,
                Image: imgPath,
                Prescription_User_ID: dataToken.id,
                User_Email: userData[0].Email,
            };

            const insertData = await query(insertQuery, dataToSend)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            console.log('berhasil commit prescription');
            res.status(200).send({
                error: false,
                message: 'Prescription Upload Success',
                detail: 'Product now available in database',
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

    fetchPrescriptionOrder: async (req, res) => {
        let dataToken = req.dataToken;

        const fetchQuery = 'SELECT *, prescription_order.ID as prescription_ID FROM prescription_order LEFT JOIN shipping_methods ON prescription_order.Shipping_Method = shipping_methods.Methods_ID LEFT JOIN order_status ON prescription_order.Status = order_status.ID LEFT JOIN addresses ON prescription_order.Address_Target_Id = addresses.ID LEFT JOIN payment_method ON prescription_order.Payment_Method_ID = payment_method.ID WHERE prescription_order.Prescription_User_ID = ?';

        try {
            await query('Start Transaction');

            const getData = await query(fetchQuery, dataToken.id)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            console.log('berhasil get prescription');
            res.status(200).send({
                error: false,
                message: 'fetch user prescription order',
                detail: 'Fetch all prescription user order',
                data: getData
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

    fetchUserPresOrder: async (req, res) => {
        let data = req.body;

        const fetchQuery = 'SELECT *, prescription_order.ID as prescription_ID FROM dbdesign.prescription_order LEFT JOIN shipping_methods ON prescription_order.Shipping_Method = shipping_methods.Methods_ID LEFT JOIN order_status ON prescription_order.Status = order_status.ID LEFT JOIN addresses ON prescription_order.Address_Target_Id = addresses.ID WHERE prescription_order.User_Email = ?';

        try {
            await query('Start Transaction');

            const fetchData = await query(fetchQuery, data.email)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            console.log('berhasil get prescription for admin');
            res.status(200).send({
                error: false,
                message: 'Fetch user order for admin',
                detail: 'Admin requested user order',
                data: fetchData
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

    setTotalCost: async (req, res) => {
        let data = req.body;
        let dataToken = req.dataToken;

        const setQuery = 'UPDATE prescription_order SET ? WHERE Prescription_User_ID = ? AND ID = ? ';

        try {
            await query('Start Transaction');

            let dataToSet = {
                Status: 1,
                Total_Price: data.totalPrice,
                Order_Qty: data.totalPrdct
            };

            const setCost = await query(setQuery, [dataToSet, dataToken.id, data.ID])
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            console.log('berhasil get prescription for admin');
            res.status(200).send({
                error: false,
                message: 'Total Cost Set',
                detail: 'Set Total Cost Success',
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

    rejectTransaction: async (req, res) => {
        let data = req.params;

        const deleteQuery = 'DELETE FROM prescription_order WHERE ID = ?';

        try {
            await query('Start Transaction');

            const deleteTrans = await query(deleteQuery, data.ID)
                .catch((err) => {
                    console.log(err);
                    throw err;
                });

            await query('Commit');
            console.log('berhasil get prescription for admin');
            res.status(200).send({
                error: false,
                message: 'Transaction Rejected',
                detail: 'Reject transaction success deleted from database',
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

    sendProduct: async (req, res) => {
        let data = req.params;
        let resi = resiGenerator();

        const sendQuery = 'UPDATE prescription_order SET ? WHERE ID = ?';

        try {
            await query('Start Transaction');

            let dataToSend = {
                Status: 3,
                Shipping_Code: resi
            };

            const sendProduct = await query(sendQuery, [dataToSend, data.ID]);

            await query('Commit');
            console.log('berhasil send product');
            res.status(200).send({
                error: false,
                message: 'Product Sent',
                detail: 'Product sent with shipping code',
            });
        } catch (error) {
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