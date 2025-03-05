const mongoose = require("mongoose");
const post = require("./postModel");
const user = require("./userModel")
const comment = require("./commentModel")
const like = require("./likesModel")

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
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment'
    }]
}, { timestamps: true });

module.exports = mongoose.model('comment', commentSchema);


