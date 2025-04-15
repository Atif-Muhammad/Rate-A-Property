const express = require("express");
const postController = require("../../controllers/postController");
const authenticateUsers = require("../../middlewares/authenticateUser");
const { upload_disk } = require("../../multerConfig/multerConfig");
const router = express.Router();

// router.post("/createPost", authenticateUsers, postController.createPost)
router.post(
  "/createPost",
  upload_disk.array("files"),
  postController.createPost
);

router.put("/updatePost/:id", upload_disk.array("files"), postController.updatePost);

router.get("/getPosts", postController.getPosts);
router.get("/getSinglePost", postController.getSingPost);

router.post("/delPost", postController.delPost);

router.put("/likePost", postController.likePost);
router.put("/unLikePost", postController.unLikePost);
router.put("/disLikePost", postController.disLikePost);
router.put("/unDisLikePost", postController.unDisLikePost);

router.put("/likeMedia", postController.likeMedia);
router.put("/unLikeMedia", postController.unLikeMedia);
router.put("/disLikeMedia", postController.disLikeMedia);
router.put("/unDisLikeMedia", postController.unDisLikeMedia);

router.post("/addComment", upload_disk.array("files"), postController.addComment);
router.post("/delComment", postController.delComment);
router.get("/getComments", postController.getComments);

router.put("/likeComment", postController.likeComment);
router.put("/unLikeComment", postController.unLikeComment);
router.put("/disLikeComment", postController.disLikeComment);
router.put("/unDisLikeComment", postController.unDisLikeComment);

router.post("/addReply", upload_disk.array("files"),postController.addReply);
router.get("/getReplies", postController.getReplies);

module.exports = router;
