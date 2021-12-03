const express = require('express');
const UserController = require('../Controllers/UserController');
const routers = express.Router();

routers.get('/get', UserController.getData);

module.exports = routers;