const util = require('util');
const { db } = require('../Database/Connection');
const query = util.promisify(db.query).bind(db);

const dateGenerator = require('../Helpers/DateGenerator');
const singleUpload = require('../Helpers/multerSingle');
const deleteFiles = require('../Helpers/deleteFiles');
const singleUploadAwait = util.promisify(singleUpload).bind(singleUpload);

const express = require('express');
const app = express();
app.use('/Public', express.static('storage'));

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

        const insertQuery = 'INSERT INTO prescription_order SET ?';

        try {
            await query('Start Transaction');

            let dataToSend = {
                Status: 5,
                Prescription_Doctor: parsedData.doctor,
                Desease_Type: parsedData.deseaseType,
                Description: parsedData.description,
                Address_Target_ID: parsedData.addressID,
                Created_At: date,
                Image: imgPath,
                Prescription_User_ID: dataToken.id,
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

        const fetchQuery = 'SELECT * FROM dbdesign.prescription_order LEFT JOIN shipping_methods ON prescription_order.Shipping_Method = shipping_methods.Methods_ID LEFT JOIN order_status ON prescription_order.Status = order_status.ID LEFT JOIN addresses ON prescription_order.Address_Target_Id = addresses.ID WHERE prescription_order.Prescription_User_ID = ?';

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
                message: 'Prescription Upload Success',
                detail: 'Product now available in database',
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
};