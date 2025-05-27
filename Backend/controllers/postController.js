const user = require("../models/userModel");
const post = require("../models/postModel");
const like = require("../models/likesModel");
const disLike = require("../models/disLikeModel");
const media = require("../models/mediaModel");
const comment = require("../models/commentModel");
const checkUser = require("./checkUser");
const mongoose = require("mongoose");
// const {gfs} = require("../app")
const fs = require("fs");
const path = require("path");
const { upload_disk } = require("../multerConfig/multerConfig");
const deleteCommentsRecursively = require("./deleteComments");
// const HARD_BLOCK_WORDS = require("../Utils");
// const detectNSFW = require("../TensorDetect/DetectNsfw");
const detectOffensiveText = require("../TensorDetect/DetectOffensiveText");
const analyzeSentiment = require("./AnalyzeText");

const postController = {
  createPost: async (req, res) => {
    try {
      const { owner, location, description } = req.body;
      const ownerId = new mongoose.Types.ObjectId(owner);

      const isBad = await detectOffensiveText(description);
      if (isBad) {
        return res.status(400).json({
          success: false,
          error: "Post contains prohibited language",
          timestamp: new Date().toISOString(),
        });
      }


      const files = [];

      for (const filename of req.fileNames || []) {
        const filePath = `./uploads/${owner}/${filename}`;

        const ext = path.extname(filename);
        const type = [".mp4", ".webm", ".MOV"].includes(ext)
          ? "video"
          : "image";

        files.push({
          filename: filename.toString(),
          type: type.toString(),
          path: `/uploads/${owner}/${filename}`,
        });
      }

      const data = {
        owner: ownerId,
        location,
        description,
        likes: [],
        disLikes: [],
        comments: [],
      };
      // console.log(data)
      // Create the post first without media
      const created_post = await post.create(data);

      if (!created_post) {
        return res.status(500).json({ error: "Failed to create post" });
      }
      // update media model for filenames
      // console.log(files)
      const mediaDocs = await Promise.all(
        (files || [])
          .map((file) => {
            const mediaDoc = new media({
              identifier: {
                filename: file.filename,
                type: file.mimetype?.startsWith("video") ? "video" : "image",
                path: `/uploads/${ownerId}/${file.filename}`,
              },
              owner: ownerId,
              of_post: created_post._id,
              likes: [],
              disLikes: [],
            });
            return mediaDoc.save(); // Returns a promise
          })
          .filter(Boolean)
      );

      // console.log(mediaDocs)
      const ids = mediaDocs.map((doc) => doc._id);
      await post.updateOne(
        { _id: created_post._id },
        { $push: { media: { $each: ids } } }
      );
      // Step 6: Update user with the new post
      await user.updateOne(
        { _id: ownerId },
        { $push: { posts: created_post._id } }
      );
      const newPost = await post.findById(created_post._id);
      return res.status(200).send(newPost);
    } catch (error) {
      console.error("Error Creating Post:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  },
  updatePost: async (req, res) => {
    try {
      const postId = req.params.id;
      const { owner, location, description, existingFiles = [] } = req.body;

      const isBad = await detectOffensiveText(description);
      if (isBad) {
        return res.status(400).json({
          success: false,
          error: "Post contains prohibited language",
          timestamp: new Date().toISOString(),
        });
      }

      const ownerId = new mongoose.Types.ObjectId(owner);
      const postDoc = await post.findById(postId).populate("media");
      if (!postDoc) return res.status(404).json({ error: "Post not found" });

      const dbFileUrls = postDoc.media.map((m) => m.identifier.path);

      const uploadedFileNames = req.fileNames || [];
      const uploadedFileUrls = uploadedFileNames.map(
        (filename) => `/uploads/${owner}/${filename}`
      );

      const removedFiles = postDoc.media.filter(
        (m) => !existingFiles.includes(m.identifier.path)
      );

      const addedFiles = uploadedFileUrls.filter(
        (url) => !existingFiles.includes(url)
      );

      // console.log("addedFiles:", addedFiles);
      // console.log(
      //   "removedFiles:",
      //   removedFiles.map((m) => m.identifier.path)
      // );

      // Step 5: Create media metadata for new files
      const addedFileData = addedFiles.map((url) => {
        const ext = path.extname(url);
        const type = [".mp4", ".webm", ".MOV"].includes(ext)
          ? "video"
          : "image";

        return {
          filename: path.basename(url),
          type,
          path: url,
        };
      });

      const mediaChanged = addedFiles.length > 0 || removedFiles.length > 0;
      const contentChanged =
        postDoc.location !== location || postDoc.description !== description;

      if (!mediaChanged && !contentChanged) {
        return res.status(200).json({ message: "No changes detected" });
      }

      // Content update
      if (contentChanged) {
        postDoc.location = location;
        postDoc.description = description;
        await postDoc.save();
      }

      // Media update
      if (mediaChanged) {
        // Delete removed media from DB and disk
        for (const mediaDoc of removedFiles) {
          const filePath = path.join(__dirname, "..", mediaDoc.identifier.path);
          fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete file:", filePath);
          });

          await media.findByIdAndDelete(mediaDoc._id);
          await post.updateOne(
            { _id: postId },
            { $pull: { media: mediaDoc._id } }
          );
        }

        // Add new media to DB
        if (addedFileData.length > 0) {
          const newMediaDocs = await Promise.all(
            addedFileData.map((file) => {
              const mediaDoc = new media({
                identifier: file,
                owner: ownerId,
                of_post: postId,
                likes: [],
                disLikes: [],
              });
              return mediaDoc.save();
            })
          );

          const newMediaIds = newMediaDocs.map((m) => m._id);
          await post.updateOne(
            { _id: postId },
            { $push: { media: { $each: newMediaIds } } }
          );
        }
      }

      return res.status(200).json({ message: "Post updated successfully" });
    } catch (error) {
      console.error("Error Updating Post:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  },
  getPosts: async (req, res) => {
    // console.log(req.query);
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    try {
      const posts = await post
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("owner")
        .populate("likes")
        .populate("disLikes")
        .populate({
          path: "media",
          populate: [{ path: "likes" }, { path: "disLikes" }],
        });

      // console.log(posts)
      const total = await post.countDocuments();
      // console.log(`total: ${total} || fetched: ${posts.length}`)
      const hasMore = skip + posts.length < total;
      // console.log(hasMore)

      const updatedPosts = posts.map((post) => {
        const mediaUrls = post.media
          .map((file) => {
            // console.log(file)
            const fileData = file.toObject();
            const fileExt = fileData.identifier.filename
              .split(".")
              .pop()
              ?.toLowerCase();
            const mediaType = ["mp4", "webm", "mov"].includes(fileExt)
              ? "video"
              : "image";
            const ownerId =
              post.owner?._id?.toString() || post.owner?.toString();

            if (!ownerId) {
              console.error("Missing owner ID for post:", post._id);
              return null;
            }

            return {
              url: `${req.protocol}://${req.get("host")}/uploads/${ownerId}/${fileData.identifier.filename
                }`,
              type: mediaType,
              filename: fileData.identifier.filename,
              likes: file.likes,
              disLikes: file.disLikes,
              of_post: file.of_post,
              owner: file.owner,
              _id: file._id,
            };
          })
          .filter(Boolean);

        return {
          ...post.toObject(),
          media: mediaUrls,
          owner: {
            ...post.owner.toObject(),
            image: post.owner.image?.data
              ? `data:image/png;base64,${post.owner.image.data.toString(
                "base64"
              )}`
              : null,
          },
        };
      });

      res.json({ data: updatedPosts, hasMore });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  },
  getUserPosts: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.query.user;
    console.log(userId);

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      // Fetch filtered posts
      const posts = await post
        .find({ owner: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("owner")
        .populate("likes")
        .populate("disLikes")
        .populate({
          path: "media",
          populate: [{ path: "likes" }, { path: "disLikes" }],
        });

      const total = await post.countDocuments({ owner: userId });
      const hasMore = skip + posts.length < total;

      const updatedPosts = posts.map((post) => {
        const mediaUrls = post.media
          .map((file) => {
            const fileData = file.toObject();
            const fileExt = fileData.identifier.filename
              .split(".")
              .pop()
              ?.toLowerCase();
            const mediaType = ["mp4", "webm", "mov"].includes(fileExt)
              ? "video"
              : "image";
            const ownerId =
              post.owner?._id?.toString() || post.owner?.toString();

            if (!ownerId) {
              console.error("Missing owner ID for post:", post._id);
              return null;
            }

            return {
              url: `${req.protocol}://${req.get("host")}/uploads/${ownerId}/${fileData.identifier.filename
                }`,
              type: mediaType,
              filename: fileData.identifier.filename,
              likes: file.likes,
              disLikes: file.disLikes,
              of_post: file.of_post,
              owner: file.owner,
              _id: file._id,
            };
          })
          .filter(Boolean);

        return {
          ...post.toObject(),
          media: mediaUrls,
          owner: {
            ...post.owner.toObject(),
            image: post.owner.image?.data
              ? `data:image/png;base64,${post.owner.image.data.toString(
                "base64"
              )}`
              : null,
          },
        };
      });

      res.json({ data: updatedPosts, hasMore });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  },
  getSingPost: async (req, res) => {
    const postId = req.query.post;

    try {
      const sngpost = await post
        .findOne({ _id: postId })
        .populate("owner")
        .populate("likes")
        .populate("disLikes")
        .populate({
          path: "media",
          populate: [{ path: "likes" }, { path: "disLikes" }],
        });

      if (!sngpost) {
        return res.status(404).send({ error: "Post not found" });
      }

      const mediaUrls = sngpost.media
        .map((file) => {
          const fileData = file.toObject();
          const fileExt = fileData.identifier.filename
            .split(".")
            .pop()
            ?.toLowerCase();
          const mediaType = ["mp4", "webm", "mov"].includes(fileExt)
            ? "video"
            : "image";
          const ownerId =
            sngpost.owner?._id?.toString() || sngpost.owner?.toString();

          if (!ownerId) {
            console.error("Missing owner ID for post:", sngpost._id);
            return null;
          }

          return {
            url: `${req.protocol}://${req.get("host")}/uploads/${ownerId}/${fileData.identifier.filename
              }`,
            type: mediaType,
            filename: fileData.identifier.filename,
            likes: file.likes,
            disLikes: file.disLikes,
            of_post: file.of_post,
            owner: file.owner,
            _id: file._id,
          };
        })
        .filter(Boolean);

      const updatedPost = {
        ...sngpost.toObject(),
        media: mediaUrls,
        owner: {
          ...sngpost.owner.toObject(),
          image: sngpost.owner.image?.data
            ? `data:image/png;base64,${sngpost.owner.image.data.toString(
              "base64"
            )}`
            : null,
        },
      };

      res.send(updatedPost);
    } catch (error) {
      console.error("Error fetching single post:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  },
  delPost: async (req, res) => {
    // console.log(req.query)
    const { postId } = req.query;

    const userjwt = req.cookies.authToken;
    const userDets = checkUser(userjwt);
    // console.log(userDets)
    try {
      const commentIds = await comment.distinct("_id", { for_post: postId });

      await deleteCommentsRecursively(commentIds);

      // remove likes and dislikes
      await like.deleteMany({ for_post: postId });
      await disLike.deleteMany({ for_post: postId });
      // remove post model
      await post.deleteOne({ _id: postId });
      await user.updateOne({ _id: userDets.id }, { $pull: { posts: postId } });
      res.send("post deleted");
    } catch (error) {
      res.send(error);
    }
  },

  likePost: async (req, res) => {
    const post_id = req.body.postId;
    const user_token = req.cookies;

    try {
      const user_detail = checkUser(user_token.authToken);
      const owner_id = user_detail.id;
      const data = {
        for_post: post_id,
        owner: owner_id,
      };
      const dis_liked_remove = await disLike.findOneAndDelete({
        $and: [{ for_post: post_id }, { owner: owner_id }],
      });

      if (dis_liked_remove) {
        await user.updateOne(
          { _id: owner_id },
          { $pull: { disLikes: dis_liked_remove._id } }
        );
        await post.updateOne(
          { _id: post_id },
          { $pull: { disLikes: dis_liked_remove._id } }
        );
      }
      const liked = await like.create(data);
      // console.log(liked)
      if (liked) {
        await user.updateOne(
          { _id: owner_id },
          { $push: { likes: liked._id } }
        );
        await post.updateOne({ _id: post_id }, { $push: { likes: liked._id } });
        res.status(200).send(liked);
      }
    } catch (error) {
      res.send(error);
    }
  },
  unLikePost: async (req, res) => {
    const post_id = req.body.postId;
    const user_token = req.cookies;

    try {
      const user_detail = checkUser(user_token.authToken);
      const owner_id = user_detail.id;
      const data = {
        for_post: post_id,
        owner: owner_id,
      };
      const like_removed = await like.findOneAndDelete({
        $and: [{ for_post: post_id }, { owner: owner_id }],
      });

      if (like_removed) {
        await user.updateOne(
          { _id: owner_id },
          { $pull: { likes: like_removed._id } }
        );
        await post.updateOne(
          { _id: post_id },
          { $pull: { likes: like_removed._id } }
        );
        res.send(like_removed);
      }
    } catch (error) {
      res.send(error);
    }
  },
  disLikePost: async (req, res) => {
    const post_id = req.body.postId;
    const user_token = req.cookies;

    try {
      const user_detail = checkUser(user_token.authToken);
      const owner_id = user_detail.id;
      const data = {
        for_post: post_id,
        owner: owner_id,
      };

      const un_liked = await like.findOneAndDelete({
        $and: [{ for_post: post_id }, { owner: owner_id }],
      });
      if (un_liked) {
        await user.updateOne(
          { _id: owner_id },
          { $pull: { likes: un_liked._id } }
        );
        await post.updateOne(
          { _id: post_id },
          { $pull: { likes: un_liked._id } }
        );
        // create record for un_liked
      }
      const disLiked = await disLike.create(data);
      if (disLiked) {
        await user.updateOne(
          { _id: owner_id },
          { $push: { disLikes: disLiked._id } }
        );
        await post.updateOne(
          { _id: post_id },
          { $push: { disLikes: disLiked._id } }
        );
        res.status(200).send(data);
      }
    } catch (error) {
      res.send(error);
    }
  },
  unDisLikePost: async (req, res) => {
    const post_id = req.body.postId;
    const user_token = req.cookies;

    try {
      const user_detail = checkUser(user_token.authToken);
      const owner_id = user_detail.id;
      const data = {
        for_post: post_id,
        owner: owner_id,
      };

      const dis_like_removed = await disLike.findOneAndDelete({
        $and: [{ for_post: post_id }, { owner: owner_id }],
      });

      if (dis_like_removed) {
        await user.updateOne(
          { _id: owner_id },
          { $pull: { disLikes: dis_like_removed._id } }
        );
        await post.updateOne(
          { _id: post_id },
          { $pull: { disLikes: dis_like_removed._id } }
        );
        res.send(dis_like_removed);
      }
    } catch (error) {
      res.send(error);
    }
  },

  likeMedia: async (req, res) => {
    const post_id = req.body.postId;
    const user_token = req.cookies;
    // console.log(post_id)
    try {
      const user_detail = checkUser(user_token.authToken);
      const owner_id = user_detail.id;
      const data = {
        for_post: post_id,
        owner: owner_id,
      };
      const dis_liked_remove = await disLike.findOneAndDelete({
        $and: [{ for_post: post_id }, { owner: owner_id }],
      });

      if (dis_liked_remove) {
        await user.updateOne(
          { _id: owner_id },
          { $pull: { disLikes: dis_liked_remove._id } }
        );
        await media.updateOne(
          { _id: post_id },
          { $pull: { disLikes: dis_liked_remove._id } }
        );
      }
      const liked = await like.create(data);
      // console.log(liked)
      if (liked) {
        await user.updateOne(
          { _id: owner_id },
          { $push: { likes: liked._id } }
        );
        await media.updateOne(
          { _id: post_id },
          { $push: { likes: liked._id } }
        );
        res.status(200).send(liked);
      }
    } catch (error) {
      res.send(error);
    }
  },
  unLikeMedia: async (req, res) => {
    const post_id = req.body.postId;
    const user_token = req.cookies;

    try {
      const user_detail = checkUser(user_token.authToken);
      const owner_id = user_detail.id;
      const data = {
        for_post: post_id,
        owner: owner_id,
      };
      const like_removed = await like.findOneAndDelete({
        $and: [{ for_post: post_id }, { owner: owner_id }],
      });

      if (like_removed) {
        await user.updateOne(
          { _id: owner_id },
          { $pull: { likes: like_removed._id } }
        );
        await media.updateOne(
          { _id: post_id },
          { $pull: { likes: like_removed._id } }
        );
        res.send(like_removed);
      }
    } catch (error) {
      res.send(error);
    }
  },
  disLikeMedia: async (req, res) => {
    const post_id = req.body.postId;
    const user_token = req.cookies;

    try {
      const user_detail = checkUser(user_token.authToken);
      const owner_id = user_detail.id;
      const data = {
        for_post: post_id,
        owner: owner_id,
      };

      const un_liked = await like.findOneAndDelete({
        $and: [{ for_post: post_id }, { owner: owner_id }],
      });
      if (un_liked) {
        await user.updateOne(
          { _id: owner_id },
          { $pull: { likes: un_liked._id } }
        );
        await media.updateOne(
          { _id: post_id },
          { $pull: { likes: un_liked._id } }
        );
        // create record for un_liked
      }
      const disLiked = await disLike.create(data);
      if (disLiked) {
        await user.updateOne(
          { _id: owner_id },
          { $push: { disLikes: disLiked._id } }
        );
        await media.updateOne(
          { _id: post_id },
          { $push: { disLikes: disLiked._id } }
        );
        res.status(200).send(data);
      }
    } catch (error) {
      res.send(error);
    }
  },
  unDisLikeMedia: async (req, res) => {
    const post_id = req.body.postId;
    const user_token = req.cookies;

    try {
      const user_detail = checkUser(user_token.authToken);
      const owner_id = user_detail.id;
      const data = {
        for_post: post_id,
        owner: owner_id,
      };

      const dis_like_removed = await disLike.findOneAndDelete({
        $and: [{ for_post: post_id }, { owner: owner_id }],
      });

      if (dis_like_removed) {
        await user.updateOne(
          { _id: owner_id },
          { $pull: { disLikes: dis_like_removed._id } }
        );
        await media.updateOne(
          { _id: post_id },
          { $pull: { disLikes: dis_like_removed._id } }
        );
        res.send(dis_like_removed);
      }
    } catch (error) {
      res.send(error);
    }
  },

  addComment: async (req, res) => {
    try {
      const { owner, content, for_post } = req.body;
      const ownerId = new mongoose.Types.ObjectId(owner);
      const isBad = await detectOffensiveText(content);
      if (isBad) {
        return res.status(400).json({
          success: false,
          error: "Post contains prohibited language",
          timestamp: new Date().toISOString(),
        });
      }

      const files = [];

      for (const filename of req.fileNames || []) {
        const filePath = `./uploads/${owner}/${filename}`;

        const ext = path.extname(filename);
        const type = [".mp4", ".webm", ".MOV"].includes(ext)
          ? "video"
          : "image";

        files.push({
          filename: filename.toString(),
          type: type.toString(),
          path: `/uploads/${owner}/${filename}`,
        });
      }

      // Create comment data
      const commentData = {
        comment: content,
        for_post,
        owner: ownerId,
        likes: [],
        disLikes: [],
        comments: [],
      };

      // Create the comment
      const newComment = await comment.create(commentData);

      if (!newComment) {
        return res.status(500).json({ error: "Failed to create comment" });
      }

      // Handle media files if they exist
      if (files.length > 0) {
        const mediaDocs = await Promise.all(
          files.map((file) => {
            const mediaDoc = new media({
              identifier: {
                filename: file.filename,
                type: file.type,
                path: file.path,
              },
              owner: ownerId,
              of_comment: newComment._id,
              likes: [],
              disLikes: [],
            });
            return mediaDoc.save();
          })
        );

        const mediaIds = mediaDocs.map((doc) => doc._id);
        await comment.updateOne(
          { _id: newComment._id },
          { $push: { media: { $each: mediaIds } } }
        );
      }

      // Update post & user models
      await post.updateOne(
        { _id: for_post },
        { $push: { comments: newComment._id } }
      );
      await user.updateOne(
        { _id: ownerId },
        { $push: { comments: newComment._id } }
      );

      // Fetch and return populated comment
      const populatedComment = await comment
        .findOne({ _id: newComment._id })
        .populate("owner")
        .populate("likes")
        .populate("disLikes")
        .populate({
          path: "media",
          populate: [{ path: "likes" }, { path: "disLikes" }],
        });

      if (!populatedComment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Format the response
      const formattedMedia = populatedComment.media
        .map((file) => {
          const fileData = file.toObject();
          const fileExt = fileData.identifier.filename
            .split(".")
            .pop()
            ?.toLowerCase();
          const mediaType = ["mp4", "webm", "mov"].includes(fileExt)
            ? "video"
            : "image";
          const ownerId =
            populatedComment.owner?._id?.toString() ||
            populatedComment.owner?.toString();

          if (!ownerId) {
            console.error(
              "Missing owner ID for comment:",
              populatedComment._id
            );
            return null;
          }

          return {
            url: `${req.protocol}://${req.get("host")}/uploads/${ownerId}/${fileData.identifier.filename
              }`,
            type: mediaType,
            filename: fileData.identifier.filename,
            likes: file.likes,
            disLikes: file.disLikes,
            of_comment: file.of_comment,
            owner: file.owner,
            _id: file._id,
          };
        })
        .filter(Boolean);

      const formattedComment = {
        ...populatedComment.toObject(),
        media: formattedMedia,
        owner: {
          ...populatedComment.owner.toObject(),
          image: populatedComment.owner.image?.data
            ? `data:image/png;base64,${populatedComment.owner.image.data.toString(
              "base64"
            )}`
            : null,
        },
      };

      res.status(200).send(formattedComment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },

  updateComment: async (req, res) => {
    try {
      const { content, owner } = req.body;
      const commentId = req.params.id;
      const ownerId = new mongoose.Types.ObjectId(owner);
      const isBad = await detectOffensiveText(content);
      if (isBad) {
        return res.status(400).json({
          success: false,
          error: "Post contains prohibited language",
          timestamp: new Date().toISOString(),
        });
      }

      // 3. Handle file updates (works for both comments and replies)
      let existingFiles = req.body.existingFiles;
      if (!existingFiles) existingFiles = [];
      else if (!Array.isArray(existingFiles)) existingFiles = [existingFiles];

      const existingFilenames = existingFiles.map((url) =>
        url.split("/").pop()
      );

      // Get current comment/reply with media
      const existingComment = await comment
        .findById(commentId)
        .populate("media");
      if (!existingComment) {
        return res.status(404).json({ error: "Comment/Reply not found" });
      }

      // Media to delete = not in existingFilenames
      const mediaToDelete = existingComment.media.filter(
        (file) => !existingFilenames.includes(file.identifier.filename)
      );

      // Delete media from DB and filesystem
      for (const mediaDoc of mediaToDelete) {
        await media.findByIdAndDelete(mediaDoc._id);
        const filePath = path.join(
          __dirname,
          `../public/uploads/comments/${mediaDoc.identifier.filename}`
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Save new uploaded files
      const newFileDocs = await Promise.all(
        (req.fileNames || []).map((file) => {
          // console.log(file)
          const ext = path.extname(file).toLowerCase();
          const type = [".mp4", ".webm", ".mov"].includes(ext)
            ? "video"
            : "image";

          const newMedia = new media({
            identifier: {
              filename: file,
              type,
              path: `/uploads/comments/${file}`,
            },
            owner: ownerId,
            of_comment: commentId,
            likes: [],
            disLikes: [],
          });

          return newMedia.save();
        })
      );

      // Combine retained and new media
      const retainedMedia = existingComment.media.filter((file) =>
        existingFilenames.includes(file.identifier.filename)
      );

      const updatedMediaIds = [
        ...retainedMedia.map((m) => m._id),
        ...newFileDocs.map((m) => m._id),
      ];

      // Update the comment/reply
      await comment.findByIdAndUpdate(commentId, {
        comment: content,
        updatedAt: new Date().toISOString(),
        media: updatedMediaIds,
      });

      // Fetch updated comment/reply with populated data
      const updatedComment = await comment
        .findById(commentId)
        .populate("owner")
        .populate("likes")
        .populate("disLikes")
        .populate({
          path: "media",
          populate: [{ path: "likes" }, { path: "disLikes" }],
        });

      // Format media URLs
      const formattedMedia = updatedComment.media.map((file) => {
        const ext = path.extname(file.identifier.filename).toLowerCase();
        const mediaType = [".mp4", ".webm", ".mov"].includes(ext)
          ? "video"
          : "image";
        const ownerId =
          updatedComment.owner?._id?.toString() ||
          updatedComment.owner?.toString();

        return {
          url: `${req.protocol}://${req.get("host")}/uploads/${ownerId}/${file.identifier.filename
            }`,
          type: mediaType,
          filename: file.identifier.filename,
          likes: file.likes,
          disLikes: file.disLikes,
          of_comment: file.of_comment,
          owner: file.owner,
          _id: file._id,
        };
      });

      // Prepare final response
      const formattedComment = {
        ...updatedComment.toObject(),
        media: formattedMedia,
        owner: {
          ...updatedComment.owner.toObject(),
          image: updatedComment.owner.image?.data
            ? `data:image/png;base64,${updatedComment.owner.image.data.toString(
              "base64"
            )}`
            : null,
        },
      };

      res.status(200).json(formattedComment);
    } catch (error) {
      console.error("Error updating comment/reply:", error);
      res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },

  delComment: async (req, res) => {
    const { commentId } = req.query;
    // console.log(commentId)
    const userjwt = req.cookies.authToken;
    const userDets = checkUser(userjwt);

    try {
      const commentIds = await comment.distinct("_id", { for_post: commentId });

      await deleteCommentsRecursively(commentIds);

      // remove likes and dislikes
      await like.deleteMany({ for_post: commentId });
      await disLike.deleteMany({ for_post: commentId });
      // remove post model
      await comment.deleteOne({ _id: commentId });
      await comment.updateOne(
        { comments: commentId },
        { $pull: { comments: commentId } }
      );
      await user.updateOne(
        { _id: userDets.id },
        { $pull: { posts: commentId } }
      );
      res.send("post deleted");
    } catch (error) {
      res.send(error);
    }
  },

  getComments: async (req, res) => {
    const postId = req.query.post;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    console.log(page, limit, skip);

    try {
      const comments = await comment
        .find({ for_post: postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("owner")
        .populate("likes")
        .populate("disLikes")
        .populate({
          path: "media",
          populate: [{ path: "likes" }, { path: "disLikes" }],
        });

      const updatedComments = comments.map((comment) => {
        const mediaUrls = comment.media
          .map((file) => {
            const fileData = file.toObject();
            const fileExt = fileData.identifier.filename
              .split(".")
              .pop()
              ?.toLowerCase();
            const mediaType = ["mp4", "webm", "mov"].includes(fileExt)
              ? "video"
              : "image";
            const ownerId =
              comment.owner?._id?.toString() || comment.owner?.toString();

            if (!ownerId) {
              console.error("Missing owner ID for comment:", comment._id);
              return null;
            }

            return {
              url: `${req.protocol}://${req.get("host")}/uploads/${ownerId}/${fileData.identifier.filename
                }`,
              type: mediaType,
              filename: fileData.identifier.filename,
              likes: file.likes,
              disLikes: file.disLikes,
              of_comment: file.of_comment,
              owner: file.owner,
              _id: file._id,
            };
          })
          .filter(Boolean);

        return {
          ...comment.toObject(),
          media: mediaUrls,
          owner: {
            ...comment.owner?.toObject(),
            image: comment.owner?.image?.data
              ? `data:image/png;base64,${comment.owner?.image?.data.toString(
                "base64"
              )}`
              : null,
          },
        };
      });

      const total = await comment.countDocuments({ for_post: postId });
      const hasMore = skip + comments.length < total;

      res.status(200).json({ data: updatedComments, hasMore });
    } catch (error) {
      res.send(error);
    }
  },

  likeComment: async (req, res) => {
    const comntId = req.body.comntId;
    const user_token = req.cookies;
    // console.log(comntId)

    try {
      const user_detail = checkUser(user_token.authToken);
      // console.log(user_detail)
      const owner_id = user_detail.id;
      const data = {
        for_post: comntId,
        owner: owner_id,
      };
      const dis_liked_remove = await disLike.findOneAndDelete({
        $and: [{ for_post: comntId }, { owner: owner_id }],
      });

      if (dis_liked_remove) {
        await user.updateOne(
          { _id: owner_id },
          { $pull: { disLikes: dis_liked_remove._id } }
        );
        await comment.updateOne(
          { _id: comntId },
          { $pull: { disLikes: dis_liked_remove._id } }
        );
      }
      const liked = await like.create(data);
      // console.log(liked)
      if (liked) {
        await user.updateOne(
          { _id: owner_id },
          { $push: { likes: liked._id } }
        );
        await comment.updateOne(
          { _id: comntId },
          { $push: { likes: liked._id } }
        );
        res.status(200).send(liked);
      }
    } catch (error) {
      res.send(error);
    }
  },
  unLikeComment: async (req, res) => {
    const comntId = req.body.comntId;
    const user_token = req.cookies;

    try {
      const user_detail = checkUser(user_token.authToken);
      const owner_id = user_detail.id;
      const data = {
        for_post: comntId,
        owner: owner_id,
      };
      const like_removed = await like.findOneAndDelete({
        $and: [{ for_post: comntId }, { owner: owner_id }],
      });
      // console.log(like_removed)
      if (like_removed) {
        await user.updateOne(
          { _id: owner_id },
          { $pull: { likes: like_removed._id } }
        );
        await comment.updateOne(
          { _id: comntId },
          { $pull: { likes: like_removed._id } }
        );
        res.send(like_removed);
      }
    } catch (error) {
      res.send(error);
    }
  },
  disLikeComment: async (req, res) => {
    const comntId = req.body.comntId;
    const user_token = req.cookies;

    try {
      const user_detail = checkUser(user_token.authToken);
      const owner_id = user_detail.id;
      const data = {
        for_post: comntId,
        owner: owner_id,
      };

      const un_liked = await like.findOneAndDelete({
        $and: [{ for_post: comntId }, { owner: owner_id }],
      });
      if (un_liked) {
        await user.updateOne(
          { _id: owner_id },
          { $pull: { likes: un_liked._id } }
        );
        await post.updateOne(
          { _id: comntId },
          { $pull: { likes: un_liked._id } }
        );
      }
      const disLiked = await disLike.create(data);
      // console.log(disLiked)
      if (disLiked) {
        await user.updateOne(
          { _id: owner_id },
          { $push: { disLikes: disLiked._id } }
        );
        await comment.updateOne(
          { _id: comntId },
          { $push: { disLikes: disLiked._id } }
        );
        res.status(200).send(data);
      }
    } catch (error) {
      res.send(error);
    }
  },
  unDisLikeComment: async (req, res) => {
    const comntId = req.body.comntId;
    const user_token = req.cookies;

    try {
      const user_detail = checkUser(user_token.authToken);
      const owner_id = user_detail.id;
      const data = {
        for_post: comntId,
        owner: owner_id,
      };

      const dis_like_removed = await disLike.findOneAndDelete({
        $and: [{ for_post: comntId }, { owner: owner_id }],
      });
      // console.log(dis_like_removed)
      if (dis_like_removed) {
        await user.updateOne(
          { _id: owner_id },
          { $pull: { disLikes: dis_like_removed._id } }
        );
        await comment.updateOne(
          { _id: comntId },
          { $pull: { disLikes: dis_like_removed._id } }
        );
        res.send(dis_like_removed);
      }
    } catch (error) {
      res.send(error);
    }
  },

  addReply: async (req, res) => {
    try {
      const { owner, content, for_post } = req.body;
      const ownerId = new mongoose.Types.ObjectId(owner);
      const isBad = await detectOffensiveText(content);
      if (isBad) {
        return res.status(400).json({
          success: false,
          error: "Post contains prohibited language",
          timestamp: new Date().toISOString(),
        });
      }
      const fileNames =
        req.fileNames?.map((file) => {
          // console.log(file)
          const ext = path.extname(file);
          const type = [".mp4", ".webm", ".MOV"].includes(ext)
            ? "video"
            : "image";
          return {
            filename: file.toString(),
            type,
            path: `/uploads/comments/${file}`,
          };
        }) || []; // Added fallback for empty files array

      // Create comment data (excluding media initially)
      const commentData = {
        comment: content,
        for_post,
        owner: ownerId,
        likes: [],
        disLikes: [],
        comments: [],
      };

      // Create the comment first
      const newComment = await comment.create(commentData);
      // console.log(commentData, "backend console data");

      if (!newComment) {
        return res.status(500).json({ error: "Failed to create reply" });
      }

      // Store media files separately if they exist
      if (fileNames.length > 0) {
        const mediaDocs = await Promise.all(
          fileNames.map((file) => {
            const mediaDoc = new media({
              identifier: {
                filename: file.filename,
                type: file.type,
                path: file.path,
              },
              owner: ownerId,
              of_comment: newComment._id,
              likes: [],
              disLikes: [],
            });
            return mediaDoc.save();
          })
        );

        // Associate media with comment
        const mediaIds = mediaDocs.map((doc) => doc._id);
        await comment.updateOne(
          { _id: newComment._id },
          { $push: { media: { $each: mediaIds } } }
        );
      }

      // Update parent comment & user models
      await comment.updateOne(
        { _id: for_post },
        { $push: { comments: newComment._id } }
      );
      await user.updateOne(
        { _id: ownerId },
        { $push: { comments: newComment._id } }
      );

      // Fetch and return populated comment
      const populatedComment = await comment
        .findOne({ _id: newComment._id })
        .populate("owner")
        .populate("likes")
        .populate("disLikes")
        .populate({
          path: "media",
          populate: [{ path: "likes" }, { path: "disLikes" }],
        });

      if (!populatedComment) {
        return res.status(404).json({ error: "Reply not found" });
      }

      const formattedMedia = populatedComment.media
        .map((file) => {
          const fileData = file.toObject();
          const fileExt = fileData.identifier.filename
            .split(".")
            .pop()
            ?.toLowerCase();
          const mediaType = ["mp4", "webm", "mov"].includes(fileExt)
            ? "video"
            : "image";
          const ownerId =
            populatedComment.owner?._id?.toString() ||
            populatedComment.owner?.toString();

          if (!ownerId) {
            console.error("Missing owner ID for reply:", populatedComment._id);
            return null;
          }

          return {
            url: `${req.protocol}://${req.get("host")}/uploads/${ownerId}/${fileData.identifier.filename
              }`,
            type: mediaType,
            filename: fileData.identifier.filename,
            likes: file.likes,
            disLikes: file.disLikes,
            of_comment: file.of_comment,
            owner: file.owner,
            _id: file._id,
          };
        })
        .filter(Boolean);

      const formattedComment = {
        ...populatedComment.toObject(),
        media: formattedMedia,
        owner: {
          ...populatedComment.owner.toObject(),
          image: populatedComment.owner.image?.data
            ? `data:image/png;base64,${populatedComment.owner.image.data.toString(
              "base64"
            )}`
            : null,
        },
      };

      res.status(200).send(formattedComment);
    } catch (error) {
      console.error("Error adding reply:", error);
      res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },
  getReplies: async (req, res) => {
    const comntId = req.query.comment;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    try {
      const comments = await comment
        .find({ for_post: comntId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("owner")
        .populate("likes")
        .populate("disLikes")
        .populate({
          path: "media",
          populate: [{ path: "likes" }, { path: "disLikes" }],
        });

      const updatedComments = comments.map((comment) => {
        const mediaUrls = comment.media
          .map((file) => {
            const fileData = file.toObject();
            const fileExt = fileData.identifier.filename
              .split(".")
              .pop()
              ?.toLowerCase();
            const mediaType = ["mp4", "webm", "mov"].includes(fileExt)
              ? "video"
              : "image";
            const ownerId =
              comment.owner?._id?.toString() || comment.owner?.toString();

            if (!ownerId) {
              console.error("Missing owner ID for comment:", comment._id);
              return null;
            }

            return {
              url: `${req.protocol}://${req.get("host")}/uploads/${ownerId}/${fileData.identifier.filename
                }`,
              type: mediaType,
              filename: fileData.identifier.filename,
              likes: file.likes,
              disLikes: file.disLikes,
              of_comment: file.of_comment,
              owner: file.owner,
              _id: file._id,
            };
          })
          .filter(Boolean);

        return {
          ...comment.toObject(),
          media: mediaUrls,
          owner: {
            ...comment.owner?.toObject(),
            image: comment.owner?.image?.data
              ? `data:image/png;base64,${comment.owner?.image?.data.toString(
                "base64"
              )}`
              : null,
          },
        };
      });

      res.send(updatedComments);
    } catch (error) {
      res.send(error);
    }
  },
  analyzePost: async (req, res) => {
    // console.log("first")
    const { postId } = req.query;
    // console.log(postId)

    const pst = await post
      .findOne({ _id: postId })
      .select("description likes disLikes comments media")
      .populate("media")
      .populate("likes")
      .populate("disLikes")
      .populate("comments");
    // console.log(pst)
    const likes = pst.likes.length;
    const disLikes = pst.disLikes.length;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const monthlyEngagements = Object.fromEntries(monthNames.map(name => [name, 0]));

    [...pst.likes, ...pst.disLikes, ...pst.comments].forEach(item => {
      const monthIndex = new Date(item.createdAt).getMonth();
      const monthName = monthNames[monthIndex];
      monthlyEngagements[monthName]++;
    });

    const comments_to_analyze = pst.comments.map((comment) => comment.comment);
    // console.log(comments_to_analyze);

    try {
      const results = await Promise.all(
        comments_to_analyze.map(comment => analyzeSentiment(comment))
      );

      // results.forEach((res, i) => {
      //   if(res.compound < 0) {
      //     console.log("Comment is negative:", comments_to_analyze[i]);
      //   }else{
      //     console.log("Comment is positive:", comments_to_analyze[i]);
      //   }
      // });

      const negativeComments = results.filter(res => res.compound < 0).length;
      const positiveComments = results.filter(res => res.compound >= 0).length;
      const sentimentAnalysis = {
        totalComments: comments_to_analyze.length,
        positiveComments,
        negativeComments,
        likes,
        disLikes,
        monthlyEngagements
      };

      res.send(sentimentAnalysis);
    } catch (error) {
      console.error("Error analyzing post:", error);
      res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }

  },
};

module.exports = postController;
