const mongoose = require("mongoose");
const user = require("./userModel");
const comment = require("./commentModel");
const like = require("./likesModel");
const disLike = require("./disLikeModel");
const media = require("./mediaModel");

const postSchema = mongoose.Schema(
  {
    description: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    location: String,
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "like",
      },
    ],
    media: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "media",
      },
    ],
    disLikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "disLike",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("post", postSchema);
