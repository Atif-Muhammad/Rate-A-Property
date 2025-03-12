const mongoose = require("mongoose");
const post = require("./postModel");
const user = require("./userModel")
const comment = require("./commentModel")
const like = require("./likesModel")
const disLike = require("./disLikeModel")
const media = require("./mediaModel")

const commentSchema = mongoose.Schema({
    comment: String,
    for_post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'like'
    }],
    disLikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'disLike'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment'
    }],
    media: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'media'
    }]
}, { timestamps: true });

module.exports = mongoose.model('comment', commentSchema);


