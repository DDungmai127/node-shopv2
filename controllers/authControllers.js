const User = require("../models/user");
const brcypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
// const sendgridTransport = require("nodemailer-sendgrid-transport");
const dotenv = require("dotenv");
dotenv.config();
// const transporter = nodemailer.createTransport(sendgridTransport, {
//     auth: {
//         api_key: "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",
//     },
// });

var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "361b2be2dd11e9",
        pass: "0bcc9203f69ae6",
    },
});
exports.getLogin = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: message,
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                req.flash("error", "Invalid email or password");
                return res.redirect("/login");
            }
            brcypt
                .compare(password, user.password)
                .then((isMatch) => {
                    if (isMatch) {
                        // createToken(res);
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        // cái đoạn này là một chi tiết nhỏ, với mục đích là khi nào mà session thật sự được lưu thì nó mới load lại page
                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect("/");
                        });
                    } else {
                        req.flash("error", "Invalid email or password");
                        return res.redirect("/login");
                    }
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect("/login");
                });
        })
        .catch((err) => console.log(err));
};
exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect("/");
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage: message,
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({ email: email })
        .then((userDoc) => {
            if (userDoc) {
                req.flash("error", "Email already exists, please pick a different email");
                return res.redirect("/signup");
            }
            return brcypt
                .hash(password, 12)
                .then((hashedPassword) => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] },
                    });
                    return user.save();
                })
                .then((result) => {
                    res.redirect("/login");
                    transport.sendMail(
                        {
                            from: "email@example.com",
                            to: email,
                            subject: "Signup Successfully",
                            html: "<h1>You have successfully signed up</h1>",
                        },
                        (error, info) => {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("Email sent: " + info.response);
                            }
                        }
                    );
                });
        })
        .catch((err) => {
            console.log(err);
        });
};
exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect("/");
    });
};

exports.getReset = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/reset", {
        path: "/reset",
        pageTitle: "Reset Password",
        errorMessage: message,
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            return res.redirect("/reset");
        }
        const token = buffer.toString("hex");
        User.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    req.flash("error", "No account with that email found");
                    return res.redirect("/reset");
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then((result) => {
                res.redirect("/");
                transport.sendMail(
                    {
                        to: req.body.email,
                        from: "node-shop@gmail.com",
                        subject: "Password reset",
                        html: `<p> Tou resquestd a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>`,
                    },
                    (error, info) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("Email sent: " + info.response);
                        }
                    }
                );
            })
            .catch((err) => {
                console.log(err);
            });
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    console.log(token);
    User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
    })
        .then((user) => {
            let message = req.flash("error");
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            return res.render("auth/new-password", {
                path: "/new-password",
                pageTitle: "New password",
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token,
            });
        })
        .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId,
    })
        .then((user) => {
            resetUser = user;
            return brcypt.hash(newPassword, 12);
        })
        .then((hashedPassword) => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            resetUser.save();
        })
        .then((resulut) => {
            res.redirect("/login");
        })
        .catch((err) => console.log(err));
};
