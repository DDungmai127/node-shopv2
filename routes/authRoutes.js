const path = require("path");

const express = require("express");
const { check, body } = require("express-validator");
const authController = require("../controllers/authControllers.js");
const User = require("../models/user");
const router = express.Router();
router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);

router.post(
    "/login",
    [
        check("email")
            .isEmail()
            .withMessage("Please enter a valid email address")
            .normalizeEmail()
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then((user) => {
                    if (!user) {
                        return Promise.reject("No such user exist! Please SignUp to continue");
                    }
                });
            }),
        body("password", "Password is not valid, should contain more than 5 numbers or characters")
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim(),
    ],
    authController.postLogin
);

router.post(
    "/signup",
    [
        check("email")
            .isEmail()
            .withMessage("Please enter a valid email")
            .custom((value, { req }) => {
                // if (value === "test@test.com") {
                //     throw new Error("This email address if forbidden");
                // }
                // return true;
                return User.findOne({ email: value }).then((userDoc) => {
                    if (userDoc) {
                        return Promise.reject("Email exists already, please pick a different one");
                    }
                });
            })
            //cái này nó lower case email
            .normalizeEmail(),
        // only validate for req.body
        body(
            "password",
            "Please enter a password with only numbers and text and at least 6 characters"
        )
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim(),
        body("confirmPassword")
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Passwords have to match");
                }
                return true;
            })
            .trim(),
    ],
    authController.postSignup
);
router.post("/logout", authController.postLogout);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);
module.exports = router;
