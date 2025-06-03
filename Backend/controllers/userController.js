const user = require("../models/userModel")
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const post = require('../models/postModel')


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
    getUser: async (req, res) => {
        const user_id = req.query.user;

        try {
            const usr = await user.findOne({ _id: user_id });
            // console.log(usr)
            const finalUser = {
                ...usr._doc,
                image: `data:image/png;base64,${usr.image.data.toString("base64")}`,
            }
            res.send(finalUser)
        } catch (error) {
            res.send(error);
        }
    },
    followUser: async (req, res) => {
        const follower_id = req.query.follower_id;
        const follow_id = req.query.follow_id;

        try {
            const followerDB = await user.findById(follower_id);
            const followDB = await user.findById(follow_id);

            if (followerDB && followDB) {
                // Check if already following
                const isAlreadyFollowing = followerDB.following.includes(follow_id);
                const isAlreadyFollowed = followDB.followers.includes(follower_id);

                if (!isAlreadyFollowing) {
                    followerDB.following.push(follow_id);
                }

                if (!isAlreadyFollowed) {
                    followDB.followers.push(follower_id);
                }

                await followerDB.save();
                await followDB.save();

                res.send("Successfully followed the user");
            } else {
                res.status(404).send("User not found");
            }
        } catch (error) {
            res.status(500).send(error);
        }

    },
    unfollowUser: async (req, res) => {
        const follower_id = req.query.follower_id;
        const follow_id = req.query.follow_id;

        // console.log(follower_id, follow_id)

        try {
            const followerDB = await user.findById(follower_id);
            const followDB = await user.findById(follow_id);

            if (followerDB && followDB) {
                // Filter out follow_id from following array
                followerDB.following = followerDB.following.filter(
                    (id) => id.toString() !== follow_id
                );

                // Filter out follower_id from followers array
                followDB.followers = followDB.followers.filter(
                    (id) => id.toString() !== follower_id
                );

                await followerDB.save();
                await followDB.save();

                res.send("Successfully unfollowed the user");
            } else {
                res.status(404).send("User not found");
            }
        } catch (error) {
            res.status(500).send(error);
        }

    },
    getFriends: async (req, res) => {
        try {
            const { userId } = req.params;
            const friends = await user.findById(userId)
                .select("followers following")
                .populate({
                    path: "followers",
                    select: "user_name image"
                })
                .populate({
                    path: "following",
                    select: "user_name image"
                });
                // console.log(friends)
            const followers = friends?.followers
            const followings = friends?.following

            const finalFollowing = followings?.map((friend) => {
                // console.log(friend)
                return {
                    ...friend._doc,
                    image: `data:image/png;base64,${friend?.image.data.toString("base64")}`,
                }
            })
            const finalFollowers = followers?.map((friend) => {
                // console.log(friend)
                return {
                    ...friend._doc,
                    image: `data:image/png;base64,${friend?.image.data.toString("base64")}`,
                }
            })

            // console.log(finalFollowing, finalFollowers)
            const finalFriends = {
                finalFollowers, finalFollowing
            }
            res.send(finalFriends)
        } catch (error) {
            return error
        }

    },


    search: async (req, res) => {
        // search for the 'data' in all database/only user name and post's location

        try {
            const { data } = req.params;
            const foundUser = await user.find({ user_name: { $regex: data, $options: 'i' } });

            const finalUsers = foundUser.map(user => ({
                ...user._doc,
                image: user.image?.data
                    ? `data:image/png;base64,${user.image.data.toString("base64")}`
                    : null,
            }));

            // console.log(foundUser)
            // const foundPost = await post.find({ location: { $regex: data, $options: 'i' }})
            const posts = await post
                .find({ location: { $regex: data, $options: 'i' } }).sort({ createdAt: -1 })
                // .skip(skip)
                // .limit(limit)
                .populate("owner")
                .populate("likes")
                .populate("disLikes")
                .populate({
                    path: "media",
                    populate: [
                        { path: "likes" },
                        { path: "disLikes" },
                    ],
                })

            // console.log(posts)
            // const total = await post.countDocuments();
            // console.log(`total: ${total} || fetched: ${posts.length}`)
            // const hasMore = (skip + posts.length) < total;
            // console.log(hasMore)

            const updatedPosts = posts.map(post => {
                const mediaUrls = post.media
                    .map(file => {
                        // console.log(file)
                        const fileData = file.toObject();
                        const fileExt = fileData.identifier.filename.split(".").pop()?.toLowerCase();
                        const mediaType = ["mp4", "webm", "mov"].includes(fileExt) ? "video" : "image";
                        const ownerId = post.owner?._id?.toString() || post.owner?.toString();

                        if (!ownerId) {
                            console.error("Missing owner ID for post:", post._id);
                            return null;
                        }

                        return {
                            url: `${req.protocol}://${req.get("host")}/uploads/${ownerId}/${fileData.identifier.filename}`,
                            type: mediaType,
                            filename: fileData.identifier.filename,
                            likes: file.likes,
                            disLikes: file.disLikes,
                            of_post: file.of_post,
                            owner: file.owner,
                            _id: file._id
                        };
                    })
                    .filter(Boolean);

                return {
                    ...post.toObject(),
                    media: mediaUrls,
                    owner: {
                        ...post.owner.toObject(),
                        image: post.owner.image?.data
                            ? `data:image/png;base64,${post.owner.image.data.toString("base64")}`
                            : null
                    }
                };
            });

            const final = {
                users: finalUsers,
                posts: updatedPosts
            };
            res.send(final)
        } catch (error) {
            res.send(error);
        }

    }

}

module.exports = userController;