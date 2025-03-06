const mongoose = require("mongoose");
const user = require("./userModel")

const videoSchema = mongoose.Schema({
    identifier: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    
})

module.exports = mongoose.model("video", videoSchema);