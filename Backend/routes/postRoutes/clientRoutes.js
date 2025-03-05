const express = require("express");
const postController = require("../../controllers/postController");
const authenticateUsers = require("../../middlewares/authenticateUser");
const router = express.Router()


// router.post("/createPost", authenticateUsers, postController.createPost)
router.post("/createPost", postController.createPost);
router.get("/getPosts", postController.getPosts);
router.get("/getSinglePost", postController.getSingPost);
router.put("/likePost", postController.likePost);
router.put("/unLikePost", postController.unLikePost);
router.put("/disLikePost", postController.disLikePost);
router.put("/unDisLikePost", postController.unDisLikePost);



module.exports = router;