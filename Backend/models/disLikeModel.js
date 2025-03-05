const mongoose = require("mongoose");
const user = require("./userModel")
const post = require("./postModel")

const disLikeSchema = mongoose.Schema({

    for_post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
    

}, {timestamps: true})

module.exports = mongoose.model("disLike", disLikeSchema);