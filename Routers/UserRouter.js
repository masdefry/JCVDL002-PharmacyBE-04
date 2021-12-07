const express = require('express');
const UserController = require('../Controllers/UserController');
const routers = express.Router();

routers.post('/registerUser', UserController.registerUser);

module.exports = routers;