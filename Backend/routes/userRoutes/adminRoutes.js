const express = require("express");
const router = express.Router();


router.get("/", (req, res)=>{
    res.send("Admin's first endpoint")
})



module.exports = router;