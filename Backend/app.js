require("dotenv").config();
const express = require("express")
const cors = require("cors");
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
// const Grid = require("gridfs-stream");
const userRoutes = require("./routes/userRoutes")
const postRoutes = require("./routes/postRoutes")


const app = express();


const allowed_origins = ["http://localhost:5173"]

app.use(cors({
    origin: allowed_origins,
    credentials: true
}))

app.use(cookieParser());
app.use(express.json());

mongoose.connect(process.env.DATABASE_URI).then(result => {
    const port = process.env.PORT || 3000
    app.listen(port,'0.0.0.0', () => {
        console.log("connected to mongoose");
        console.log(`app listenning on port ${port}`);
    });
}).catch(err => {
    console.log(err);
});

app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes)




app.get("/api/bing", (req, res)=>{
    res.status(200).send("bong");
});


// Initialize GridFS and Export `gfs`
// const conn = mongoose.connection;
// let gfs;
// conn.once("open", ()=>{
//     gfs = Grid(conn.db, mongoose.mongo);
//     gfs.collection("uploads");
//     module.exports.gfs = gfs;
// });

// module.exports.conn = conn;