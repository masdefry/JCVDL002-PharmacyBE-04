const express = require('express');
const AdminController = require('../Controllers/AdminController');
const jwtVerify = require('../Middleware/JWTVerify');
const routers = express.Router();

module.exports = routers;