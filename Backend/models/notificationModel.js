const mongoose = require("mongoose");
const user = require("./userModel");
const post = require("./postModel")

const notificationSchema = mongoose.Schema({
    highlighter: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    for_user:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    for_post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        default: null
    },
    clicked:{
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("notification", notificationSchema);