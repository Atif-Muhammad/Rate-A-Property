const mongoose = require("mongoose");
const msg = require("./MessageModel")

const user = require("./userModel");

const chatSchema = mongoose.Schema({
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "msg"
    }],
    accA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    accB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
}, {timestamps: true})

module.exports = mongoose.model("chat", chatSchema);