const util = require('util');
const { db } = require('../Database/Connection');
const query = util.promisify(db.query).bind(db);

const singleUpload = require('../Helpers/multerSingle');
const deleteFiles = require('../Helpers/deleteFiles');

module.exports = {
    addProduct: async (req, res) => {
        singleUpload(req, res, (err) => {
            try {
                if (err) throw err;
                if (req.files === undefined || req.files.length === 0) throw { message: 'File Not Found' };

                // Data Text {name: ..., brand: ..., price: ..., stock: ...}
                let data = req.body.data; // req.body.key
                console.log('nih data' + data);
                let dataParsed;
                try {
                    dataParsed = JSON.parse(data); // Merubah Data Dari Form Yang Awalnya String ---> Object
                    console.log('nih data parsed ' + dataParsed);
                } catch (error) {
                    res.status(500).send({
                        error: true,
                        message: 'Error Parsed Data'
                    });
                }

                // Get Image Path Location to Delete
                let filesPathLocation = req.files.map((value) => value.path);
                console.log(filesPathLocation);

                db.beginTransaction((err) => {
                    try {
                        if (err) throw err;

                        db.query('INSERT INTO products SET ?', dataParsed, (err, result) => {
                            try {
                                if (err) {
                                    deleteFiles(filesPathLocation);

                                    return db.rollback(() => {
                                        throw err;
                                    });
                                }

                                let products_id = result.insertId;

                                // Case: 1 File
                                // let imagePathLocation = `http://localhost:5000/${req.files[0].path}`

                                // Case: > 1 File
                                let imagePathLocation = req.files.map((value) => {
                                    // console.log(value.path)
                                    return [
                                        `http://localhost:5000/${value.path}`, products_id
                                    ];
                                });

                                console.log(imagePathLocation);

                                // Case: 1 Data
                                // db.query('INSERT INTO products_images SET ?', {image: imagePathLocation, products_id: product_id}, (err, result))

                                // Case: > 1 Data
                                db.query('INSERT INTO products_images (image, products_id) VALUES ?', [imagePathLocation], (err, result) => {
                                    try {
                                        if (err) {
                                            deleteFiles(filesPathLocation);

                                            return db.rollback(() => {
                                                throw err;
                                            });
                                        }

                                        db.commit((err) => {
                                            if (err) {
                                                deleteFiles(filesPathLocation);

                                                return db.rollback(() => {
                                                    throw err;
                                                });
                                            }

                                            res.status(200).send({
                                                error: false,
                                                message: 'Upload Image Success'
                                            });
                                        });
                                    } catch (error) {
                                        res.status(500).send({
                                            error: true,
                                            message: 'Error Insert Image',
                                            detail: error.message
                                        });
                                    }
                                });
                            } catch (error) {
                                res.status(500).send({
                                    error: true,
                                    message: 'Error Insert Product',
                                    detail: error.message
                                });
                            }
                        });
                    } catch (error) {
                        res.status(500).send({
                            error: true,
                            message: 'Begin Transaction Error',
                            detail: error.message
                        });
                    }
                });
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: 'Error Multer',
                    detail: error.message
                });
            }
        });
    }
};