const user = require("../models/userModel")
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")


const userController = {

    createUser: async (req, res) => {
        // todo: generate jwt or session for authentication
        const { name, email, password, role } = req.body;

        try {
            const found_user = await user.find({ user_name: name });
            if (found_user.length > 0) {
                return res.status(400).send("user name is already taken");
            } else {
                const found_user = await user.find({ email: email });
                if (found_user.length > 0) {
                    return res.status(400).send("email is already taken");
                }
            }
        } catch (err) {
            return res.send(err);
        }

        const saltRounds = 15;
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                const userData = {
                    user_name: name,
                    email: email,
                    password: hash,
                    role: role || "User",
                    image: req.file ? {
                        data: req.file.buffer,
                        contentType: req.file.mimetype
                    } : null
                };
                // store this hash in the password section alnong with email in mongoDB
                try {
                    var userDB = await user.create(userData);


                    // (2) generate jwt token and send as cookie back to client
                    const secretKey = process.env.SECRET_KEY;
                    const payload = {
                        id: userDB._id,
                        email: userDB.email,
                        user_name: userDB.user_name,
                        role: userDB.role,
                    };

                    // (3) set cookies for client browser

                    // res.clearCookie("authToken");
                    const token = jwt.sign(payload, secretKey, {
                        algorithm: "HS256",
                        expiresIn: process.env.JWT_EXP,
                    });// send an instant email to user
                    // create transporter
                    const transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: process.env.ADMIN_EMAIL,
                            pass: process.env.ADMIN_PASS,
                        },
                    });
                    // create email message
                    const mailOptions = {
                        from: process.env.ADMIN_EMAIL,
                        to: email,
                        subject: "Thank you!",
                        text: "Thank you",
                    };

                    try {
                        const sentMail = await transporter.sendMail(mailOptions);
                        //  console.log(sentMail)
                        if (sentMail.accepted != null) {
                            // console.log("sending cookie:", token)
                            res.cookie("authToken", token, { httpOnly: true, sameSite: "strict", secure: false })
                                .send("Successfully logged in-cookies sent");
                        } else {
                            res.sendStatus(404)
                        }
                    } catch (error) {
                        console.log(error);
                    }

                } catch (err) {
                    res.send(err);
                }
            }
        });
    },
    loginUser: async (req, res) => {
        const { email, password } = req.body.data;

        try {
            const userDetails = await user.findOne({ email: email });
            const passwordDB = userDetails.password;
            bcrypt.compare(password, passwordDB, (err, result) => {
                if (result) {
                    // res.send("Authentic user-Logged in.")
                    // generate jwt token and send to user browser
                    // best practice in this case is to set the payload for user-id and role(admin or normal-user)
                    const payload = {
                        id: userDetails._id,
                        email: userDetails.email,
                        student_name: userDetails.student_name,
                        role: userDetails.role,
                    };
                    // check the jwtToken on client, whether it is out-dated or not?
                    const secretKey = process.env.SECRET_KEY;
                    const jwtTokenCheck = req.cookies.authToken;
                    jwt.verify(jwtTokenCheck, secretKey, async (err, result) => {
                        if (err) {
                            res.clearCookie("authToken");
                            const token = jwt.sign(payload, secretKey, {
                                algorithm: "HS256",
                                expiresIn: "7d",
                            });
                            // send an instant email to user
                            // create transporter
                            const transporter = nodemailer.createTransport({
                                service: "gmail",
                                auth: {
                                    user: process.env.ADMIN_EMAIL,
                                    pass: process.env.ADMIN_PASS,
                                },
                            });
                            // create email message
                            const mailOptions = {
                                from: process.env.ADMIN_EMAIL,
                                to: email,
                                subject: "Thank you!",
                                text: "Thank you",
                            };

                            try {
                                const sentMail = await transporter.sendMail(mailOptions);
                                //  console.log(sentMail)
                                if (sentMail.accepted != null) {
                                    res
                                        .cookie("authToken", token, { httpOnly: true, sameSite: "strict", secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 })
                                        .send("Successfully logged in-cookies sent");
                                } else {
                                    res.sendStatus(404)
                                }
                            } catch (error) {
                                console.log(error);
                            }

                        } else {
                            // give access to student
                            res.send("Successfully logged in-cookies are already set");
                        }

                    });
                } else {
                    res.status(401).send("Invalid credentials");
                }
            });
        } catch (err) {
            res.status(404).send("User not found-Create account first");
        }
    },
    logoutUser: (req, res) => {
        res.clearCookie("authToken", {
            path: "/",
            sameSite: "strict",
            httpOnly: true,
            secure: false
        }).send("successfully logged out--Redirecting to index page");
    },
    userWho: (req, res) => {
        const user_jwt = req.cookies.authToken;
        const secret_key = process.env.SECRET_KEY;
        res.send(jwt.verify(user_jwt, secret_key, (err, decoded) => {
            if (err) {
                return err
            } else {
                return decoded
            }
        }))
    },
    getUser: async (req, res)=>{
        const user_id = req.query.user;
        
        try {
            const usr = await user.findOne({_id: user_id});
            // console.log(usr)
            res.send(usr)
        } catch (error) {
            res.send(error);
        }
    }

}

module.exports = userController;