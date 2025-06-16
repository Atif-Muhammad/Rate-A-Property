const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const { upload_memory } = require("../../multerConfig/multerConfig");
const checkUser = require("../../controllers/checkUser");
const messageController = require("../../controllers/messageController");
const { getNotifications, createNotification } = require("../../controllers/notificationsController");

router.post(
  "/signup",
  upload_memory.single("image"),
  userController.createUser
);

router.post("/signin", userController.loginUser);

router.post("/logout", userController.logoutUser);

router.get("/userWho", userController.userWho);
router.get("/getUser", userController.getUser);
router.put("/followUser", userController.followUser);
router.put("/unfollowUser", userController.unfollowUser);

router.get("/getFriends/:userId", userController.getFriends)

router.get("/search/:data", userController.search)

router.post("/getMsgs", messageController.getMsgs)

router.get("/getChats", messageController.getChats)

router.post("/createNoti", createNotification)

router.get("/getNotis/:userId", getNotifications)

module.exports = router;
