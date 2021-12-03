const express = require('express');
const { UserController } = require('../Controllers/UserController');
const routers = express.Router();

routers.get('/get', UserController.get);

module.exports = routers;