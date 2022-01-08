const express = require('express');
const UserAuth = require('../Controllers/UserAuth');
const { AddAddress } = require('../Controllers/UserProfile');
const UserProfile = require('../Controllers/UserProfile');
const jwtVerify = require('../Middleware/JWTVerify');
const routers = express.Router();

routers.post('/registerUser', UserAuth.registerUser);
routers.patch('/verification', UserAuth.verification);
routers.post('/login', UserAuth.login);
routers.post('/forgotpassword', UserAuth.ForgotPasswordReq);
routers.patch('/changePassword', jwtVerify, UserAuth.changePassword);
routers.patch('/verifyEmail', jwtVerify, UserAuth.verification);
routers.patch('/resetPassword', UserAuth.resetPassword);


routers.get('/userkeeplogin', jwtVerify, UserProfile.keepLogin);
routers.get('/userprofiledetail', jwtVerify, UserProfile.userDetail);
routers.patch('/updateprofile', jwtVerify, UserProfile.profileUpdate);
routers.post('/userAddAddress', jwtVerify, UserProfile.AddAddress);
routers.get('/fetchAddress', jwtVerify, UserProfile.fetchAddress);
routers.get('/fetchActiveAddress', jwtVerify, UserProfile.fetchActiveAddress);
routers.patch('/editAddress', UserProfile.editAddress);
routers.delete('/deleteAddress', UserProfile.deleteAddress);
routers.patch('/selectAddress', jwtVerify, UserProfile.selectAddress);

module.exports = routers;