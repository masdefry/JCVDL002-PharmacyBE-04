const express = require('express');
const AdminController = require('../Controllers/AdminController');
const jwtVerify = require('../Middleware/JWTVerify');
const routers = express.Router();
const productMulter = require('../Middleware/multerProduct');
const orderMulter = require('../Middleware/multerOrder');

routers.post('/addProduct', productMulter.singleUpload.single('Image'), AdminController.addProduct);
routers.get('/fetchProduct', AdminController.fetchProduct);
routers.post('/orderPresription', jwtVerify, orderMulter.singleUpload.single('Image'), AdminController.prescriptionOrder);
routers.get('/fetchPrescription', jwtVerify, AdminController.fetchPrescriptionOrder);

module.exports = routers;