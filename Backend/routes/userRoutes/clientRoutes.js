const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const { upload_memory } = require("../../multerConfig/multerConfig");
const checkUser = require("../../controllers/checkUser");

router.post(
  "/signup",
  upload_memory.single("image"),
  userController.createUser
);

router.post("/signin", userController.loginUser);

router.post("/logout", userController.logoutUser);

router.get("/userWho", userController.userWho);
router.get("/getUser", userController.getUser);

module.exports = router;
