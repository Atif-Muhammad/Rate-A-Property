const express = require("express");
const router = express.Router();
const adminRoutes = require("./adminRoutes");
const clientRoutes = require("./clientRoutes");
const AuthorizeUser = require("../../middlewares/authorizeUser");

router.use("/admin", AuthorizeUser,adminRoutes)
router.use(clientRoutes)

module.exports = router;
