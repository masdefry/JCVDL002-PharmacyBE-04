const express = require('express');
const AdminController = require('../Controllers/AdminController');
const jwtVerify = require('../Middleware/JWTVerify');
const routers = express.Router();
const productMulter = require('../Middleware/multerProduct');
const orderMulter = require('../Middleware/multerOrder');
const jwtSign = require('../Helpers/JWTSign');

routers.post('/addProduct', productMulter.singleUpload.single('Image'), AdminController.addProduct);
routers.get('/fetchProduct', AdminController.fetchProduct);
routers.post('/orderPresription', jwtVerify, orderMulter.singleUpload.single('Image'), AdminController.prescriptionOrder);
routers.get('/fetchPrescription', jwtVerify, AdminController.fetchPrescriptionOrder);
routers.post('/fetchUserPrescription', AdminController.fetchUserPresOrder);
routers.patch('/editProduct', productMulter.singleUpload.single('Image'), AdminController.editProduct);
routers.delete('/deleteProduct/:ID', AdminController.deleteProduct);
routers.post('/setCost', jwtVerify, AdminController.setTotalCost);
routers.delete('/rejectTrans/:ID', AdminController.rejectTransaction);
routers.patch('/sendTrans/:ID', AdminController.sendProduct);

module.exports = routers;