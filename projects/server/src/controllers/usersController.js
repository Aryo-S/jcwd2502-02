const db = require('./../models');
const fs = require('fs').promises;
const { findAllUsers, findId, findEmail, findUsername, findReferral, verifyUser, createUser, userLogin, registerUser, createBranchManager, getFilteredAdmin, editBranchManager, checkReferralService, verifyUserAccount } = require('./../services/userService');
const { createJWT } = require('../lib/jwt');
// const {deleteFiles} = require('');
const { hash, match } = require('./../helper/hashing');
const transporter = require('./../helper/transporter');
const handlebars = require('handlebars');
const respondHandler = require('../utils/resnpondHandler');
const responseHandler = require('../utils/responseHandler');
const { log, error } = require('console');
const { deleteFiles } = require('../helper/deleteFiles')
const FE_BASEPATH = process.env.FE_BASEPATH || "http://localhost:3000";

module.exports = {
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const account = await userLogin(email, password);
            respondHandler(res, {
                message: "login is succesful",
                data: {
                    id: account.data.id,
                    username: account.data.username,
                    email: account.data.email,
                    role: account.data.role,
                    jwt: account.data.jwt,
                    profile_picture: account.data.profile_picture,
                    store_branch_id: account.data.store_branch_id
                }
            })
        } catch (error) {
            next(error)
        }
    },

    register: async (req, res, next) => {
        try {
            const newUser = await registerUser(req.body)
            if (!newUser.isError) {
                respondHandler(res, {
                    message: "Registration success, please check your email to verify your account!",
                })
            } else {
                throw { message: newUser.message }
            }
        } catch (error) {
            next(error)
        }
    },

    checkReferral: async (req, res, next) => {
        try {
            const getRef = await checkReferralService(req.params)
            responseHandler(res, getRef.message ? getRef.message : "Referral Code Applied", getRef.message ? null : getRef)
        } catch (error) {
            next(error)
        }
    },

    verifyUserAccount: async (req, res, next) => {
        try {
            const { id } = req.dataToken;
            const account = await findId(id)
            if (!account) throw { message: "User account was not found" }
            await verifyUser(id)
            respondHandler(res, {
                message: "User account succesfully verified",
            })
        } catch (error) {
            next(error)
        }
    },

    requestResetPassword: async (req, res, next) => {
        try {
            const { email } = req.body;
            const response = await findEmail(email);
            if (!response) throw { message: "user was not found, please enter a valid email address" };
            const token = createJWT({
                id: response.dataValues.id
            }, '3h');
            const readTemplate = await fs.readFile('./src/public/password-recovery.html', 'utf-8');
            const compiledTemplate = await handlebars.compile(readTemplate);
            const newTemplate = compiledTemplate({ email, token, basepath: FE_BASEPATH })
            await db.used_token.create({
                token: token,
                isValid: true,
                user_id: response.dataValues.id
            })
            await transporter.sendMail({
                to: response.dataValues.email,
                subject: 'password recovery mail',
                html: newTemplate
            })
            respondHandler(res, {
                message: "password reset email has been sent to your email"
            });
        } catch (error) {
            next(error)
        }
    },

    resetPassword: async (req, res, next) => {
        // Di execute sebelum login
        try {
            const data = req.headers;
            const id = (req.dataToken.id);
            const token = req.token;
            const account = await db.user.findOne({
                where: { id }
            });
            if (data.password !== data.confirmpassword) throw { message: "confirmation password must match the new password" }
            const hashMatch = await match(data.password, account.dataValues.password)
            if (hashMatch) throw { message: "The new password cannot be the same as the old one" }
            const hashedPassword = await hash(data.password)
            await db.user.update({
                password: hashedPassword
            }, { where: { id } }
            )
            await db.used_token.update(
                { isValid: "false" },
                { where: { token } }
            )
            res.status(201).send({
                isError: false,
                message: "Password Changed"
            })
        } catch (error) {
            next(error)
        }
    },

    updatePassword: async (req, res, next) => {
        try {
            const { id } = req.dataToken;
            const data = req.headers;
            const account = await db.user.findOne({
                where: { id }
            });
            const hashMatch = await match(data.oldpassword, account.dataValues.password)
            const hashMatchNew = await match(data.newpassword, account.dataValues.password)
            if (!hashMatch) throw { message: "The old password is incorrect" }
            if (hashMatchNew) throw { message: "Cannot use the same password" }
            const hashedPassword = await hash(data.newpassword)
            const updatedUser = await db.user.update(
                { password: hashedPassword },
                { where: { id } }
            );
            respondHandler(res, {
                message: "Password changed successfully"
            })
        } catch (error) {
            next(error)
        }
    },

    getAllUsers: async (req, res, next) => {
        try {
            const data = await findAllUsers();
            respondHandler(res, {
                message: "Userlist fetched",
                data: data
            })
        } catch (error) {
            next(error)
        }
    },

    getUser: async (req, res, next) => {
        try {
            const { id } = req.dataToken;
            const account = await findId(id)
            respondHandler(res, {
                message: "Registration success, please check your email to verify your account!",
                data: account
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    updateUserData: async (req, res, next) => {
        try {
            const { id, username, email, gender, birthdate } = req.body
            const findUser = await await findId(id)
            const newUserData = await db.user.update({ username, email, gender, birthdate }, {
                where: {
                    id
                }
            })
            res.status(201).send({
                isError: false,
                message: "Data Updated",
                data: newUserData
            })
        } catch (error) {
            next(error)
        }
    },
    updateImage: async (req, res, next) => {
        try {
            // 1. Ambil id user
            const { id } = req.dataToken;
            // 2. Ambil path image lama
            const userId = await findId(id)
            // 3. Update new path on table
            const oldImage = userId.profile_picture
            const image = await db.user.findOne({ where: { id } })
            const findImage = await db.user.update({
                profile_picture: req.files.image[0].filename
            }, {
                where: {
                    id: id
                }
            })
            if (oldImage !== "user.jpg") {
                // // 4. Delete image lama
                deleteFiles({
                    image: [oldImage
                    ]
                })
            }

            // 5. Kirim response
            const newUser = await findId(id)

            res.status(201).send({
                isError: false,
                message: 'Update Image Success!',
                data: newUser
            })
        } catch (error) {
            console.log(error);
            deleteFiles(req.files)
            next(error)
        }
    },

    checkPasswordToken: async (req, res, next) => {
        try {
            const { authorization } = req.headers;
            const token = authorization.split(" ")[1]
            const validToken = await db.used_token.findOne({
                where: { token: token }
            })
            if (validToken.dataValues.isValid == "false")
                throw new Error('invalid token')
            respondHandler(res, {
                message: "token is still valid",
                data: validToken
            })
        } catch (error) {
            console.log('>>>>');
            console.log(error);
            next(error)
        }
    },

    registerBranchAdmin: async (req, res, next) => {
        try {
            const newUser = await createBranchManager(req)
            respondHandler(res, {
                message: newUser.message
            })
        } catch (error) {
            next(error)
        }
    },

    getAllBranchAdmin: async (req, res, next) => {
        try {
            const branchAdmins = await db.user.findAll({
                attributes: ["username", "email", "phone_number", "profile_picture", "isVerified", "store_branch_id", "birthdate"],
                where: { role: "admin" },
                include: [
                    {
                        model: db.store_branch,
                        attributes: ["name"],
                        required: true
                    }
                ],
                order: [["updatedAt", "DESC"]]
            })
            respondHandler(res, {
                message: "get admins",
                data: branchAdmins
            })
        } catch (error) {
            next(error)
        }
    },

    filterBranchAdmin: async (req, res, next) => {
        try {
            const admins = await getFilteredAdmin(req);
            respondHandler(res, {
                isError: false,
                message: "filtered admins fetched",
                data: admins
            })
        } catch (error) {
            next(error);
        }
    },

    deactivateAdmin: async (req, res, next) => {
        try {
            console.log(req.body);
            const { email } = req.body;
            const response = await db.user.findOne({
                where: { email },
            })
            if (!response) throw { message: "User account was not found" };
            const adminStatus = response.dataValues.isVerified;
            console.log(`adminStatus: ${adminStatus}`);
            if (adminStatus == 'verified') {
                const deactivate = await db.user.update({ isVerified: 'unverified' }, { where: { email } })
            } else if (adminStatus == 'unverified') {
                const activate = await db.user.update({ isVerified: 'verified' }, { where: { email } })
            }
            respondHandler(res, {
                message: "Admin status has been updated"
            })
        } catch (error) {
            next(error);
        }
    },

    editAdmin: async (req, res, next) => {
        try {
            const response = await editBranchManager(req)
            respondHandler(res, response)
        } catch (error) {
            next(error);
        }
    },

    verifyUserProfile: async (req, res, next) => {
        try {
            const data = await verifyUserAccount(req)
            respondHandler(res, data)
        } catch (error) {
            next(error)
        }
    }
}