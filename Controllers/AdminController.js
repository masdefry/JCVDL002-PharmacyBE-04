const util = require('util');
const { db } = require('../Database/Connection');
const query = util.promisify(db.query).bind(db);

const singleUpload = require('../Helpers/multerSingle');
const deleteFiles = require('../Helpers/deleteFiles');

const express = require('express');
const app = express();
app.use('/Public', express.static('storage'));

module.exports = {
    addProduct: (req, res) => {
        let data = req.body;
        console.log(data);
        let dataParsed = JSON.parse(data);
        console.log(dataParsed);
    }
};