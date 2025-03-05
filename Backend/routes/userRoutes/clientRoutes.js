const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController")
const uplaod = require("../../multerConfig/multerConfig");
const checkUser = require("../../controllers/checkUser");


router.post("/signup", uplaod.single("image"), userController.createUser);

router.post("/signin", userController.loginUser);

router.post("/logout", userController.logoutUser);

router.get("/userWho", userController.userWho)


module.exports = router;