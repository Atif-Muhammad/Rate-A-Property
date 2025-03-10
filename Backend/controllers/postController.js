const user = require("../models/userModel")
const post = require("../models/postModel")
const like = require("../models/likesModel")
const disLike = require("../models/disLikeModel")
const media = require("../models/mediaModel")
const checkUser = require("./checkUser");
const mongoose = require("mongoose");
// const {gfs} = require("../app")
const path = require("path")
const { upload_disk } = require("../multerConfig/multerConfig")


const postController = {
    createPost: async (req, res) => {
        try {
            const { owner, location, description } = req.body;
            const ownerId = new mongoose.Types.ObjectId(owner);
            const file_names = req.fileNames.map(filename => {
                const ext = path.extname(filename);
                const type = ext === ".mp4" || ext === ".webm" || ext === ".MOV" ? "video" : "image";
            
                return {
                    filename: filename.toString(),
                    type: type.toString(),
                    path: `/uploads/${owner}/${filename}`
                };
            });
            const data = {
                owner: ownerId,
                location,
                description,
                likes: [],
                disLikes: [],
                comments: []
            }
            // console.log(data)
            // Create the post first without media
            const created_post = await post.create(data);

            if (!created_post) {
                return res.status(500).json({ error: "Failed to create post" });
            }
            // update media model for filenames
            // console.log(file_names)
            const mediaDocs = await Promise.all(
                file_names.map((file) => {
                    const mediaDoc = new media({
                        identifier: {
                            filename: file.filename,
                            type: file.mimetype?.startsWith("video") ? "video" : "image",
                            path: `/uploads/${ownerId}/${file.filename}`
                        },
                        owner: ownerId,
                        of_post: created_post._id,
                        likes: [],
                        disLikes: []
                    });
                    return mediaDoc.save(); // Returns a promise
                })
            );
            
            // console.log(mediaDocs)
            const ids = mediaDocs.map(doc=> doc._id);
            await post.updateOne({_id: created_post._id}, {$push: {media: {$each: ids} }})
            // Step 6: Update user with the new post
            await user.updateOne({ _id: ownerId }, { $push: { posts: created_post._id } });

            return res.status(200).send("Post Created");
        } catch (error) {
            console.error("Error Creating Post:", error);
            res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    },
    getPosts: async (req, res) => {
        try {
            const posts = await post
                .find({})
                .populate("owner")
                .populate("likes")
                .populate("disLikes")
                .populate("media")
                .sort({ createdAt: -1 });
        
            const updatedPosts = posts.map(post => {
                const mediaUrls = post.media
                    .map(file => {
                        const fileData = file.toObject();
                        const fileExt = fileData.identifier.filename.split(".").pop()?.toLowerCase();
                        const mediaType = ["mp4", "webm", "mov"].includes(fileExt) ? "video" : "image";
                        const ownerId = post.owner?._id?.toString() || post.owner?.toString();
        
                        if (!ownerId) {
                            console.error("Missing owner ID for post:", post._id);
                            return null;
                        }
        
                        return {
                            url: `${req.protocol}://${req.get("host")}/uploads/${ownerId}/${fileData.identifier.filename}`,
                            type: mediaType,
                            filename: fileData.identifier.filename
                        };
                    })
                    .filter(Boolean);
        
                return {
                    ...post.toObject(),
                    media: mediaUrls,
                    owner: {
                        ...post.owner.toObject(),
                        image: post.owner.image?.data
                            ? `data:image/png;base64,${post.owner.image.data.toString("base64")}`
                            : null
                    }
                };
            });
        
            res.send(updatedPosts);
        } catch (error) {
            console.error("Error fetching posts:", error);
            res.status(500).send({ error: "Internal Server Error" });
        }
        
    },
    getSingPost: async (req, res) => {
        const postId = req.query.post
        // console.log(postId)
        try {
            const post = await post.find({ _id: postId }).populate("owner").populate("likes").populate("disLikes");
            res.send(post)
        } catch (error) {
            res.send(error);
        }
    },
    likePost: async (req, res) => {
        const post_id = req.body.postId;
        const user_token = req.cookies;

        try {
            const user_detail = checkUser(user_token.jwtToken);
            const owner_id = user_detail.id;
            const data = {
                for_post: post_id,
                owner: owner_id
            }
            const dis_liked_remove = await disLike.findOneAndDelete({ $and: [{ for_post: post_id }, { owner: owner_id }] });

            if (dis_liked_remove) {
                await user.updateOne({ _id: owner_id }, { $pull: { disLikes: dis_liked_remove._id } });
                await post.updateOne({ _id: post_id }, { $pull: { disLikes: dis_liked_remove._id } });
            }
            const liked = await like.create(data);
            // console.log(liked)
            if (liked) {
                await user.updateOne({ _id: owner_id }, { $push: { likes: liked._id } });
                await post.updateOne({ _id: post_id }, { $push: { likes: liked._id } });
                res.status(200).send(liked)
            }
        } catch (error) {
            res.send(error);
        }
    },
    unLikePost: async (req, res) => {
        const post_id = req.body.postId;
        const user_token = req.cookies;

        try {
            const user_detail = checkUser(user_token.jwtToken);
            const owner_id = user_detail.id;
            const data = {
                for_post: post_id,
                owner: owner_id
            }
            const like_removed = await like.findOneAndDelete({ $and: [{ for_post: post_id }, { owner: owner_id }] });

            if (like_removed) {
                await user.updateOne({ _id: owner_id }, { $pull: { likes: like_removed._id } });
                await post.updateOne({ _id: post_id }, { $pull: { likes: like_removed._id } });
                res.send(like_removed)
            }


        } catch (error) {
            res.send(error);
        }
    },
    disLikePost: async (req, res) => {
        const post_id = req.body.postId;
        const user_token = req.cookies;

        try {
            const user_detail = checkUser(user_token.jwtToken);
            const owner_id = user_detail.id;
            const data = {
                for_post: post_id,
                owner: owner_id
            }

            const un_liked = await like.findOneAndDelete({ $and: [{ for_post: post_id }, { owner: owner_id }] });
            if (un_liked) {
                await user.updateOne({ _id: owner_id }, { $pull: { likes: un_liked._id } });
                await post.updateOne({ _id: post_id }, { $pull: { likes: un_liked._id } });
                // create record for un_liked
            }
            const disLiked = await disLike.create(data);
            if (disLiked) {
                await user.updateOne({ _id: owner_id }, { $push: { disLikes: disLiked._id } });
                await post.updateOne({ _id: post_id }, { $push: { disLikes: disLiked._id } });
                res.status(200).send(data)
            }

        } catch (error) {
            res.send(error);
        }
    },
    unDisLikePost: async (req, res) => {
        const post_id = req.body.postId;
        const user_token = req.cookies;

        try {
            const user_detail = checkUser(user_token.jwtToken);
            const owner_id = user_detail.id;
            const data = {
                for_post: post_id,
                owner: owner_id
            }

            const dis_like_removed = await disLike.findOneAndDelete({ $and: [{ for_post: post_id }, { owner: owner_id }] });

            if (dis_like_removed) {
                await user.updateOne({ _id: owner_id }, { $pull: { disLikes: dis_like_removed._id } });
                await post.updateOne({ _id: post_id }, { $pull: { disLikes: dis_like_removed._id } });
                res.send(dis_like_removed)
            }


        } catch (error) {
            res.send(error);
        }
    }
}

module.exports = postController;