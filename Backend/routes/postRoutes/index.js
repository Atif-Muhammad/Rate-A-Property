const express = require("express");
const router = express.Router();
const clientRoutes = require("./clientRoutes");
// const adminRoutes = require("./adminRoutes");
// const AuthorizeUser = require("../../middlewares/authorizeUser");

// router.use("/admin", AuthorizeUser,adminRoutes)
router.use(clientRoutes)

module.exports = router;
