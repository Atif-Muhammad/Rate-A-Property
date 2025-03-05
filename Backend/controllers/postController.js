const user = require("../models/userModel")
const post = require("../models/postModel")
const like = require("../models/likesModel")
const disLike = require("../models/disLikeModel") 
const checkUser  = require("./checkUser");
// const {gfs} = require("../app")

const postController = {
    createPost: async (req, res)=>{
        const {owner, location, description} = req.body;
        try {
            const data = {
                owner,
                location,
                description
            }
            const created_post = await post.create(data);
            if(created_post){
                // update user
                await user.updateOne({_id: owner}, {$push: {posts: created_post._id}});
                return res.status(200).send("Post Created.")
            }else{
                return res.sendStatus(408)
            }        
        } catch (error) {
            res.send(error);
        }
    },
    getPosts: async (req, res)=>{
        try {
            const posts = await post.find({}).populate("owner").populate("likes").populate("disLikes");
            res.send(posts);
        } catch (error) {
            res.send(error);
        }
    },
    getSingPost: async (req, res)=>{
        const postId = req.query.post
        // console.log(postId)
        try {
            const post = await post.find({_id: postId}).populate("owner").populate("likes").populate("disLikes");
            res.send(post)
        } catch (error) {
            res.send(error);
        }
    },
    likePost: async (req, res)=>{
        const post_id = req.body.postId;
        const user_token = req.cookies;
       
        try {
            const user_detail = checkUser(user_token.jwtToken);
            const owner_id = user_detail.id;
            const data = {
                for_post: post_id,
                owner: owner_id
            }
            const dis_liked_remove = await disLike.findOneAndDelete({$and : [{for_post: post_id}, {owner: owner_id}] });
            
            if(dis_liked_remove){
                await user.updateOne({_id: owner_id}, {$pull: {disLikes: dis_liked_remove._id}});
                await post.updateOne({_id: post_id}, {$pull: {disLikes: dis_liked_remove._id}});   
            }
            const liked = await like.create(data);
            // console.log(liked)
            if(liked){
                await user.updateOne({_id: owner_id}, {$push: {likes: liked._id}});
                await post.updateOne({_id: post_id}, {$push: {likes: liked._id}});
                res.status(200).send(liked)
            }
        } catch (error) {
            res.send(error);
        }
    },
    unLikePost: async (req, res)=>{
        const post_id = req.body.postId;
        const user_token = req.cookies;
       
        try {
            const user_detail = checkUser(user_token.jwtToken);
            const owner_id = user_detail.id;
            const data = {
                for_post: post_id,
                owner: owner_id
            }
            const like_removed = await like.findOneAndDelete({$and : [{for_post: post_id}, {owner: owner_id}] });
            
            if(like_removed){
                await user.updateOne({_id: owner_id}, {$pull: {likes: like_removed._id}});
                await post.updateOne({_id: post_id}, {$pull: {likes: like_removed._id}});   
                res.send(like_removed)
            }

            
        } catch (error) {
            res.send(error);
        }
    },
    disLikePost: async (req, res)=>{
        const post_id = req.body.postId;
        const user_token = req.cookies;
        
        try {
            const user_detail = checkUser(user_token.jwtToken);
            const owner_id = user_detail.id;
            const data = {
                for_post: post_id,
                owner: owner_id
            }

            const un_liked = await like.findOneAndDelete({$and : [{for_post: post_id}, {owner: owner_id}] });
            if(un_liked){
                await user.updateOne({_id: owner_id}, {$pull: {likes: un_liked._id}});
                await post.updateOne({_id: post_id}, {$pull: {likes: un_liked._id}});
                // create record for un_liked
            }
            const disLiked = await disLike.create(data);
            if(disLiked){
                await user.updateOne({_id: owner_id}, {$push: {disLikes: disLiked._id}});
                await post.updateOne({_id: post_id}, {$push: {disLikes: disLiked._id}});
                res.status(200).send(data)
            }
            
        } catch (error) {
            res.send(error);
        }
    },
    unDisLikePost: async (req, res)=>{
        const post_id = req.body.postId;
        const user_token = req.cookies;
        
        try {
            const user_detail = checkUser(user_token.jwtToken);
            const owner_id = user_detail.id;
            const data = {
                for_post: post_id,
                owner: owner_id
            }

            const dis_like_removed = await disLike.findOneAndDelete({$and : [{for_post: post_id}, {owner: owner_id}] });
            
            if(dis_like_removed){
                await user.updateOne({_id: owner_id}, {$pull: {disLikes: dis_like_removed._id}});
                await post.updateOne({_id: post_id}, {$pull: {disLikes: dis_like_removed._id}});   
                res.send(dis_like_removed)
            }
            
            
        } catch (error) {
            res.send(error);
        }
    }
}

module.exports = postController;