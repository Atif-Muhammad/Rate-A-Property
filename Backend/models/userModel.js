const mongoose = require("mongoose")
const post = require("./postModel")
const comment = require("./commentModel")
const like = require("./likesModel")
const msg = require("../models/MessageModel");
const chat = require("../models/chatModel")

const userSchema = mongoose.Schema({
    user_name: String,
    role: {
        type: String,
        enum: ["Admin", "User"]
    },
    email: String,
    password: String,
    image: {
        data: Buffer,
        contentType: String
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment'
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'like'
    }],
    disLikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'disLike'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chat'
    }]
})

module.exports = mongoose.model("user", userSchema);