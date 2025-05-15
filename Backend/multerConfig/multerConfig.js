// const crypto = require("crypto")
// const fs = require("fs")
// const path = require("path")
// const multer = require("multer")

// const mem_storage = multer.memoryStorage();
// const upload_memory = multer({ storage: mem_storage });


// const dsk_storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // console.log(req.body)
//         const { owner } = req.body; 

//         // if (!owner || !postId) {
//         //     return cb(new Error("Owner ID or Post ID is missing"), null);
//         // }

//         const uploadPath = path.join("uploads", owner.toString());
//         if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath, { recursive: true });
//         }
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         const uniqueId = crypto.randomUUID();
//         const hash = crypto.createHash("md5").update(uniqueId).digest("hex").slice(0, 8);
//         const fileName = `${hash}-${file.originalname}`;

//         if (!req.fileNames) req.fileNames = []; // Store filenames in request
//         req.fileNames.push(fileName);

//         cb(null, fileName);
//     }
// });

// // Multer middleware for multiple file uploads
// const upload_disk = multer({ storage: dsk_storage });


// module.exports = { upload_memory, upload_disk };

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const detectNSFW = require("../TensorDetect/DetectNsfw"); // should accept buffer

// Memory storage to keep files in memory temporarily
const mem_storage = multer.memoryStorage();
const upload_memory = multer({ storage: mem_storage })


const nsfwFilterMiddleware = async (req, res, next) => {
  try {
   
    for (const file of req.files) {
      const isNSFW = await detectNSFW(file.buffer);
      if (isNSFW) {
        return res.status(400).json({ error: `NSFW content detected in file: ${file.originalname}` });
      }
    }

    next();
  } catch (err) {
    console.error("NSFW check error:", err);
    res.status(500).json({ error: "Error during NSFW check" });
  }
};

// Save to disk after validation
const saveFilesToDisk = (req, res, next) => {
  try {
    const { owner } = req.body;
    if (!owner) return res.status(400).json({ error: "Missing owner ID" });

    const uploadPath = path.join("uploads", owner.toString());
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    req.savedFiles = [];

    for (const file of req.files) {
      const uniqueId = crypto.randomUUID();
      const hash = crypto.createHash("md5").update(uniqueId).digest("hex").slice(0, 8);
      const fileName = `${hash}-${file.originalname}`;
      const filePath = path.join(uploadPath, fileName);

      fs.writeFileSync(filePath, file.buffer);
      if (!req.fileNames) req.fileNames = [];
      req.fileNames.push(fileName);
    }

    next();
  } catch (err) {
    console.error("File save error:", err);
    res.status(500).json({ error: "Failed to save files" });
  }
};

module.exports = {
  upload_memory,
  nsfwFilterMiddleware,
  saveFilesToDisk,
};
