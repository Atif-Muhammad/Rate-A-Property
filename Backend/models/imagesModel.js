const mongoose = require("mongoose");
const user = require("./userModel")

const imagesSchema = mongoose.Schema({
    identifier: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    
})

module.exports = mongoose.model("image", imagesSchema);