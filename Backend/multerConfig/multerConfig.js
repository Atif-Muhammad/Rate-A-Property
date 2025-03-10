const crypto = require("crypto")
const fs = require("fs")
const path = require("path")
const multer = require("multer")

const mem_storage = multer.memoryStorage();
const upload_memory = multer({ storage: mem_storage });


const dsk_storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // console.log(req.body)
        const { owner } = req.body; 

        // if (!owner || !postId) {
        //     return cb(new Error("Owner ID or Post ID is missing"), null);
        // }

        const uploadPath = path.join("uploads", owner.toString());
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueId = crypto.randomUUID();
        const hash = crypto.createHash("md5").update(uniqueId).digest("hex").slice(0, 8);
        const fileName = `${hash}-${file.originalname}`;
        
        if (!req.fileNames) req.fileNames = []; // Store filenames in request
        req.fileNames.push(fileName);

        cb(null, fileName);
    }
});

// Multer middleware for multiple file uploads
const upload_disk = multer({ storage: dsk_storage });


module.exports = { upload_memory, upload_disk };
