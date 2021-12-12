const express = require('express');
const UserController = require('../Controllers/UserController');
const routers = express.Router();

routers.post('/registerUser', UserController.registerUser);
routers.patch('/verification', UserController.verification);
routers.post('/login', UserController.login);
routers.patch('changePassword', UserController.changePassword);
// routers.patch('/resetPassword', UserController.resetPassword);

module.exports = routers;