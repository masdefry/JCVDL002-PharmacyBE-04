const express = require('express');
const UserAuth = require('../Controllers/UserAuth');
const { AddAddress } = require('../Controllers/UserProfile');
const UserProfile = require('../Controllers/UserProfile');
const jwtVerify = require('../Middleware/JWTVerify');
const routers = express.Router();

routers.post('/registerUser', UserAuth.registerUser);
routers.patch('/verification', UserAuth.verification);
routers.post('/login', UserAuth.login);
routers.patch('/changePassword', jwtVerify, UserAuth.changePassword);
routers.patch('/verifyEmail', jwtVerify, UserAuth.verification);
routers.patch('/resetPassword', UserAuth.resetPassword);


routers.get('/userkeeplogin', jwtVerify, UserProfile.keepLogin);
routers.get('/userprofiledetail', jwtVerify, UserProfile.userDetail);
routers.patch('/updateprofile', jwtVerify, UserProfile.profileUpdate);
routers.post('/userAddAddress', UserProfile.AddAddress);

module.exports = routers;