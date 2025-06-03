const mongoose = require("mongoose");

const user = require("./userModel");

const msgSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    content: String
}, {timestamps: true})

module.exports = mongoose.model("msg", msgSchema);