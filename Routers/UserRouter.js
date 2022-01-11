const express = require('express');
const UserAuth = require('../Controllers/UserAuth');
const UserProfile = require('../Controllers/UserProfile');
const UserTransaction = require('../Controllers/UserTransaction');
const jwtVerify = require('../Middleware/JWTVerify');
const routers = express.Router();
const profileMulter = require('../Middleware/multerProfile');

routers.post('/registerUser', UserAuth.registerUser);
routers.patch('/verification', UserAuth.verification);
routers.post('/login', UserAuth.login);
routers.post('/forgotpassword', UserAuth.ForgotPasswordReq);
routers.patch('/changePassword', jwtVerify, UserAuth.changePassword);
routers.patch('/verifyEmail', jwtVerify, UserAuth.verification);
routers.patch('/resetPassword', UserAuth.resetPassword);
routers.patch('/usernameUpdate', jwtVerify, UserAuth.setUsername);

routers.post('/updateProfileImg', jwtVerify, profileMulter.singleUpload.single('Image'), UserProfile.uploadProfileImg);
routers.get('/userkeeplogin', jwtVerify, UserProfile.keepLogin);
routers.get('/userprofiledetail', jwtVerify, UserProfile.userDetail);
routers.patch('/updateprofile', jwtVerify, UserProfile.profileUpdate);
routers.post('/userAddAddress', jwtVerify, UserProfile.AddAddress);
routers.get('/fetchAddress', jwtVerify, UserProfile.fetchAddress);
routers.get('/fetchActiveAddress', jwtVerify, UserProfile.fetchActiveAddress);
routers.patch('/editAddress', UserProfile.editAddress);
routers.delete('/deleteAddress/:ID', UserProfile.deleteAddress);
routers.patch('/selectAddress', jwtVerify, UserProfile.selectAddress);

routers.get('/transactionDetails', jwtVerify, UserTransaction.paymentDetail);
routers.patch('/completeTrans', jwtVerify, UserTransaction.completeTransaction);
routers.get('/setPaymentDetail/:ID', jwtVerify, UserTransaction.setPaymentDetail);
routers.patch('/userPays', jwtVerify, UserTransaction.userPayment);


module.exports = routers;