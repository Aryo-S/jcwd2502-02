const express = require("express");
const Router = express.Router();
const { validateUserLogin, validateUserRegistration, handleValidationErrors } = require('./../middlewares/validator');
const { verify } = require('./../lib/jwt');
const upload = require('../middlewares/upload')
// Import All Controller

const { usersController } = require("../controllers");

Router.post('/login', validateUserLogin, handleValidationErrors, usersController.login);
Router.post('/register', validateUserRegistration, handleValidationErrors, usersController.register);
Router.post('/request-reset', usersController.requestResetPassword);

Router.patch('/reset-password', usersController.resetPassword);
Router.patch('/update-user', usersController.updateUserData);
Router.patch('/verify-user', verify, usersController.verifyUserAccount);
Router.patch('/update-image/:id', upload, usersController.updateImage)
Router.post('/update-profile/', usersController.updateProfile)

Router.get('/fetch-user', verify, usersController.getUser);
Router.get('/find-all', usersController.getAllUsers);
Router.get('/find-user', usersController.getUserData);



module.exports = Router;