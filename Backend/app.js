require("dotenv").config();
const express = require("express")
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");


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
app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static(path.join(__dirname, "uploads"),{
    setHeaders: (res, path) => {
        if (path.endsWith(".mp4")) {
            res.setHeader("Content-Type", "video/mp4");
        } else if (path.endsWith(".webm")) {
            res.setHeader("Content-Type", "video/webm");
        } else if (path.endsWith(".MOV")) {
            res.setHeader("Content-Type", "video/mov");
        }
    }
    
}));


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


// Initialize GridFS and Export gfs
// const conn = mongoose.connection;
// let gfs;
// conn.once("open", ()=>{
//     gfs = Grid(conn.db, mongoose.mongo);
//     gfs.collection("uploads");
//     module.exports.gfs = gfs;
// });

// module.exports.conn = conn;
