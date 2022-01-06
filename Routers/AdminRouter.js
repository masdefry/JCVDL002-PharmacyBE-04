const express = require('express');
const AdminController = require('../Controllers/AdminController');
const jwtVerify = require('../Middleware/JWTVerify');
const routers = express.Router();
const productMulter = require('../Middleware/multerProduct');

routers.post('/addProduct', productMulter.singleUpload.single('Image'), AdminController.addProduct);

module.exports = routers;