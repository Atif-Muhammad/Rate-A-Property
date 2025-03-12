const mongoose = require("mongoose");
const user = require("./userModel");
const like = require("./likesModel");
const disLike = require("./disLikeModel");
const post = require("./postModel");
const comment = require("./commentModel")

const mediaSchema = mongoose.Schema({
  identifier: {
    filename: { type: String, required: true },
    type: { type: String, required: true },
    path: { type: String, required: true },
  },
  of_post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post",
  },
  of_comment:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "like",
    },
  ],
  disLikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "disLike",
    },
  ],
});

module.exports = mongoose.model("media", mediaSchema);
