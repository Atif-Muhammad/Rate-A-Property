const comment = require('../models/commentModel');
const like = require("../models/likesModel");
const disLike = require("../models/disLikeModel");

const deleteCommentsRecursively = async (commentIds) => {
    if (commentIds.length === 0) return;

    // Find replies associated with these comments
    const replyIds = await comment.distinct("_id", { for_post: { $in: commentIds } });


    await like.deleteMany({ for_post: { $in: commentIds } });
    await disLike.deleteMany({ for_post: { $in: commentIds } });

    // Delete the comments
    await comment.deleteMany({ _id: { $in: commentIds } });

    // Recursively delete replies
    await deleteCommentsRecursively(replyIds);
};

module.exports = deleteCommentsRecursively;